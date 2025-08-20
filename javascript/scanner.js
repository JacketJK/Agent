/**
 * Scanner Page JavaScript - Improved Version
 * จัดการการแสดงข้อมูลผู้ใช้ในหน้า scanner พร้อมการจัดการ permission
 */

let isScanning = false;
let lastResult = null;
let currentStream = null;
let facingMode = 'environment';

// Initialize scanner when page loads
document.addEventListener('DOMContentLoaded', function () {
  checkCameraPermission();
});

// ตรวจสอบและขอ permission กล้องก่อน
async function checkCameraPermission() {
  try {
    console.log('กำลังตรวจสอบ permission กล้อง...');
    
    // ตรวจสอบว่า browser รองรับ getUserMedia หรือไม่
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Browser ไม่รองรับการใช้กล้อง');
    }

    // ตรวจสอบ permission
    if (navigator.permissions) {
      const permission = await navigator.permissions.query({ name: 'camera' });
      console.log('Camera permission status:', permission.state);
      
      if (permission.state === 'denied') {
        showPermissionError();
        return;
      }
    }

    // ลองขอใช้กล้อง
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: facingMode,
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    });

    console.log('ได้รับ permission กล้องแล้ว');
    
    // หยุด stream ชั่วคราว เพื่อให้ Quagga จัดการเอง
    stream.getTracks().forEach(track => track.stop());
    
    // เริ่มต้น scanner
    initializeScanner();
    
  } catch (error) {
    console.error('Error requesting camera permission:', error);
    handleCameraError(error);
  }
}

function showPermissionError() {
  const errorMsg = `
    <div class="alert alert-danger" role="alert">
      <h5><i class="fas fa-exclamation-triangle"></i> ไม่สามารถเข้าถึงกล้องได้</h5>
      <p>กรุณาอนุญาตการใช้กล้องในเบราว์เซอร์ของคุณ:</p>
      <ol>
        <li>คลิกที่ไอคอนกล้องในแถบที่อยู่ (Address Bar)</li>
        <li>เลือก "อนุญาต" (Allow)</li>
        <li>รีโหลดหน้าเว็บ</li>
      </ol>
      <button class="btn btn-primary mt-2" onclick="location.reload()">รีโหลดหน้า</button>
      <button class="btn btn-secondary mt-2" onclick="openFileUpload()">อัพโหลดรูปแทน</button>
    </div>
  `;
  
  document.getElementById('scanner-container').innerHTML = errorMsg;
}

function handleCameraError(error) {
  let errorMessage = 'เกิดข้อผิดพลาดในการเข้าถึงกล้อง';
  
  switch (error.name) {
    case 'NotAllowedError':
      errorMessage = 'กรุณาอนุญาตการใช้กล้อง';
      showPermissionError();
      return;
    case 'NotFoundError':
      errorMessage = 'ไม่พบกล้องในอุปกรณ์';
      break;
    case 'NotReadableError':
      errorMessage = 'กล้องถูกใช้งานโดยแอปพลิเคชันอื่น';
      break;
    case 'OverconstrainedError':
      errorMessage = 'การตั้งค่ากล้องไม่เหมาะสม';
      break;
    default:
      errorMessage = error.message || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
  }

  const errorHTML = `
    <div class="alert alert-warning text-center" role="alert">
      <i class="fas fa-exclamation-triangle fa-2x mb-2"></i>
      <h5>${errorMessage}</h5>
      <p>คุณสามารถลองวิธีอื่นได้:</p>
      <button class="btn btn-primary me-2" onclick="location.reload()">ลองใหม่</button>
      <button class="btn btn-secondary" onclick="openFileUpload()">อัพโหลดรูป</button>
    </div>
  `;
  
  document.getElementById('scanner-container').innerHTML = errorHTML;
}

function initializeScanner() {
  console.log('กำลังเริ่มต้น Quagga...');
  
  if (isScanning) {
    Quagga.stop();
  }

  isScanning = true;
  document.getElementById('loadingIndicator').style.display = 'block';

  // ใช้ config ที่ปรับตามแนวหน้าจอ
  const config = getOptimalConfig();

  Quagga.init(config, function (err) {
    document.getElementById('loadingIndicator').style.display = 'none';

    if (err) {
      console.error('Error initializing Quagga:', err);
      handleCameraError(err);
      return;
    }

    console.log("Quagga initialization finished. Ready to start");
    
    try {
      Quagga.start();
      console.log("Quagga started successfully");
      
      // Get current stream reference (แบบใหม่ที่รองรับ Quagga version ต่างๆ)
      try {
        if (Quagga.CameraAccess && Quagga.CameraAccess.getActiveStream) {
          currentStream = Quagga.CameraAccess.getActiveStream();
        } else if (Quagga.CameraAccess && Quagga.CameraAccess.getActiveTrack) {
          const track = Quagga.CameraAccess.getActiveTrack();
          if (track) {
            currentStream = new MediaStream([track]);
          }
        } else {
          // Fallback method - get stream from video element
          const video = document.querySelector('#scanner-container video');
          if (video && video.srcObject) {
            currentStream = video.srcObject;
          }
        }
      } catch (e) {
        console.log('Could not get camera stream reference:', e);
      }
      
      // แสดงข้อความสถานะ
      showScanningStatus(true);
      
    } catch (startError) {
      console.error('Error starting Quagga:', startError);
      handleCameraError(startError);
    }
  });

  // Listen for successful reads
  Quagga.onDetected(function (result) {
    const code = result.codeResult.code;
    const confidence = result.codeResult.decodedCodes[0].confidence || 0;

    console.log(`Barcode detected: ${code}, Confidence: ${confidence}`);

    // ตรวจสอบ confidence level
    if (confidence < 20) {
      console.log('Low confidence reading, skipping');
      return;
    }

    // Prevent duplicate reads
    if (lastResult === code) {
      return;
    }

    lastResult = code;
    showResult(code, result.codeResult.format);
    
    // เล่นเสียง
    playBeep();

    // Pause scanning briefly to prevent multiple reads
    Quagga.pause();
    setTimeout(() => {
      if (isScanning) {
        Quagga.start();
      }
    }, 2000);
  });
}

function showScanningStatus(isActive) {
  const statusElement = document.querySelector('.scanner-status');
  if (statusElement) {
    statusElement.textContent = isActive ? 'กำลังสแกน...' : 'หยุดการสแกน';
    statusElement.className = `scanner-status ${isActive ? 'text-success' : 'text-warning'}`;
  }
}

function showResult(code, format) {
  const resultContent = document.getElementById('resultContent');
  resultContent.innerHTML = `
    <div><strong>บาร์โค้ด:</strong> ${code}</div>
    <div><strong>ประเภท:</strong> ${format.toUpperCase()}</div>
    <div class="small text-muted">เวลา: ${new Date().toLocaleTimeString('th-TH')}</div>
  `;
  document.getElementById('resultDisplay').style.display = 'block';
  
  showScanningStatus(false);
}

function hideResult() {
  document.getElementById('resultDisplay').style.display = 'none';
  lastResult = null;
  showScanningStatus(true);
}

function continueScan() {
  hideResult();
  if (!isScanning) {
    initializeScanner();
  } else {
    Quagga.start();
  }
}

function processBarcode() {
  if (lastResult) {
    // Here you would typically send the barcode to your server
    console.log('Processing barcode:', lastResult);
    alert(`ประมวลผลบาร์โค้ด: ${lastResult}\n(ในการใช้งานจริง ระบบจะส่งข้อมูลไปยังเซิร์ฟเวอร์)`);
    hideResult();
  }
}

function playBeep() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'square';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  } catch (error) {
    console.log('Cannot play sound:', error);
  }
}

// Toggle flash (if supported) - ปรับปรุงการหา video track
document.getElementById('toggleFlashBtn').addEventListener('click', async function () {
  try {
    let videoTrack = null;
    
    // หาวิธีรับ video track หลายวิธี
    if (currentStream && currentStream.getVideoTracks) {
      videoTrack = currentStream.getVideoTracks()[0];
    } else if (Quagga.CameraAccess && Quagga.CameraAccess.getActiveTrack) {
      videoTrack = Quagga.CameraAccess.getActiveTrack();
    } else {
      // Fallback: หาจาก video element
      const video = document.querySelector('#scanner-container video');
      if (video && video.srcObject) {
        const tracks = video.srcObject.getVideoTracks();
        videoTrack = tracks[0];
      }
    }

    if (videoTrack) {
      const capabilities = videoTrack.getCapabilities();
      console.log('Camera capabilities:', capabilities);

      if (capabilities.torch) {
        const currentConstraints = videoTrack.getConstraints();
        const torchOn = currentConstraints.advanced?.[0]?.torch || false;
        
        await videoTrack.applyConstraints({
          advanced: [{ torch: !torchOn }]
        });
        
        console.log('Torch toggled:', !torchOn);
        
        // อัพเดต UI
        const flashBtn = document.getElementById('toggleFlashBtn');
        const icon = flashBtn.querySelector('i');
        
        if (!torchOn) {
          flashBtn.classList.add('btn-warning');
          flashBtn.classList.remove('btn-light');
          icon.classList.replace('fa-flashlight', 'fa-lightbulb');
          flashBtn.innerHTML = '<i class="fa-solid fa-lightbulb me-2"></i>ปิดแฟลช';
        } else {
          flashBtn.classList.add('btn-light');
          flashBtn.classList.remove('btn-warning');
          icon.classList.replace('fa-lightbulb', 'fa-flashlight');
          flashBtn.innerHTML = '<i class="fa-solid fa-flashlight me-2"></i>ไฟแฟลช';
        }
        
      } else {
        alert('อุปกรณ์นี้ไม่รองรับไฟแฟลช');
      }
    } else {
      console.log('Could not get video track for flash control');
      alert('ไม่สามารถควบคุมไฟแฟลชได้ในขณะนี้');
    }
  } catch (err) {
    console.error('Flash error:', err);
    alert('เกิดข้อผิดพลาดในการควบคุมไฟแฟลช: ' + err.message);
  }
});

// File upload functionality
function openFileUpload() {
  const modal = new bootstrap.Modal(document.getElementById('uploadModal'));
  modal.show();
}

function processUploadedFile() {
  const fileInput = document.getElementById('uploadFile');
  const file = fileInput.files[0];

  if (!file) {
    alert('กรุณาเลือกไฟล์');
    return;
  }

  // ตรวจสอบประเภทไฟล์
  if (!file.type.startsWith('image/')) {
    alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    // Create temporary image for processing
    const img = new Image();
    img.onload = function () {
      console.log('Processing uploaded image...');
      
      // Use Quagga to decode the image
      Quagga.decodeSingle({
        decoder: {
          readers: [
            "code_128_reader",
            "ean_reader",
            "ean_8_reader",
            "code_39_reader",
            "codabar_reader",
            "upc_reader",
            "upc_e_reader"
          ]
        },
        locate: true,
        src: e.target.result
      }, function (result) {
        if (result && result.codeResult) {
          console.log('Barcode found in uploaded image:', result.codeResult.code);
          showResult(result.codeResult.code, result.codeResult.format);
          bootstrap.Modal.getInstance(document.getElementById('uploadModal')).hide();
        } else {
          alert('ไม่พบบาร์โค้ดในรูปภาพ กรุณาลองใหม่');
        }
      });
    };
    
    img.onerror = function() {
      alert('ไม่สามารถโหลดรูปภาพได้');
    };
    
    img.src = e.target.result;
  };
  
  reader.onerror = function() {
    alert('ไม่สามารถอ่านไฟล์ได้');
  };
  
  reader.readAsDataURL(file);
}

// Cleanup on page unload
window.addEventListener('beforeunload', function () {
  if (isScanning) {
    Quagga.stop();
  }
  
  // Clean up streams - ปรับปรุงการ cleanup
  if (currentStream && currentStream.getTracks) {
    currentStream.getTracks().forEach(track => track.stop());
  } else {
    // หา streams จาก video elements
    const videos = document.querySelectorAll('#scanner-container video');
    videos.forEach(video => {
      if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
      }
    });
  }
});

// Handle orientation changes - ปรับปรุงการจัดการแนวหน้าจอ
window.addEventListener('orientationchange', function () {
  console.log('Orientation changed, adjusting scanner...');
  
  setTimeout(() => {
    // ปรับ config ตามแนวหน้าจอ
    const isPortrait = window.innerHeight > window.innerWidth;
    
    if (isScanning) {
      Quagga.stop();
      isScanning = false;
      
      // รอให้หน้าจอปรับเสร็จ
      setTimeout(() => {
        // ปรับ aspect ratio ตามแนว
        if (isPortrait) {
          // แนวตั้ง 9:16
          document.querySelector('.scanner-frame').className = 'scanner-frame barcode-frame';
        } else {
          // แนวนอน 16:9
          document.querySelector('.scanner-frame').className = 'scanner-frame';
        }
        
        checkCameraPermission();
      }, 500);
    }
  }, 100);
});

// ปรับแต่ง config based on orientation
function getOptimalConfig() {
  return {
    inputStream: {
      name: "Live",
      type: "LiveStream",
      target: document.querySelector('#scanner-container'),
      constraints: {
        width: { min: 480, ideal: 720, max: 1080 },
        height: { min: 640, ideal: 1280, max: 1920 },
        facingMode: facingMode,
        aspectRatio: { ideal: 9/16 } // ✅ บังคับเป็นแนวตั้ง
      }
    },
    locator: {
      patchSize: "medium",
      halfSample: true
    },
    numOfWorkers: navigator.hardwareConcurrency || 2,
    frequency: 10,
    decoder: {
      readers: [
        "code_128_reader",
        "ean_reader",
        "ean_8_reader",
        "code_39_reader",
        "code_39_vin_reader",
        "codabar_reader",
        "upc_reader",
        "upc_e_reader",
        "i2of5_reader"
      ]
    },
    locate: true // ✅ ต้องเติมให้สมบูรณ์
  };
}

// Handle visibility change
document.addEventListener('visibilitychange', function() {
  if (document.hidden) {
    if (isScanning) {
      Quagga.pause();
    }
  } else {
    if (isScanning) {
      Quagga.start();
    }
  }
});

// Debug function เพื่อตรวจสอบสถานะ
window.debugScanner = function() {
  console.log('=== Scanner Debug Info ===');
  console.log('- isScanning:', isScanning);
  console.log('- facingMode:', facingMode);
  console.log('- currentStream:', currentStream);
  console.log('- Navigator.mediaDevices:', !!navigator.mediaDevices);
  console.log('- getUserMedia support:', !!navigator.mediaDevices?.getUserMedia);
  console.log('- HTTPS:', location.protocol === 'https:');
  console.log('- localhost:', location.hostname === 'localhost');
  
  // ตรวจสอบ Quagga API
  console.log('- Quagga loaded:', !!window.Quagga);
  if (window.Quagga) {
    console.log('- Quagga.CameraAccess:', !!Quagga.CameraAccess);
    if (Quagga.CameraAccess) {
      console.log('- getActiveStream available:', typeof Quagga.CameraAccess.getActiveStream === 'function');
      console.log('- getActiveTrack available:', typeof Quagga.CameraAccess.getActiveTrack === 'function');
    }
  }
  
  // ตรวจสอบ video elements
  const videos = document.querySelectorAll('#scanner-container video');
  console.log('- Video elements found:', videos.length);
  videos.forEach((video, index) => {
    console.log(`  Video ${index}:`, {
      srcObject: !!video.srcObject,
      videoTracks: video.srcObject ? video.srcObject.getVideoTracks().length : 0
    });
  });
  
  console.log('=========================');
}

// แทนที่โค้ดส่วนท้ายทั้งหมด (หลังจาก window.debugScanner) ด้วยโค้ดนี้:

// ฟังก์ชันสลับกล้อง - เวอร์ชันแก้ไขแล้ว
document.getElementById('switchCameraBtn')?.addEventListener('click', async function() {
  console.log('Switching camera...');
  
  try {
    // แสดง loading
    const switchBtn = this;
    const originalText = switchBtn.innerHTML;
    switchBtn.disabled = true;
    switchBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>กำลังสลับ...';
    
    // หยุด Quagga ก่อน
    if (isScanning) {
      Quagga.stop();
      isScanning = false;
    }
    
    // หยุด stream เก่า
    if (currentStream && currentStream.getTracks) {
      currentStream.getTracks().forEach(track => track.stop());
    }
    
    // สลับ facing mode
    facingMode = facingMode === 'environment' ? 'user' : 'environment';
    console.log('New facing mode:', facingMode);
    
    // รอสักครู่ให้กล้องหยุดสมบูรณ์
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // เริ่มใหม่
    await checkCameraPermission();
    
    // อัปเดต UI ปุ่ม
    switchBtn.disabled = false;
    if (facingMode === 'environment') {
      switchBtn.innerHTML = '<i class="fas fa-camera me-2"></i>กล้องหน้า';
    } else {
      switchBtn.innerHTML = '<i class="fas fa-camera me-2"></i>กล้องหลัง';
    }
    
    console.log('Camera switched successfully');
    
  } catch (error) {
    console.error('Error switching camera:', error);
    
    // กลับไปใช้กล้องเดิม
    facingMode = facingMode === 'environment' ? 'user' : 'environment';
    
    // รีเซ็ตปุ่ม
    switchBtn.disabled = false;
    switchBtn.innerHTML = originalText;
    
    alert('ไม่สามารถสลับกล้องได้: ' + error.message);
  }
});

// ฟังก์ชันเพิ่มเติม - ตรวจสอบว่ามีกล้องหลายตัวหรือไม่
async function checkCameraAvailability() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    
    console.log('Available cameras:', videoDevices.length);
    
    // ซ่อน/แสดงปุ่มสลับกล้องตามจำนวนกล้อง
    const switchBtn = document.getElementById('switchCameraBtn');
    if (switchBtn) {
      if (videoDevices.length <= 1) {
        switchBtn.style.display = 'none';
      } else {
        switchBtn.style.display = 'block';
      }
    }
    
    return videoDevices.length > 1;
  } catch (error) {
    console.log('Cannot enumerate devices:', error);
    return false;
  }
}

// เรียกใช้เมื่อโหลดหน้า
document.addEventListener('DOMContentLoaded', function() {
  // ตรวจสอบกล้อง
  setTimeout(() => {
    checkCameraAvailability();
  }, 1000);
});