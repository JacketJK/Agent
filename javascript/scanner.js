/**
 * Scanner Page JavaScript
 * จัดการการแสดงข้อมูลผู้ใช้ในหน้า scanner
 */

let isScanning = false;
let lastResult = null;
let currentStream = null;
let facingMode = 'environment';

// Initialize scanner when page loads
document.addEventListener('DOMContentLoaded', function () {
  initializeScanner();
});

function initializeScanner() {
  if (isScanning) {
    Quagga.stop();
  }

  isScanning = true;
  document.getElementById('loadingIndicator').style.display = 'block';

  Quagga.init({
    inputStream: {
      name: "Live",
      type: "LiveStream",
      target: document.querySelector('#scanner-container'),
      constraints: {
        width: window.innerWidth,
        height: window.innerHeight,
        facingMode: facingMode
      }
    },
    locator: {
      patchSize: "medium",
      halfSample: true
    },
    numOfWorkers: 2,
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
    locate: true
  }, function (err) {
    document.getElementById('loadingIndicator').style.display = 'none';

    if (err) {
      console.error('Error initializing Quagga:', err);
      alert('ไม่สามารถเริ่มต้นกล้องได้: ' + err.message);
      return;
    }

    console.log("Initialization finished. Ready to start");
    Quagga.start();

    // Get current stream reference
    currentStream = Quagga.CameraAccess.getActiveStream();
  });

  // Listen for successful reads
  Quagga.onDetected(function (result) {
    const code = result.codeResult.code;

    // Prevent duplicate reads
    if (lastResult === code) {
      return;
    }

    lastResult = code;
    showResult(code, result.codeResult.format);

    // Pause scanning briefly to prevent multiple reads
    Quagga.pause();
    setTimeout(() => {
      if (isScanning) {
        Quagga.start();
      }
    }, 2000);
  });
}

function showResult(code, format) {
  const resultContent = document.getElementById('resultContent');
  resultContent.innerHTML = `
        <div><strong>บาร์โค้ด:</strong> ${code}</div>
        <div><strong>ประเภท:</strong> ${format.toUpperCase()}</div>
      `;
  document.getElementById('resultDisplay').style.display = 'block';

  // Play success sound (optional)
  playBeep();
}

function hideResult() {
  document.getElementById('resultDisplay').style.display = 'none';
  lastResult = null;
}

function continueScan() {
  hideResult();
  if (!isScanning) {
    initializeScanner();
  }
}

function processBarcode() {
  if (lastResult) {
    // Here you would typically send the barcode to your server
    alert(`ประมวลผลบาร์โค้ด: ${lastResult}\n(ในการใช้งานจริง ระบบจะส่งข้อมูลไปยังเซิร์ฟเวอร์)`);
    hideResult();
  }
}

function playBeep() {
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
}

// Switch camera
document.getElementById('switchCameraBtn').addEventListener('click', function () {
  facingMode = facingMode === 'environment' ? 'user' : 'environment';
  if (isScanning) {
    Quagga.stop();
    setTimeout(() => {
      initializeScanner();
    }, 500);
  }
});

// Toggle flash (if supported)
document.getElementById('toggleFlashBtn').addEventListener('click', function () {
  if (currentStream) {
    const track = currentStream.getVideoTracks()[0];
    const capabilities = track.getCapabilities();

    if (capabilities.torch) {
      track.applyConstraints({
        advanced: [{ torch: !track.getConstraints().advanced?.[0]?.torch }]
      }).catch(err => {
        console.log('Flash not supported:', err);
        alert('อุปกรณ์นี้ไม่รองรับไฟแฟลช');
      });
    } else {
      alert('อุปกรณ์นี้ไม่รองรับไฟแฟลช');
    }
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

  const reader = new FileReader();
  reader.onload = function (e) {
    // Create temporary image for processing
    const img = new Image();
    img.onload = function () {
      // Create canvas for image processing
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

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
          showResult(result.codeResult.code, result.codeResult.format);
          bootstrap.Modal.getInstance(document.getElementById('uploadModal')).hide();
        } else {
          alert('ไม่พบบาร์โค้ดในรูปภาพ กรุณาลองใหม่');
        }
      });
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// Cleanup on page unload
window.addEventListener('beforeunload', function () {
  if (isScanning) {
    Quagga.stop();
  }
});

// Handle orientation changes
window.addEventListener('orientationchange', function () {
  setTimeout(() => {
    if (isScanning) {
      Quagga.stop();
      setTimeout(() => {
        initializeScanner();
      }, 1000);
    }
  }, 500);
});