/**
 * Invite Friends Page JavaScript
 * จัดการการแสดงข้อมูลผู้ใช้และฟังก์ชันการเชิญเพื่อน
 */

// ตัวแปรสำหรับเก็บข้อมูลการเชิญ
let inviteStats = {
  totalInvites: 0,
  successfulInvites: 0,
  totalRewards: 0
};

// ฟังก์ชันสำหรับอัปเดตข้อมูลผู้ใช้ในหน้า
function updateUserInfoInInvite(userData) {
  console.log('อัปเดตข้อมูลผู้ใช้ในหน้า Invite:', userData);
  
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
function checkLoginStatusForInvite() {
  // ตรวจสอบว่ามีข้อมูลผู้ใช้หรือไม่
  const userData = window.globalUserData || window.getCurrentUser?.();
  
  if (!userData) {
    console.log('ผู้ใช้ยังไม่ได้เข้าสู่ระบบ - redirect ไปหน้า login');
    alert('กรุณาเข้าสู่ระบบก่อนใช้งานฟีเจอร์เชิญเพื่อน');
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

// ฟังก์ชันสำหรับแชร์ผ่าน LINE
function shareToLine() {
  const userData = window.globalUserData || window.getCurrentUser?.();
  if (!userData) {
    alert('กรุณาเข้าสู่ระบบก่อนใช้งานฟีเจอร์นี้');
    return;
  }

  const inviteLink = generateInviteLink(userData);
  const message = `สวัสดี! ฉันขอเชิญคุณมาใช้ Samitivej Point กับฉัน\n\n${inviteLink}\n\nรับรางวัลพิเศษเมื่อลงทะเบียนสำเร็จ! 🎁`;
  
  // ใช้ LINE Share API
  if (liff && liff.isLoggedIn()) {
    liff.shareTargetPicker([
      {
        type: 'text',
        text: message
      }
    ]).then(() => {
      console.log('แชร์ผ่าน LINE สำเร็จ');
      recordInviteAction('line_share', userData);
    }).catch((err) => {
      console.error('เกิดข้อผิดพลาดในการแชร์:', err);
      // Fallback: เปิด LINE ในเบราว์เซอร์
      const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(message)}`;
      window.open(lineUrl, '_blank');
    });
  } else {
    // Fallback: เปิด LINE ในเบราว์เซอร์
    const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(message)}`;
    window.open(lineUrl, '_blank');
  }
}

// ฟังก์ชันสำหรับคัดลอกลิงก์เชิญ
function copyInviteLink() {
  const userData = window.globalUserData || window.getCurrentUser?.();
  if (!userData) {
    alert('กรุณาเข้าสู่ระบบก่อนใช้งานฟีเจอร์นี้');
    return;
  }

  const inviteLink = generateInviteLink(userData);
  
  // ใช้ Clipboard API
  if (navigator.clipboard) {
    navigator.clipboard.writeText(inviteLink).then(() => {
      alert('คัดลอกลิงก์เชิญแล้ว!');
      recordInviteAction('copy_link', userData);
    }).catch(err => {
      console.error('เกิดข้อผิดพลาดในการคัดลอก:', err);
      fallbackCopyTextToClipboard(inviteLink);
    });
  } else {
    fallbackCopyTextToClipboard(inviteLink);
  }
}

// Fallback สำหรับการคัดลอกข้อความ
function fallbackCopyTextToClipboard(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  try {
    document.execCommand('copy');
    alert('คัดลอกลิงก์เชิญแล้ว!');
    recordInviteAction('copy_link', window.globalUserData);
  } catch (err) {
    console.error('เกิดข้อผิดพลาดในการคัดลอก:', err);
    alert('ไม่สามารถคัดลอกลิงก์ได้ กรุณาคัดลอกด้วยตนเอง');
  }
  
  document.body.removeChild(textArea);
}

// ฟังก์ชันสำหรับแสดง QR Code
function showQRCode() {
  const userData = window.globalUserData || window.getCurrentUser?.();
  if (!userData) {
    alert('กรุณาเข้าสู่ระบบก่อนใช้งานฟีเจอร์นี้');
    return;
  }

  const inviteLink = generateInviteLink(userData);
  
  // สร้าง QR Code
  const qrContainer = document.getElementById('qrCodeContainer');
  qrContainer.innerHTML = '';
  
  QRCode.toCanvas(qrContainer, inviteLink, {
    width: 200,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  }, function (error) {
    if (error) {
      console.error('เกิดข้อผิดพลาดในการสร้าง QR Code:', error);
      qrContainer.innerHTML = '<div class="alert alert-danger">ไม่สามารถสร้าง QR Code ได้</div>';
    } else {
      recordInviteAction('qr_code', userData);
    }
  });
  
  // แสดง Modal
  const modal = new bootstrap.Modal(document.getElementById('qrCodeModal'));
  modal.show();
}

// ฟังก์ชันสำหรับดาวน์โหลด QR Code
function downloadQRCode() {
  const canvas = document.querySelector('#qrCodeContainer canvas');
  if (!canvas) return;
  
  const link = document.createElement('a');
  link.download = 'invite-qr-code.png';
  link.href = canvas.toDataURL();
  link.click();
}

// ฟังก์ชันสำหรับสร้างลิงก์เชิญ
function generateInviteLink(userData) {
  const baseUrl = window.location.origin + window.location.pathname.replace('/other/invite.html', '');
  const inviteCode = userData.memberId || userData.lineUserId;
  return `${baseUrl}/register.html?ref=${inviteCode}`;
}

// ฟังก์ชันสำหรับบันทึกการกระทำการเชิญ
function recordInviteAction(action, userData) {
  // บันทึกลง Firestore
  if (window.firebase && window.firebase.firestore) {
    const db = window.firebase.firestore();
    const inviteRef = db.collection('invites').doc();
    
    const inviteData = {
      inviterId: userData.lineUserId,
      inviterName: userData.name + ' ' + userData.surname,
      action: action,
      timestamp: Date.now(),
      status: 'pending'
    };
    
    inviteRef.set(inviteData).then(() => {
      console.log('บันทึกการเชิญสำเร็จ');
      updateInviteStats();
    }).catch(error => {
      console.error('เกิดข้อผิดพลาดในการบันทึก:', error);
    });
  }
}

// ฟังก์ชันสำหรับอัปเดตสถิติการเชิญ
function updateInviteStats() {
  if (window.firebase && window.firebase.firestore) {
    const db = window.firebase.firestore();
    const userData = window.globalUserData || window.getCurrentUser?.();
    
    if (userData) {
      // นับจำนวนการเชิญทั้งหมด
      db.collection('invites')
        .where('inviterId', '==', userData.lineUserId)
        .get()
        .then(snapshot => {
          inviteStats.totalInvites = snapshot.size;
          
          // นับจำนวนการลงทะเบียนสำเร็จ
          const successfulInvites = snapshot.docs.filter(doc => 
            doc.data().status === 'completed'
          );
          inviteStats.successfulInvites = successfulInvites.length;
          
          // คำนวณคะแนนรวม
          inviteStats.totalRewards = (inviteStats.successfulInvites * 100) + 
                                   (inviteStats.successfulInvites * 500);
          
          // อัปเดต UI
          updateInviteStatsUI();
        })
        .catch(error => {
          console.error('เกิดข้อผิดพลาดในการดึงข้อมูล:', error);
        });
    }
  }
}

// ฟังก์ชันสำหรับอัปเดต UI สถิติการเชิญ
function updateInviteStatsUI() {
  document.getElementById('totalInvites').textContent = inviteStats.totalInvites;
  document.getElementById('successfulInvites').textContent = inviteStats.successfulInvites;
  document.getElementById('totalRewards').textContent = inviteStats.totalRewards;
}

// ฟังก์ชันสำหรับโหลดประวัติการเชิญ
function loadInviteHistory() {
  if (window.firebase && window.firebase.firestore) {
    const db = window.firebase.firestore();
    const userData = window.globalUserData || window.getCurrentUser?.();
    
    if (userData) {
      db.collection('invites')
        .where('inviterId', '==', userData.lineUserId)
        .orderBy('timestamp', 'desc')
        .limit(10)
        .get()
        .then(snapshot => {
          const inviteHistory = document.getElementById('inviteHistory');
          
          if (snapshot.empty) {
            inviteHistory.innerHTML = `
              <div class="text-center text-secondary py-4">
                <div class="icon-dashborad mb-2" style="width: 40px; height: 40px; margin: 0 auto;">
                  <i class="fa-light fa-user-group-simple fa-xl"></i>
                </div>
                <p class="font-size-14 mb-0">ยังไม่มีการเชิญเพื่อน</p>
              </div>
            `;
          } else {
            inviteHistory.innerHTML = '';
            snapshot.forEach(doc => {
              const data = doc.data();
              const historyItem = createInviteHistoryItem(data);
              inviteHistory.appendChild(historyItem);
            });
          }
        })
        .catch(error => {
          console.error('เกิดข้อผิดพลาดในการโหลดประวัติ:', error);
        });
    }
  }
}

// ฟังก์ชันสำหรับสร้างรายการประวัติการเชิญ
function createInviteHistoryItem(inviteData) {
  const historyItem = document.createElement('div');
  historyItem.className = 'd-flex align-items-center p-2 border rounded-3 mb-2';
  
  const actionIcon = getActionIcon(inviteData.action);
  const actionText = getActionText(inviteData.action);
  const date = new Date(inviteData.timestamp).toLocaleDateString('th-TH');
  
  historyItem.innerHTML = `
    <div class="icon-dashborad me-3">
      <i class="${actionIcon} fa-lg text-success"></i>
    </div>
    <div class="flex-grow-1">
      <h6 class="mb-1 font-size-14 fw-semibold">${actionText}</h6>
      <small class="text-secondary">${date}</small>
    </div>
    <span class="badge ${inviteData.status === 'completed' ? 'bg-success' : 'bg-warning'} rounded-pill font-size-10">
      ${inviteData.status === 'completed' ? 'สำเร็จ' : 'รอดำเนินการ'}
    </span>
  `;
  
  return historyItem;
}

// ฟังก์ชันสำหรับรับไอคอนตามการกระทำ
function getActionIcon(action) {
  switch (action) {
    case 'line_share':
      return 'fa-brands fa-line';
    case 'copy_link':
      return 'fa-light fa-link';
    case 'qr_code':
      return 'fa-light fa-qrcode';
    default:
      return 'fa-light fa-share-nodes';
  }
}

// ฟังก์ชันสำหรับรับข้อความตามการกระทำ
function getActionText(action) {
  switch (action) {
    case 'line_share':
      return 'แชร์ผ่าน LINE';
    case 'copy_link':
      return 'คัดลอกลิงก์';
    case 'qr_code':
      return 'แสดง QR Code';
    default:
      return 'เชิญเพื่อน';
  }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  console.log('=== Invite Page Loaded ===');
  
  // รอให้ filebase.js โหลดเสร็จก่อน
  setTimeout(() => {
    // รอข้อมูลผู้ใช้และอัปเดต UI ก่อน
    waitForUserData((userData) => {
      if (userData) {
        // ตรวจสอบสถานะการเข้าสู่ระบบหลังจากได้ข้อมูลแล้ว
        if (checkLoginStatusForInvite()) {
          updateUserInfoInInvite(userData);
          updateInviteStats();
          loadInviteHistory();
          console.log('ข้อมูลผู้ใช้พร้อมใช้งานในหน้า Invite');
        }
      } else {
        console.log('ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
        alert('ไม่สามารถโหลดข้อมูลผู้ใช้ได้ กรุณาเข้าสู่ระบบใหม่');
        window.location.href = '../index.html';
      }
    });
  }, 1000); // รอ 1 วินาทีให้ filebase.js โหลดเสร็จ
  
  // Event listeners สำหรับการเปลี่ยนแปลงข้อมูลผู้ใช้
  window.addEventListener('userDataReady', () => {
    console.log('ข้อมูลผู้ใช้พร้อมใช้งานในหน้า Invite');
    const userData = window.globalUserData;
    if (userData) {
      updateUserInfoInInvite(userData);
      updateInviteStats();
      loadInviteHistory();
    }
  });
});

// Export functions for global use
window.shareToLine = shareToLine;
window.copyInviteLink = copyInviteLink;
window.showQRCode = showQRCode;
window.downloadQRCode = downloadQRCode;
