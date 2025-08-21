let coupons = [];
let points = 0;
let total = 0;

window.addEventListener('userDataReady', () => {
  coupons = window.globaldataCoupon || [];
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
  $('#progressPackages').css('width', (coupons.scanCoupons.length * 10 + '%') || '0%').html((coupons.scanCoupons.length + ' /10 แพ็คเกจ') || '0 /10 แพ็คเกจ');

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
        <div class="d-flex justify-content-center align-items-center flex-column text-secondary mt-5">
          <h1><i class="fa-thin fa-file-slash fa-2xl"></i></h1>
          <span class="mt-4 font-size-14">No reward details found</span>
        </div>
    `;
  }

  const sortedCoupons = [...scanCoupons].sort((a, b) =>
    b.createdAt.seconds - a.createdAt.seconds
  );

  let historyHTML = '<div class="position-relative">';

  sortedCoupons.forEach((coupon, index) => {
    const date = convertTimestampToDate(coupon.createdAt);
    const price = coupon.price || 0;
    const pointsFromThis = Math.floor(price / 100);

    historyHTML += `
      <div class="card mb-3" id="historyCard${index}">
        <div class="card-body">
          <h5 class="card-title">คูปอง ${coupon.barcode}</h5>
          <p class="card-text">ราคา: ${formatPrice(price)}</p>
          <p class="card-text">คะแนนที่ได้รับ: ${pointsFromThis} Points</p>
          <p class="card-text"><small class="text-muted">วันที่: ${formatDate(date)}</small></p>
        </div>
      </div>
    `;
  });

  historyHTML += '</div>';

  return historyHTML;
}