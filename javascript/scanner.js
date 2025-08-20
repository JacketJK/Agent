/**
 * Scanner Page JavaScript
 * จัดการการแสดงข้อมูลผู้ใช้ในหน้า scanner
 */

// ฟังก์ชันสำหรับอัปเดตข้อมูลผู้ใช้ในหน้า scanner
function updateUserInfoInScanner(userData) {
  console.log('อัปเดตข้อมูลผู้ใช้ในหน้า Scanner:', userData);
  
  // สร้างหรืออัปเดต user info overlay
  let userInfoOverlay = document.getElementById('userInfoOverlay');
  
  if (!userInfoOverlay) {
    userInfoOverlay = document.createElement('div');
    userInfoOverlay.id = 'userInfoOverlay';
    userInfoOverlay.className = 'position-absolute top-0 end-0 m-3 z-4';
    userInfoOverlay.style.maxWidth = '200px';
    
    const mainContainer = document.querySelector('.main-container');
    mainContainer.appendChild(userInfoOverlay);
  }
  
  userInfoOverlay.innerHTML = `
    <div class="card border-0 shadow-sm bg-white bg-opacity-90">
      <div class="card-body p-2">
        <div class="d-flex align-items-center">
          <div class="me-2">
            <img src="assets/icons/samitivej_256x256.png" alt="User Profile" 
                 class="rounded-circle userProfile" width="32" height="32">
          </div>
          <div class="flex-grow-1">
            <h6 class="mb-0 font-size-12 fw-semibold userFullname text-dark">${userData.name} ${userData.surname}</h6>
            <small class="text-secondary font-size-10 userMemberId">${userData.memberId || 'ไม่ระบุ'}</small>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // อัปเดตรูปโปรไฟล์
  const userProfileElements = userInfoOverlay.querySelectorAll('.userProfile');
  userProfileElements.forEach(element => {
    if (userData.pictureUrl) {
      element.src = userData.pictureUrl;
    }
  });
}

// ฟังก์ชันสำหรับตรวจสอบสถานะการเข้าสู่ระบบ
function checkLoginStatusForScanner() {
  // ตรวจสอบว่ามีข้อมูลผู้ใช้หรือไม่
  const userData = window.globalUserData || window.getCurrentUser?.();
  
  if (!userData) {
    console.log('ผู้ใช้ยังไม่ได้เข้าสู่ระบบ - redirect ไปหน้า login');
    alert('กรุณาเข้าสู่ระบบก่อนใช้งานฟีเจอร์สแกนคูปอง');
    window.location.href = 'index.html';
    return false;
  }
  
  console.log('ผู้ใช้เข้าสู่ระบบแล้ว:', userData.name);
  return true;
}

// ฟังก์ชันสำหรับรอข้อมูลผู้ใช้
function waitForUserData(callback) {
  // ตรวจสอบว่าข้อมูลผู้ใช้พร้อมแล้วหรือไม่
  if (window.globalUserData) {
    callback(window.globalUserData);
    return;
  }
  
  // รอข้อมูลผู้ใช้จาก filebase.js
  const checkUserData = () => {
    if (window.globalUserData) {
      callback(window.globalUserData);
    } else {
      // รออีก 100ms แล้วตรวจสอบใหม่
      setTimeout(checkUserData, 100);
    }
  };
  
  // เริ่มตรวจสอบหลังจาก 500ms
  setTimeout(checkUserData, 500);
}

// ฟังก์ชันสำหรับแสดงข้อมูลการสแกน
function showScanInfo() {
  const userData = window.globalUserData || window.getCurrentUser?.();
  if (!userData) return;
  
  // สร้าง scan info overlay
  let scanInfoOverlay = document.getElementById('scanInfoOverlay');
  
  if (!scanInfoOverlay) {
    scanInfoOverlay = document.createElement('div');
    scanInfoOverlay.id = 'scanInfoOverlay';
    scanInfoOverlay.className = 'position-absolute bottom-0 start-0 w-100 p-3 z-4';
    
    const mainContainer = document.querySelector('.main-container');
    mainContainer.appendChild(scanInfoOverlay);
  }
  
  scanInfoOverlay.innerHTML = `
    <div class="card border-0 shadow-sm bg-white bg-opacity-90">
      <div class="card-body p-2">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h6 class="mb-1 font-size-12 fw-semibold text-dark">ผู้สแกน: ${userData.name} ${userData.surname}</h6>
            <small class="text-secondary font-size-10">รหัสสมาชิก: ${userData.memberId || 'ไม่ระบุ'}</small>
          </div>
          <div class="text-end">
            <small class="text-success font-size-10">พร้อมสแกน</small>
            <div class="icon-dashborad mt-1" style="width: 16px; height: 16px; margin: 0 auto;">
              <i class="fa-light fa-barcode-read text-success"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ฟังก์ชันสำหรับจัดการการสแกนคูปอง
function handleCouponScan(couponData) {
  const userData = window.globalUserData || window.getCurrentUser?.();
  if (!userData) {
    alert('ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่');
    return;
  }
  
  console.log('สแกนคูปองโดย:', userData.name);
  console.log('ข้อมูลคูปอง:', couponData);
  
  // แสดงผลการสแกน
  showScanResult(couponData, userData);
}

// ฟังก์ชันสำหรับแสดงผลการสแกน
function showScanResult(couponData, userData) {
  // สร้าง modal สำหรับแสดงผลการสแกน
  const scanResultModal = document.createElement('div');
  scanResultModal.className = 'modal fade';
  scanResultModal.id = 'scanResultModal';
  scanResultModal.innerHTML = `
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">ผลการสแกนคูปอง</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <div class="text-center mb-3">
            <div class="icon-dashborad mb-2" style="width: 60px; height: 60px; margin: 0 auto;">
              <i class="fa-light fa-check-circle fa-2x text-success"></i>
            </div>
            <h6 class="fw-semibold text-success">สแกนสำเร็จ!</h6>
          </div>
          
          <div class="card border-0 bg-light">
            <div class="card-body p-3">
              <h6 class="fw-semibold mb-2">ข้อมูลคูปอง</h6>
              <p class="mb-1 font-size-14"><strong>รหัสคูปอง:</strong> ${couponData.code || 'ไม่ระบุ'}</p>
              <p class="mb-1 font-size-14"><strong>ประเภท:</strong> ${couponData.type || 'ไม่ระบุ'}</p>
              <p class="mb-1 font-size-14"><strong>มูลค่า:</strong> ${couponData.value || 'ไม่ระบุ'}</p>
              <p class="mb-0 font-size-14"><strong>วันหมดอายุ:</strong> ${couponData.expiry || 'ไม่ระบุ'}</p>
            </div>
          </div>
          
          <div class="card border-0 bg-light mt-3">
            <div class="card-body p-3">
              <h6 class="fw-semibold mb-2">ข้อมูลผู้สแกน</h6>
              <p class="mb-1 font-size-14"><strong>ชื่อ:</strong> ${userData.name} ${userData.surname}</p>
              <p class="mb-1 font-size-14"><strong>รหัสสมาชิก:</strong> ${userData.memberId || 'ไม่ระบุ'}</p>
              <p class="mb-0 font-size-14"><strong>เวลาสแกน:</strong> ${new Date().toLocaleString('th-TH')}</p>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">ปิด</button>
          <button type="button" class="btn btn-success" onclick="confirmScan()">ยืนยันการสะสมคะแนน</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(scanResultModal);
  
  // แสดง modal
  const modal = new bootstrap.Modal(scanResultModal);
  modal.show();
  
  // ลบ modal หลังจากปิด
  scanResultModal.addEventListener('hidden.bs.modal', () => {
    document.body.removeChild(scanResultModal);
  });
}

// ฟังก์ชันสำหรับยืนยันการสะสมคะแนน
function confirmScan() {
  const userData = window.globalUserData || window.getCurrentUser?.();
  if (!userData) {
    alert('ไม่พบข้อมูลผู้ใช้');
    return;
  }
  
  // ปิด modal
  const modal = bootstrap.Modal.getInstance(document.getElementById('scanResultModal'));
  modal.hide();
  
  // แสดง loading
  showScanLoading();
  
  // จำลองการประมวลผล
  setTimeout(() => {
    hideScanLoading();
    showScanSuccess();
  }, 2000);
}

// ฟังก์ชันสำหรับแสดง loading
function showScanLoading() {
  let loadingOverlay = document.getElementById('scanLoadingOverlay');
  
  if (!loadingOverlay) {
    loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'scanLoadingOverlay';
    loadingOverlay.className = 'position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center z-5';
    loadingOverlay.style.backgroundColor = 'rgba(0,0,0,0.7)';
    
    loadingOverlay.innerHTML = `
      <div class="card border-0 shadow">
        <div class="card-body p-4 text-center">
          <div class="icon-dashborad mb-3" style="width: 60px; height: 60px; margin: 0 auto;">
            <i class="fa-light fa-spinner fa-spin fa-2x text-success"></i>
          </div>
          <h6 class="fw-semibold">กำลังประมวลผล...</h6>
          <p class="text-secondary font-size-14 mb-0">กรุณารอสักครู่</p>
        </div>
      </div>
    `;
    
    document.body.appendChild(loadingOverlay);
  }
  
  loadingOverlay.style.display = 'flex';
}

// ฟังก์ชันสำหรับซ่อน loading
function hideScanLoading() {
  const loadingOverlay = document.getElementById('scanLoadingOverlay');
  if (loadingOverlay) {
    loadingOverlay.style.display = 'none';
  }
}

// ฟังก์ชันสำหรับแสดงผลสำเร็จ
function showScanSuccess() {
  const userData = window.globalUserData || window.getCurrentUser?.();
  
  let successOverlay = document.getElementById('scanSuccessOverlay');
  
  if (!successOverlay) {
    successOverlay = document.createElement('div');
    successOverlay.id = 'scanSuccessOverlay';
    successOverlay.className = 'position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center z-5';
    successOverlay.style.backgroundColor = 'rgba(0,0,0,0.7)';
    
    successOverlay.innerHTML = `
      <div class="card border-0 shadow">
        <div class="card-body p-4 text-center">
          <div class="icon-dashborad mb-3" style="width: 60px; height: 60px; margin: 0 auto;">
            <i class="fa-light fa-check-circle fa-2x text-success"></i>
          </div>
          <h6 class="fw-semibold text-success">สะสมคะแนนสำเร็จ!</h6>
          <p class="text-secondary font-size-14 mb-3">คูปองของคุณได้รับการยืนยันแล้ว</p>
          <button class="btn btn-success rounded-pill" onclick="closeScanSuccess()">ตกลง</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(successOverlay);
  }
  
  successOverlay.style.display = 'flex';
}

// ฟังก์ชันสำหรับปิดผลสำเร็จ
function closeScanSuccess() {
  const successOverlay = document.getElementById('scanSuccessOverlay');
  if (successOverlay) {
    successOverlay.style.display = 'none';
  }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  console.log('=== Scanner Page Loaded ===');
  
  // รอให้ filebase.js โหลดเสร็จก่อน
  setTimeout(() => {
    // รอข้อมูลผู้ใช้และอัปเดต UI ก่อน
    waitForUserData((userData) => {
      if (userData) {
        // ตรวจสอบสถานะการเข้าสู่ระบบหลังจากได้ข้อมูลแล้ว
        if (checkLoginStatusForScanner()) {
          updateUserInfoInScanner(userData);
          showScanInfo();
          console.log('ข้อมูลผู้ใช้พร้อมใช้งานในหน้า Scanner');
        }
      } else {
        console.log('ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
        alert('ไม่สามารถโหลดข้อมูลผู้ใช้ได้ กรุณาเข้าสู่ระบบใหม่');
        window.location.href = 'index.html';
      }
    });
  }, 1000); // รอ 1 วินาทีให้ filebase.js โหลดเสร็จ
  
  // Event listeners สำหรับการเปลี่ยนแปลงข้อมูลผู้ใช้
  window.addEventListener('userDataReady', () => {
    console.log('ข้อมูลผู้ใช้พร้อมใช้งานในหน้า Scanner');
    const userData = window.globalUserData;
    if (userData) {
      updateUserInfoInScanner(userData);
      showScanInfo();
    }
  });
  
  // จำลองการสแกนคูปอง (สำหรับทดสอบ)
  setTimeout(() => {
    const testCouponData = {
      code: 'COUPON123456',
      type: 'ส่วนลด 10%',
      value: '100 บาท',
      expiry: '31/12/2024'
    };
    
    // เพิ่มปุ่มทดสอบการสแกน
    const testButton = document.createElement('button');
    testButton.className = 'btn btn-warning position-absolute top-0 start-0 m-3 z-4';
    testButton.innerHTML = '<i class="fa-light fa-qrcode me-2"></i>ทดสอบสแกน';
    testButton.onclick = () => handleCouponScan(testCouponData);
    
    document.querySelector('.main-container').appendChild(testButton);
  }, 5000); // รอ 5 วินาทีแล้วแสดงปุ่มทดสอบ
});

// Export functions for global use
window.handleCouponScan = handleCouponScan;
window.confirmScan = confirmScan;
window.closeScanSuccess = closeScanSuccess;
