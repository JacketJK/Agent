let coupons = [];
let points = 0;
let total = 0;

window.addEventListener('userDataReady', () => {
  coupons = window.globaldataCoupon || { scanCoupons: [], redemptions: [] };
  if (!coupons.scanCoupons) {
    coupons.scanCoupons = [];
  }
  if (!coupons.redemptions) {
    coupons.redemptions = [];
  }

  let historyList = document.querySelector('#historyCardsContainer');
  if (historyList) historyList.innerHTML = ''; // เคลียร์ก่อน

  // Calculate earned points from scans
  total = 0;
  coupons.scanCoupons.forEach(coupon => {
    total += coupon.price || 0;
  });
  let earnedPoints = parseInt(total / 100);

  // Calculate redeemed points
  let redeemedPoints = 0;
  coupons.redemptions.forEach(redemption => {
    redeemedPoints += redemption.point || 0;
  });

  // Net points
  points = earnedPoints - redeemedPoints;

  const historyHTML = generateCombinedHistory(coupons.scanCoupons, coupons.redemptions);
  if ($('#historyCardsContainer').length) {
    $('#historyCardsContainer').html(historyHTML);
  }

  $('.count-packages').text(coupons.scanCoupons.length);
  $('.point-reward').text(points);
  const packageCount = coupons.scanCoupons.length;
  const progressPercentage = Math.min((packageCount % 10) * 10, 100);

  $('#progressPackages').css('width', (progressPercentage + '%') || '0%').html(((packageCount % 10) + '/10 แพ็คเกจ') || '0/10 แพ็คเกจ');
  $('#progressPackages').attr('aria-valuenow', packageCount % 10);

  // Update syringe liquid height
  const liquidElement = document.getElementById('syringeLiquid');
  if (liquidElement) {
    liquidElement.style.height = `${progressPercentage}%`;
  }

  generatePackageCards(packagesAll, points);
});

const generatePackageCards = (packages, points) => {
  const container = document.getElementById('packageCardsContainer');
  if (!container) return;

  let html = '<div class="row row-cols-2 row-cols-md-2 g-2 pb-5">';

  packages.forEach((pkg, index) => {
    const enoughPoints = points >= pkg.point;
    const cardClass = `card h-100 card-package rounded-4 border p-0 overflow-hidden ${enoughPoints ? 'get-reward' : 'non-reward'}`;
    const statusText = enoughPoints ? 'สามารถแลกได้' : 'Samitivej Point ไม่เพียงพอ';
    const clickableAttr = enoughPoints ? `data-index="${index}"` : ''; // ถ้าแลกได้ ให้ใส่ data-index

    html += `
      <div class="col">
        <div class="${cardClass}" ${clickableAttr}>
          <img src="${pkg.img}" class="card-img-top" alt="...">
          <div class="card-body p-2">
            <span class="type-package">${pkg.type}</span>
            <span class="name-package">${pkg.name}</span>
            <span class="expiry-package">${pkg.expiry}</span>
            <div class="point-package">
              <div class="icon-dashborad">
                <i class="fa-light fa-briefcase-medical"></i>
              </div>
              <span>${pkg.point.toLocaleString('th-TH')}</span>
            </div>
            <div class="status-package">
              <span class="text-${enoughPoints ? 'success' : 'danger'}">${statusText}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  html += '</div>';
  container.innerHTML = html;

  // เพิ่ม event listener หลังจาก render เสร็จ
  container.querySelectorAll('.get-reward').forEach(card => {
    card.addEventListener('click', () => {
      const index = card.getAttribute('data-index');
      const pkg = packages[index];
      document.getElementById('selectedReward').innerText = pkg.name + " (" + pkg.point.toLocaleString('th-TH') + " Points)";

      // เปิด Modal
      const modalElement = document.getElementById('redeemModal');
      const modal = new bootstrap.Modal(modalElement);
      modal.show();

      // ยืนยันการแลก
      // Remove previous event listeners to avoid duplicates if re-opened
      const confirmBtn = document.getElementById('confirmRedeem');
      const newConfirmBtn = confirmBtn.cloneNode(true);
      confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

      newConfirmBtn.onclick = async () => {
        try {
          // Check points again just in case
          if (points < pkg.point) {
            alert("คะแนนไม่พอสำหรับการแลกรางวัลนี้");
            modal.hide();
            return;
          }

          const currentUser = window.globalUserData;
          if (!currentUser || !currentUser.lineUserId) {
            alert("ไม่พบข้อมูลผู้ใช้งาน กรุณาลองใหม่อีกครั้ง");
            modal.hide();
            return;
          }

          const db = firebase.firestore();
          const lineUserId = currentUser.lineUserId;

          const redemptionData = {
            name: pkg.name,
            image: pkg.img || "", // Fix: use pkg.img and fallback to empty string
            point: pkg.point,
            pkgIndex: index, // Optional: store index
            createdAt: firebase.firestore.Timestamp.now(), // Firestore timestamp
            type: 'redemption'
          };

          // 1. Update Firestore
          // We assume 'coupons' collection stores user's coupon data
          const userRef = db.collection("coupons").doc(lineUserId);

          // We use arrayUnion to add to the 'redemptions' array field
          await userRef.update({
            redemptions: firebase.firestore.FieldValue.arrayUnion(redemptionData)
          });

          // 2. Update Local State
          if (!coupons.redemptions) coupons.redemptions = [];

          // Use a local object with date for immediate display
          const localRedemption = {
            ...redemptionData,
            createdAt: new Date() // Use JS Date for current session display
          };
          coupons.redemptions.push(localRedemption);

          // Re-calculate points locally
          points -= pkg.point;

          // 3. Update UI
          $('.point-reward').text(points);

          // Regenerate history
          const historyHTML = generateCombinedHistory(coupons.scanCoupons, coupons.redemptions);
          $('#historyCardsContainer').html(historyHTML);

          // Regenerate cards (to update availability)
          generatePackageCards(packages, points);

          alert("แลกรางวัลสำเร็จ: " + pkg.name);
          modal.hide();

        } catch (error) {
          console.error("Error redeeming reward: ", error);
          if (error.code === 'not-found') {
            // Handle case where document doesn't exist yet (unlikely if they have points)
            alert("ไม่พบข้อมูลผู้ใช้ในระบบ");
          } else {
            alert("เกิดข้อผิดพลาดในการแลกรางวัล: " + error.message);
          }
        }
      };
    });
  });
}

function convertTimestampToDate(timestamp) {
  if (!timestamp) return new Date();
  if (timestamp instanceof Date) return timestamp; // Already a Date object
  if (timestamp.toDate && typeof timestamp.toDate === 'function') return timestamp.toDate(); // Firestore Timestamp
  if (timestamp.seconds) return new Date(timestamp.seconds * 1000); // Has seconds
  return new Date();
}

function formatPrice(price) {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB'
  }).format(price);
}

function formatDate(date) {
  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function generateCombinedHistory(scanCoupons, redemptions) {
  const allItems = [];

  // Process Scans (Earnings)
  if (scanCoupons && scanCoupons.length > 0) {
    scanCoupons.forEach(coupon => {
      allItems.push({
        type: 'earn',
        data: coupon,
        date: coupon.createdAt
      });
    });
  }

  // Process Redemptions (Spending)
  if (redemptions && redemptions.length > 0) {
    redemptions.forEach(redemption => {
      allItems.push({
        type: 'redeem',
        data: redemption,
        date: redemption.createdAt
      });
    });
  }

  if (allItems.length === 0) {
    return `
        <div class="d-flex justify-content-center align-items-center flex-column text-secondary mt-5 py-5">
          <div class="mb-3 opacity-50">
            <i class="fa-light fa-file-slash fa-4x"></i>
          </div>
          <span class="font-size-14 fw-light">ไม่พบประวัติการทำรายการ</span>
        </div>
    `;
  }

  // Sort by date descending
  const sortedItems = allItems.sort((a, b) => {
    const timeA = convertTimestampToDate(a.date).getTime();
    const timeB = convertTimestampToDate(b.date).getTime();
    return timeB - timeA;
  });

  let historyHTML = '<div class="vstack gap-3 pb-5 mb-5">';

  sortedItems.forEach((item, index) => {
    const date = convertTimestampToDate(item.date);

    if (item.type === 'earn') {
      const coupon = item.data;
      const price = coupon.price || 0;
      const pointsFromThis = Math.floor(price / 100);

      historyHTML += `
        <div class="card rounded-4 border-0 shadow-sm" id="historyCardEarn${index}">
          <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-center">
              <div class="d-flex align-items-center">
                <div class="rounded-circle bg-success-subtle p-2 me-3 d-flex align-items-center justify-content-center" style="width: 48px; height: 48px;">
                  <i class="fa-solid fa-receipt text-success fa-lg"></i>
                </div>
                <div>
                  <h6 class="fw-bold mb-0 text-dark">ได้รับคะแนนสะสม</h6>
                  <p class="text-secondary font-size-12 mb-0">รหัสคูปอง: ${coupon.barcode || '-'}</p>
                  <small class="text-muted font-size-10 opacity-75">${formatDate(date)}</small>
                </div>
              </div>
              <div class="text-end">
                <div class="fs-5 fw-bold text-success">+${pointsFromThis}</div>
                <div class="font-size-10 text-secondary">Points</div>
              </div>
            </div>
          </div>
        </div>
      `;
    } else {
      // Redemption
      const redemption = item.data;
      const pointsUsed = redemption.point || 0;

      historyHTML += `
        <div class="card rounded-4 border-0 shadow-sm" id="historyCardRedeem${index}">
          <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-center">
              <div class="d-flex align-items-center">
                <div class="rounded-circle bg-warning-subtle p-2 me-3 d-flex align-items-center justify-content-center" style="width: 48px; height: 48px;">
                  <i class="fa-solid fa-gift text-warning fa-lg"></i>
                </div>
                <div>
                  <h6 class="fw-bold mb-0 text-dark">แลกของรางวัล</h6>
                  <p class="text-secondary font-size-12 mb-0">${redemption.name}</p>
                  <small class="text-muted font-size-10 opacity-75">${formatDate(date)}</small>
                </div>
              </div>
              <div class="text-end">
                <div class="fs-5 fw-bold text-danger">-${pointsUsed.toLocaleString()}</div>
                <div class="font-size-10 text-secondary">Points</div>
              </div>
            </div>
          </div>
        </div>
      `;
    }
  });

  historyHTML += '</div>';
  return historyHTML;
}