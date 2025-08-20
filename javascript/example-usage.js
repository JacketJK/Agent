/**
 * ตัวอย่างการใช้งาน userDataManager.js ในหน้าอื่นๆ
 * ไฟล์นี้แสดงวิธีการเข้าถึงข้อมูลผู้ใช้จาก window.globalUserData
 */

// ตัวอย่างที่ 1: เข้าถึงข้อมูลผู้ใช้ทันที
function displayUserInfo() {
  const userData = getUserData();
  if (userData) {
    console.log('ข้อมูลผู้ใช้:', userData);
    console.log('ชื่อ:', userData.name);
    console.log('อีเมล:', userData.email);
    console.log('เบอร์โทร:', userData.phone);
  } else {
    console.log('ยังไม่มีข้อมูลผู้ใช้');
  }
}

// ตัวอย่างที่ 2: รอข้อมูลผู้ใช้พร้อมใช้งาน
function waitForUserAndDisplay() {
  waitForUserData((userData) => {
    if (userData) {
      console.log('ข้อมูลผู้ใช้พร้อมใช้งาน:', userData);
      // ทำอะไรกับข้อมูลผู้ใช้ที่นี่
      updateUIWithUserData(userData);
    } else {
      console.log('ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
    }
  });
}

// ตัวอย่างที่ 3: ตรวจสอบสถานะการเข้าสู่ระบบ
function checkLoginStatus() {
  if (isUserLoggedIn()) {
    console.log('ผู้ใช้เข้าสู่ระบบแล้ว');
    const userData = getUserData();
    console.log('ข้อมูลผู้ใช้:', userData);
  } else {
    console.log('ผู้ใช้ยังไม่ได้เข้าสู่ระบบ');
  }
}

// ตัวอย่างที่ 4: อัปเดตข้อมูลผู้ใช้
function updateUserProfile(newName, newEmail) {
  updateUserData({
    name: newName,
    email: newEmail
  });
  console.log('อัปเดตข้อมูลผู้ใช้เรียบร้อย');
}

// ตัวอย่างที่ 5: รับข้อมูลเฉพาะฟิลด์
function getUserSpecificInfo() {
  const userName = getUserField('name');
  const userEmail = getUserField('email');
  const userPhone = getUserField('phone');
  
  console.log('ชื่อ:', userName);
  console.log('อีเมล:', userEmail);
  console.log('เบอร์โทร:', userPhone);
}

// ตัวอย่างที่ 6: ใช้แบบ async/await
async function getUserDataAsyncExample() {
  try {
    const userData = await getUserDataAsync();
    if (userData) {
      console.log('ข้อมูลผู้ใช้ (async):', userData);
      return userData;
    } else {
      console.log('ไม่พบข้อมูลผู้ใช้');
      return null;
    }
  } catch (error) {
    console.error('เกิดข้อผิดพลาด:', error);
    return null;
  }
}

// ตัวอย่างที่ 7: อัปเดต UI ด้วยข้อมูลผู้ใช้
function updateUIWithUserData(userData) {
  // อัปเดตชื่อผู้ใช้ในหน้า
  const userNameElements = document.querySelectorAll('.userName');
  userNameElements.forEach(element => {
    element.textContent = userData.name || '';
  });
  
  // อัปเดตอีเมลผู้ใช้
  const userEmailElements = document.querySelectorAll('.userEmail');
  userEmailElements.forEach(element => {
    element.textContent = userData.email || '';
  });
  
  // อัปเดตเบอร์โทรผู้ใช้
  const userPhoneElements = document.querySelectorAll('.userPhone');
  userPhoneElements.forEach(element => {
    element.textContent = userData.phone || '';
  });
  
  // อัปเดตรูปโปรไฟล์
  const userProfileElements = document.querySelectorAll('.userProfile');
  userProfileElements.forEach(element => {
    if (userData.pictureUrl) {
      element.src = userData.pictureUrl;
    }
  });
}

// ตัวอย่างที่ 8: Event listeners สำหรับการเปลี่ยนแปลงข้อมูล
function setupUserDataEventListeners() {
  // เมื่อข้อมูลผู้ใช้พร้อมใช้งาน
  window.addEventListener('userDataReady', (event) => {
    console.log('ข้อมูลผู้ใช้พร้อมใช้งาน');
    const userData = getUserData();
    updateUIWithUserData(userData);
  });
  
  // เมื่อข้อมูลผู้ใช้มีการอัปเดต
  window.addEventListener('userDataUpdated', (event) => {
    console.log('ข้อมูลผู้ใช้มีการอัปเดต:', event.detail);
    updateUIWithUserData(event.detail);
  });
  
  // เมื่อข้อมูลผู้ใช้ถูกล้าง
  window.addEventListener('userDataCleared', () => {
    console.log('ข้อมูลผู้ใช้ถูกล้าง');
    // ล้าง UI หรือ redirect ไปหน้า login
  });
}

// ตัวอย่างที่ 9: ฟังก์ชันสำหรับตรวจสอบสิทธิ์
function checkUserPermission(requiredPermission) {
  const userData = getUserData();
  if (!userData) {
    return false;
  }
  
  // ตรวจสอบสิทธิ์ตามข้อมูลผู้ใช้
  // ตัวอย่าง: ตรวจสอบว่าผู้ใช้เป็น admin หรือไม่
  if (requiredPermission === 'admin') {
    return userData.role === 'admin';
  }
  
  // ตรวจสอบสิทธิ์อื่นๆ
  return true;
}

// ตัวอย่างที่ 10: ฟังก์ชันสำหรับออกจากระบบ
function logout() {
  clearUserData();
  // redirect ไปหน้า login หรือหน้าหลัก
  window.location.href = 'register.html';
}

// เรียกใช้ฟังก์ชันตัวอย่างเมื่อโหลดหน้า
document.addEventListener('DOMContentLoaded', () => {
  console.log('=== ตัวอย่างการใช้งาน userDataManager.js ===');
  
  // ตั้งค่า event listeners
  setupUserDataEventListeners();
  
  // ตรวจสอบสถานะการเข้าสู่ระบบ
  checkLoginStatus();
  
  // รอข้อมูลผู้ใช้และแสดงผล
  waitForUserAndDisplay();
});

// Export ฟังก์ชันสำหรับใช้ในไฟล์อื่น
window.displayUserInfo = displayUserInfo;
window.waitForUserAndDisplay = waitForUserAndDisplay;
window.checkLoginStatus = checkLoginStatus;
window.updateUserProfile = updateUserProfile;
window.getUserSpecificInfo = getUserSpecificInfo;
window.getUserDataAsyncExample = getUserDataAsyncExample;
window.updateUIWithUserData = updateUIWithUserData;
window.checkUserPermission = checkUserPermission;
window.logout = logout;
