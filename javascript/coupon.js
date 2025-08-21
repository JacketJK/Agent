let coupons = [];
let points = 0;
let total = 0;

window.addEventListener('userDataReady', () => {
  coupons = window.globaldataCoupon || [];
  console.log(coupons.scanCoupons);

  coupons.scanCoupons.forEach(coupon => {
    total += coupon.price || 0;
    points = parseInt(total / 100);
  });

  $('.count-packages').text(coupons.scanCoupons.length);
  $('.point-reward').text(points);
  $('#progressPackages').css('width', coupons.scanCoupons.length * 10 + '%').html(coupons.scanCoupons.length + '/10 แพ็คเกจ');

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
