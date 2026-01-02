let coupons = [];
let points = 0;
let total = 0;

window.addEventListener('userDataReady', () => {
  coupons = window.globaldataCoupon || { scanCoupons: [] };
  if (!coupons.scanCoupons) {
    coupons.scanCoupons = [];
  }
  let historyList = document.querySelector('#historyCardsContainer');
  historyList.innerHTML = ''; // เคลียร์ก่อน

  coupons.scanCoupons.forEach(coupon => {
    total += coupon.price || 0;
    points = parseInt(total / 100);
  });

  const historyHTML = generatePointHistory(coupons.scanCoupons);
  $('#historyCardsContainer').html(historyHTML);

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
      const modal = new bootstrap.Modal(document.getElementById('redeemModal'));
      modal.show();

      // ยืนยันการแลก
      document.getElementById('confirmRedeem').onclick = () => {
        alert("แลกรางวัลสำเร็จ: " + pkg.name);
        modal.hide();
      };
    });
  });
}

function convertTimestampToDate(timestamp) {
  return new Date(timestamp.seconds * 1000);
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

function generatePointHistory(scanCoupons) {
  if (!scanCoupons || scanCoupons.length === 0) {
    return `
        <div class="d-flex justify-content-center align-items-center flex-column text-secondary mt-5 py-5">
          <div class="mb-3 opacity-50">
            <i class="fa-light fa-file-slash fa-4x"></i>
          </div>
          <span class="font-size-14 fw-light">ไม่พบประวัติการสะสมคะแนน</span>
        </div>
    `;
  }

  const sortedCoupons = [...scanCoupons].sort((a, b) => {
    const timeA = a.createdAt && a.createdAt.seconds ? a.createdAt.seconds : 0;
    const timeB = b.createdAt && b.createdAt.seconds ? b.createdAt.seconds : 0;
    return timeB - timeA;
  });

  let historyHTML = '<div class="vstack gap-3 pb-5 mb-5">';

  sortedCoupons.forEach((coupon, index) => {
    let date;
    if (coupon.createdAt && coupon.createdAt.seconds) {
      date = convertTimestampToDate(coupon.createdAt);
    } else {
      date = new Date(); // Fallback if no date
    }

    const price = coupon.price || 0;
    const pointsFromThis = Math.floor(price / 100);

    historyHTML += `
      <div class="card rounded-4 border-0 shadow-sm" id="historyCard${index}">
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
  });

  historyHTML += '</div>';
  return historyHTML;
}