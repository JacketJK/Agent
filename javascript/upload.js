/**
 * Upload Page JavaScript
 * จัดการการแสดงข้อมูลผู้ใช้และการอัพโหลดไฟล์
 */

// ตัวแปรสำหรับเก็บไฟล์ที่เลือก
let selectedFiles = [];

// ฟังก์ชันสำหรับอัปเดตข้อมูลผู้ใช้ในหน้า
function updateUserInfoInUpload(userData) {
  console.log('อัปเดตข้อมูลผู้ใช้ในหน้า Upload:', userData);
  
  // อัปเดตชื่อผู้ใช้
  const userFullnameElements = document.querySelectorAll('.userFullname');
  userFullnameElements.forEach(element => {
    element.textContent = userData.name + ' ' + userData.surname;
  });
  
  // อัปเดตรหัสสมาชิก
  const userMemberIdElements = document.querySelectorAll('.userMemberId');
  userMemberIdElements.forEach(element => {
    element.textContent = `รหัสสมาชิก: ${userData.memberId || 'ไม่ระบุ'}`;
  });
  
  // อัปเดตอีเมล
  const userEmailElements = document.querySelectorAll('.userEmail');
  userEmailElements.forEach(element => {
    element.textContent = `อีเมล: ${userData.email || 'ไม่ระบุ'}`;
  });
  
  // อัปเดตรูปโปรไฟล์
  const userProfileElements = document.querySelectorAll('.userProfile');
  userProfileElements.forEach(element => {
    if (userData.pictureUrl) {
      element.src = userData.pictureUrl;
    }
  });
}

// ฟังก์ชันสำหรับตรวจสอบสถานะการเข้าสู่ระบบ
function checkLoginStatusForUpload() {
  // ตรวจสอบว่ามีข้อมูลผู้ใช้หรือไม่
  const userData = window.globalUserData || window.getCurrentUser?.();
  
  if (!userData) {
    console.log('ผู้ใช้ยังไม่ได้เข้าสู่ระบบ - redirect ไปหน้า login');
    alert('กรุณาเข้าสู่ระบบก่อนใช้งานฟีเจอร์อัพโหลดไฟล์');
    window.location.href = '../index.html';
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

// ฟังก์ชันสำหรับจัดการการเลือกไฟล์
function handleFileSelection(files) {
  selectedFiles = Array.from(files);
  
  if (selectedFiles.length > 0) {
    // แสดงรายการไฟล์
    showFileList();
    // เปิดใช้งานปุ่มอัพโหลด
    document.getElementById('uploadBtn').disabled = false;
  } else {
    // ซ่อนรายการไฟล์
    hideFileList();
    // ปิดใช้งานปุ่มอัพโหลด
    document.getElementById('uploadBtn').disabled = true;
  }
}

// ฟังก์ชันสำหรับแสดงรายการไฟล์
function showFileList() {
  const fileList = document.getElementById('fileList');
  const selectedFilesContainer = document.getElementById('selectedFiles');
  
  fileList.classList.remove('d-none');
  selectedFilesContainer.innerHTML = '';
  
  selectedFiles.forEach((file, index) => {
    const fileItem = createFileItem(file, index);
    selectedFilesContainer.appendChild(fileItem);
  });
}

// ฟังก์ชันสำหรับซ่อนรายการไฟล์
function hideFileList() {
  const fileList = document.getElementById('fileList');
  fileList.classList.add('d-none');
}

// ฟังก์ชันสำหรับสร้างรายการไฟล์
function createFileItem(file, index) {
  const fileItem = document.createElement('div');
  fileItem.className = 'd-flex align-items-center p-2 border rounded-3 mb-2';
  
  // ไอคอนไฟล์ตามประเภท
  const fileIcon = getFileIcon(file.type);
  
  // ขนาดไฟล์
  const fileSize = formatFileSize(file.size);
  
  fileItem.innerHTML = `
    <div class="icon-dashborad me-3">
      <i class="${fileIcon} fa-lg text-secondary"></i>
    </div>
    <div class="flex-grow-1">
      <h6 class="mb-1 font-size-14 fw-semibold">${file.name}</h6>
      <small class="text-secondary">${fileSize} • ${file.type || 'ไม่ระบุประเภท'}</small>
    </div>
    <button class="btn btn-outline-danger btn-sm rounded-pill" onclick="removeFile(${index})">
      <i class="fa-light fa-trash"></i>
    </button>
  `;
  
  return fileItem;
}

// ฟังก์ชันสำหรับลบไฟล์
function removeFile(index) {
  selectedFiles.splice(index, 1);
  
  if (selectedFiles.length > 0) {
    showFileList();
  } else {
    hideFileList();
    document.getElementById('uploadBtn').disabled = true;
  }
}

// ฟังก์ชันสำหรับรับไอคอนไฟล์ตามประเภท
function getFileIcon(fileType) {
  if (fileType.startsWith('image/')) {
    return 'fa-light fa-image';
  } else if (fileType.includes('pdf')) {
    return 'fa-light fa-file-pdf';
  } else if (fileType.includes('word') || fileType.includes('document')) {
    return 'fa-light fa-file-word';
  } else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
    return 'fa-light fa-file-excel';
  } else {
    return 'fa-light fa-file';
  }
}

// ฟังก์ชันสำหรับจัดรูปแบบขนาดไฟล์
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ฟังก์ชันสำหรับอัพโหลดไฟล์
async function uploadFiles() {
  if (selectedFiles.length === 0) {
    alert('กรุณาเลือกไฟล์ก่อนอัพโหลด');
    return;
  }
  
  const userData = window.globalUserData || window.getCurrentUser?.();
  if (!userData) {
    alert('ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่');
    return;
  }
  
  // แสดง progress bar
  showUploadProgress();
  
  try {
    // จำลองการอัพโหลด (ในที่นี้จะแสดง progress เท่านั้น)
    for (let i = 0; i <= 100; i += 10) {
      updateUploadProgress(i);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // เพิ่มไฟล์ลงในประวัติ
    addToUploadHistory(selectedFiles, userData);
    
    // รีเซ็ตฟอร์ม
    resetUploadForm();
    
    alert('อัพโหลดไฟล์สำเร็จ!');
    
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการอัพโหลด:', error);
    alert('เกิดข้อผิดพลาดในการอัพโหลดไฟล์');
  } finally {
    hideUploadProgress();
  }
}

// ฟังก์ชันสำหรับแสดง progress bar
function showUploadProgress() {
  document.getElementById('uploadProgress').classList.remove('d-none');
  document.getElementById('uploadBtn').disabled = true;
}

// ฟังก์ชันสำหรับซ่อน progress bar
function hideUploadProgress() {
  document.getElementById('uploadProgress').classList.add('d-none');
  document.getElementById('uploadBtn').disabled = false;
}

// ฟังก์ชันสำหรับอัปเดต progress
function updateUploadProgress(percentage) {
  const progressBar = document.querySelector('#uploadProgress .progress-bar');
  const progressText = document.querySelector('#uploadProgress small');
  
  progressBar.style.width = percentage + '%';
  progressText.textContent = percentage + '% เสร็จสิ้น';
}

// ฟังก์ชันสำหรับเพิ่มไฟล์ลงในประวัติ
function addToUploadHistory(files, userData) {
  const uploadHistory = document.getElementById('uploadHistory');
  
  // ลบข้อความ "ยังไม่มีประวัติ"
  const noHistoryMessage = uploadHistory.querySelector('.text-center');
  if (noHistoryMessage) {
    noHistoryMessage.remove();
  }
  
  files.forEach(file => {
    const historyItem = createHistoryItem(file, userData);
    uploadHistory.insertBefore(historyItem, uploadHistory.firstChild);
  });
}

// ฟังก์ชันสำหรับสร้างรายการประวัติ
function createHistoryItem(file, userData) {
  const historyItem = document.createElement('div');
  historyItem.className = 'd-flex align-items-center p-2 border rounded-3 mb-2';
  
  const fileIcon = getFileIcon(file.type);
  const fileSize = formatFileSize(file.size);
  const currentTime = new Date().toLocaleString('th-TH');
  
  historyItem.innerHTML = `
    <div class="icon-dashborad me-3">
      <i class="${fileIcon} fa-lg text-success"></i>
    </div>
    <div class="flex-grow-1">
      <h6 class="mb-1 font-size-14 fw-semibold">${file.name}</h6>
      <small class="text-secondary">${fileSize} • อัพโหลดโดย ${userData.name} • ${currentTime}</small>
    </div>
    <span class="badge bg-success rounded-pill font-size-10">สำเร็จ</span>
  `;
  
  return historyItem;
}

// ฟังก์ชันสำหรับรีเซ็ตฟอร์ม
function resetUploadForm() {
  selectedFiles = [];
  hideFileList();
  document.getElementById('uploadBtn').disabled = true;
  document.getElementById('fileInput').value = '';
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  console.log('=== Upload Page Loaded ===');
  
  // รอให้ filebase.js โหลดเสร็จก่อน
  setTimeout(() => {
    // รอข้อมูลผู้ใช้และอัปเดต UI ก่อน
    waitForUserData((userData) => {
      if (userData) {
        // ตรวจสอบสถานะการเข้าสู่ระบบหลังจากได้ข้อมูลแล้ว
        if (checkLoginStatusForUpload()) {
          updateUserInfoInUpload(userData);
          console.log('ข้อมูลผู้ใช้พร้อมใช้งานในหน้า Upload');
        }
      } else {
        console.log('ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
        alert('ไม่สามารถโหลดข้อมูลผู้ใช้ได้ กรุณาเข้าสู่ระบบใหม่');
        window.location.href = '../index.html';
      }
    });
  }, 1000); // รอ 1 วินาทีให้ filebase.js โหลดเสร็จ
  
  // File input change event
  const fileInput = document.getElementById('fileInput');
  fileInput.addEventListener('change', (e) => {
    handleFileSelection(e.target.files);
  });
  
  // Upload button click event
  const uploadBtn = document.getElementById('uploadBtn');
  uploadBtn.addEventListener('click', uploadFiles);
  
  // Drag and drop functionality
  const uploadArea = document.querySelector('.border-dashed');
  
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.backgroundColor = '#e8f5e8';
    uploadArea.style.borderColor = '#198754';
  });
  
  uploadArea.addEventListener('dragleave', (e) => {
    e.preventDefault();
    uploadArea.style.backgroundColor = '#f8f9fa';
    uploadArea.style.borderColor = '#6c757d';
  });
  
  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.backgroundColor = '#f8f9fa';
    uploadArea.style.borderColor = '#6c757d';
    
    const files = e.dataTransfer.files;
    handleFileSelection(files);
  });
  
  // Event listeners สำหรับการเปลี่ยนแปลงข้อมูลผู้ใช้
  window.addEventListener('userDataReady', () => {
    console.log('ข้อมูลผู้ใช้พร้อมใช้งานในหน้า Upload');
    const userData = window.globalUserData;
    if (userData) {
      updateUserInfoInUpload(userData);
    }
  });
});

// Export functions for global use
window.removeFile = removeFile;
window.uploadFiles = uploadFiles;
