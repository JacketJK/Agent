const changePageBtn = document.querySelectorAll('.manu-button');

changePageBtn.forEach((button, index) => {
  button.addEventListener('click', function () {
    changePageBtn.forEach(btn => btn.classList.remove('active'));
    this.classList.add('active');

    document.querySelectorAll('[id^="pageDisplay"]').forEach(page => {
      page.style.display = 'none';
    });

    document.getElementById('pageDisplay' + (index + 1)).style.display = 'block';
  });
});

const backToHomePage = () => {
  changePageBtn.forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('[id^="pageDisplay"]').forEach(page => {
    page.style.display = 'none';
  });

  changePageBtn[0].classList.add('active');

  document.getElementById('pageDisplay1').style.display = 'block';
}

const togglePageReward = (page) => {
  const toggleBtn = document.querySelectorAll('.togglePageReward-tabs .nav-link');

  toggleBtn.forEach((btn, idx) => {
    btn.classList.toggle('active', idx + 1 === page);
  });

  document.querySelectorAll('[id^="pointPage"]').forEach(section => {
    section.style.display = 'none';
  });

  const target = document.getElementById('pointPage' + page);
  if (target) {
    target.style.display = 'block';
  }
}

const togglePageCoupon = (page) => {
  const toggleBtn = document.querySelectorAll('.togglePageCoupon-tabs .nav-link');

  toggleBtn.forEach((btn, idx) => {
    btn.classList.toggle('active', idx + 1 === page);
  });

  document.querySelectorAll('[id^="couponPage"]').forEach(section => {
    section.style.display = 'none';
  });

  const target = document.getElementById('couponPage' + page);
  if (target) {
    target.style.display = 'block';
  }
}

// Build main banner carousel dynamically from assets/banner/ list
document.addEventListener('DOMContentLoaded', async () => {
  const carousel = document.getElementById('mainBannerCarousel');
  if (!carousel) return;

  const inner = carousel.querySelector('.carousel-inner');
  const indicators = carousel.querySelector('.carousel-indicators');
  if (!inner || !indicators) return;

  const buildCarousel = (filenames) => {
    const imageFiles = filenames
      .filter(name => /\.(png|jpe?g|webp|gif)$/i.test(name))
      .sort((a, b) => b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' }));

    inner.innerHTML = '';
    indicators.innerHTML = '';

    imageFiles.forEach((filename, index) => {
      const isActive = index === 0;
      const item = document.createElement('div');
      item.className = 'carousel-item' + (isActive ? ' active' : '');
      const img = document.createElement('img');
      img.src = `assets/banner/${filename}`;
      img.alt = `Banner ${filename}`;
      img.className = 'd-block w-100';
      item.appendChild(img);
      inner.appendChild(item);

      const indicator = document.createElement('button');
      indicator.type = 'button';
      indicator.setAttribute('data-bs-target', '#mainBannerCarousel');
      indicator.setAttribute('data-bs-slide-to', String(index));
      indicator.setAttribute('aria-label', `Slide ${index + 1}`);
      if (isActive) {
        indicator.classList.add('active');
        indicator.setAttribute('aria-current', 'true');
      }
      indicators.appendChild(indicator);
    });
  };

  try {
    const response = await fetch('assets/banner/banners.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to load banners.json');
    const files = await response.json();
    buildCarousel(files);
  } catch (_) {
    buildCarousel([
      '1748754646.jpg',
      '1729847904.jpg',
      '1701074117.jpg',
      '1701068147.jpg',
      '1680078626.jpg',
      '1643696106.jpg'
    ]);
  }
});

// Build main package carousel dynamically from assets/packages/packages.json
document.addEventListener('DOMContentLoaded', async () => {
  const packageCarousel = document.getElementById('mainPackageCarousel');
  if (!packageCarousel) return;

  const inner = packageCarousel.querySelector('.carousel-inner');
  const indicators = packageCarousel.querySelector('.carousel-indicators');
  if (!inner || !indicators) return;

  const buildPackageCarousel = (packages) => {
    inner.innerHTML = '';
    indicators.innerHTML = '';

    packages.forEach((pkg, index) => {
      const isActive = index === 0;
      const item = document.createElement('div');
      item.className = 'carousel-item' + (isActive ? ' active' : '');

      const currentPrice = Number(pkg.price);
      const originalPrice = typeof pkg.originalPrice === 'number' ? Number(pkg.originalPrice) : currentPrice;
      const hasDiscount = originalPrice > currentPrice;

      const priceInfoHtml = hasDiscount
        ? `<span class="font-size-10 fw-light text-secondary text-nowrap">ราคาปกติ <span class="text-decoration-line-through">${originalPrice.toLocaleString('th-TH')}</span> บาท</span>`
        : `<span class="font-size-10 fw-light text-secondary text-nowrap">ราคารวมค่าแพทย์และค่าบริการแล้ว</span>`;

      item.innerHTML = `
        <div class="d-flex justify-content-start row g-0">
          <div class="col-5">
            <div class="ratio ratio-1x1 rounded-start-3 rounded-3 overflow-hidden">
              <img src="${pkg.image}" class="d-block h-100 object-fit-cover" alt="${pkg.name}">
            </div>
          </div>
          <div class="col-7 d-flex flex-column py-2 px-3">
            <h6 class="fw-semibold font-size-14 text-cutting">${pkg.name}</h6>
            <span class="font-size-12 fw-light text-secondary text-nowrap">${pkg.category ?? ''}</span>
            <div class="bg-color-secondary rounded-3 mt-2 p-3">
              <div class="d-flex flex-column">
                <h5 class="fw-light font-size-14"><span class="fw-semibold text-gold fs-5">${currentPrice.toLocaleString('th-TH')} บาท</span> / ชุด</h5>
                ${priceInfoHtml}
              </div>
            </div>
          </div>
        </div>`;

      inner.appendChild(item);

      const indicator = document.createElement('button');
      indicator.type = 'button';
      indicator.setAttribute('data-bs-target', '#mainPackageCarousel');
      indicator.setAttribute('data-bs-slide-to', String(index));
      indicator.setAttribute('aria-label', `Slide ${index + 1}`);
      if (isActive) {
        indicator.classList.add('active');
        indicator.setAttribute('aria-current', 'true');
      }
      indicators.appendChild(indicator);
    });
  };

  try {
    const response = await fetch('assets/packages/packages.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to load packages.json');
    const packages = await response.json();
    buildPackageCarousel(packages);
  } catch (_) {
    buildPackageCarousel([
      {
        name: 'แพ็กเกจตรวจสุขภาพประจำปี',
        image: 'assets/packages/health-checkup.jpg',
        price: 1500,
        originalPrice: 2000,
        category: 'ตรวจสุขภาพ'
      },
      {
        name: 'แพ็กเกจตรวจเบาหวานและความดันโลหิต',
        image: 'assets/packages/diabetes-check.jpg',
        price: 1200,
        originalPrice: 1500,
        category: 'ตรวจโรค'
      },
      {
        name: 'แพ็กเกจตรวจภูมิแพ้และภูมิคุ้มกัน',
        image: 'assets/packages/allergy-test.jpg',
        price: 1800,
        originalPrice: 2200,
        category: 'ตรวจโรค'
      }
    ]);
  }
});

const backToHomePageMain = () => {
  window.location.href = '../index.html';

  changePageBtn.forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('[id^="pageDisplay"]').forEach(page => {
    page.style.display = 'none';
  });

  changePageBtn[0].classList.add('active');
  document.getElementById('pageDisplay1').style.display = 'block';
};

const clicktocouponPage = () => {
  changePageBtn.forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('[id^="pageDisplay"]').forEach(page => {
    page.style.display = 'none';
  });

  changePageBtn[2].classList.add('active');
  document.getElementById('pageDisplay3').style.display = 'block';
};

const packagesAll = [
  {
    img: "https://lh3.googleusercontent.com/d/1lXgV2CIlNRUuhpMgcBm5BWMNGwN3Kfb9",
    type: "โปรแกรมสุขภาพดีสมิติเวชชลบุรี",
    name: "โปรแกรมตรวจสุขภาพ 18 รายการ ครบรอบ 9 ปี สมิติเวช ชลบุรี",
    expiry: "Expiry 180 Days",
    point: 3988
  },
  {
    img: "https://lh3.googleusercontent.com/d/1odMmMAXOWKJcFJsqtPMIl57eTfTcx1Zg",
    type: "โปรแกรมสุขภาพดีสมิติเวชชลบุรี",
    name: "MRI Brain ตรวจคัดกรองความเสี่ยงโรคทางสมอง ด้วยคลื่นแม่เหล็กไฟฟ้า",
    expiry: "Expiry 180 Days",
    point: 8988
  },
  {
    img: "https://lh3.googleusercontent.com/d/1zDuRzGbiUyWYDqcCtfqgQTn9miOxT8Xd",
    type: "โปรแกรมสุขภาพดีสมิติเวชชลบุรี",
    name: "ครบรอบ 9 ปี ตรวจคัดกรองมะเร็งเต้านมด้วยเครื่องดิจิทัล และ ตรวจอัลตร้าซาวด์เต้านม สำหรับผู้หญิงอายุ 35 ปี ขึ้นไป",
    expiry: "Expiry 180 Days",
    point: 1698
  },
  {
    img: "https://lh3.googleusercontent.com/d/15wtxKzrzJBaYBWcV0z6HQRhgVbOJFRrX",
    type: "แพ็คเกจสุขภาพ",
    name: "โปรแกรมส่องกล้องทางเดินอาหารส่วนบนด้วยเทคโนโลยี AI",
    expiry: "Expiry 180 Days",
    point: 9988
  },
  {
    img: "https://lh3.googleusercontent.com/d/190AQieWSpbL-3mKUlxxSAF9IbYjMwzWs",
    type: "แพ็คเกจสุขภาพ",
    name: "Fast track Check up สะดวก รวดเร็ว 30 นาที รอฟังผลที่บ้าน (เฉพาะซื้อทาง Online เท่านั้น)",
    expiry: "Expiry 180 Days",
    point: 2988
  },
  {
    img: "https://lh3.googleusercontent.com/d/1jsHecl85xdRAE42upq6tmfg1R1GjcahD",
    type: "แพ็คเกจสุขภาพ",
    name: "โปรแกรมตรวจสุขภาพประจำปีสำหรับอายุ 25-35 ปี",
    expiry: "Expiry 180 Days",
    point: 9480
  },
  {
    img: "https://lh3.googleusercontent.com/d/1hiJYCBSsIW2nB7XmsBeHql2x9ud8z3vX",
    type: "แพ็คเกจทั่วไป",
    name: "โปรแกรมการรักษาภูมิแพ้ด้วยคลื่นความถี่วิทยุ",
    expiry: "Expiry 180 Days",
    point: 23588
  },
  {
    img: "https://lh3.googleusercontent.com/d/1QHgQrax9tF4PcHg02kTt3eEAjlwO4bmG",
    type: "สุขภาพสตรี",
    name: "วัคซีนป้องกันมะเร็งปากมดลูก 4 สายพันธุ์ (3 เข็ม) HPV vaccine-4 valent",
    expiry: "Expiry 180 Days",
    point: 8500
  },
  {
    img: "https://lh3.googleusercontent.com/d/1H7XBsI5GCVz162VFe_-5sMxkhF_2bqwA",
    type: "วัคซีน",
    name: "วัคซีนป้องกันงูสวัด ชนิดใหม่ (RZV)",
    expiry: "Expiry 180 Days",
    point: 13800
  }
];

const generatePackageCards = (packages) => {
  const container = document.getElementById('packageCardsContainer');
  let html = '<div class="row row-cols-2 row-cols-md-2 g-2 pb-5">';
  packages.forEach(pkg => {
    html += `
      <div class="col">
        <div class="card h-100 card-package rounded-4 border p-0 overflow-hidden gray-filter">
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
              <span>Samitivej Point ไม่เพียงพอ</span>
            </div>
          </div>
        </div>
      </div>
    `;
  });
  html += '</div>';
  container.innerHTML = html;
}

async function getLineUserProfile() {
  try {
    const profile = await liff.getProfile();
    const lineUserId = profile.userId;
    const lineProfile = {
      displayName: profile.displayName,
      pictureUrl: profile.pictureUrl,
      statusMessage: profile.statusMessage || ""
    };

    console.log("LINE User ID:", lineUserId);
    console.log("LINE Profile:", lineProfile);

    // ตัวอย่างส่งข้อมูลไปบันทึก
    const formData = {
      name: "สมชาย ตัวอย่าง",
      email: "somchai@example.com"
    };

    // submitRegistration(formData, lineUserId, lineProfile);

  } catch (err) {
    console.error('Error getting profile: ', err);
  }
}

// Function to submit registration data to Google Sheets via Apps Script Web App
async function submitRegistration(formData, lineUserId, lineProfile) {
  console.log("Submitting registration data...");
  console.log("formData" + lineUserId);
  console.log("formData" + lineProfile);
}

const firebaseConfig = {
  apiKey: "AIzaSyDW0AwKbYa1coRKP_lYDSB9GXCZVq2JwYo",
  authDomain: "activity-log-9da9b.firebaseapp.com",
  databaseURL: "https://activity-log-9da9b-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "activity-log-9da9b",
  storageBucket: "activity-log-9da9b.firebasestorage.app",
  messagingSenderId: "302930477910",
  appId: "1:302930477910:web:c35e578b8b9f57062f8cf7"
};

const app = firebase.initializeApp(firebaseConfig);
const db = firebase.database();

document.getElementById('registrationForm').addEventListener('submit', () => {
  const name = document.getElementById('name').value;
  if (!name) return alert("กรุณากรอกชื่อ");

  // push ข้อมูลเข้า path 'users'
  db.ref('users').push({
    name: name,
    timestamp: Date.now()
  }).then(() => {
    document.getElementById('name').value = '';
  });
});