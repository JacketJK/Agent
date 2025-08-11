const changePageBtn = document.querySelectorAll('.manu-button');

changePageBtn.forEach((button, index) => {
  button.addEventListener('click', function() {
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

      const namePackage = pkg.name.split(' ').slice(0, 3).join(' ') + (pkg.name.split(' ').length > 3 ? '...' : '');

      const priceInfoHtml = hasDiscount
        ? `<span class="font-size-10 fw-light text-secondary text-nowrap">ราคาปกติ <span class="text-decoration-line-through">${originalPrice.toLocaleString('th-TH')}</span> บาท</span>`
        : `<span class="font-size-10 fw-light text-secondary text-nowrap">ราคารวมค่าแพทย์และค่าบริการแล้ว</span>`;

      item.innerHTML = `
        <div class="d-flex justify-content-start row g-0">
          <div class="col-5">
            <div class="ratio ratio-1x1 rounded-start-3 rounded-3 overflow-hidden w-180">
              <img src="${pkg.image}" class="d-block h-100" alt="${pkg.name}">
            </div>
          </div>
          <div class="col d-flex flex-column py-2 px-3">
            <h6 class="fw-semibold font-size-14 text-cutting">${namePackage}</h6>
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