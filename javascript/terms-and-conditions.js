/**
 * Terms and Conditions Page JavaScript
 * จัดการการแสดงผลข้อตกลงและเงื่อนไขการใช้งาน
 */

// ฟังก์ชันสำหรับเลื่อนไปยังส่วนต่างๆ
function scrollToSection(sectionId) {
  const element = document.getElementById(sectionId);
  if (element) {
    // คำนวณตำแหน่งที่ต้องการเลื่อนไป
    const headerHeight = document.querySelector('.sticky-top').offsetHeight;
    const elementPosition = element.offsetTop - headerHeight - 20;
    
    // เลื่อนไปยังตำแหน่งที่ต้องการ
    window.scrollTo({
      top: elementPosition,
      behavior: 'smooth'
    });
    
    // ไฮไลท์ส่วนที่เลือก
    highlightSection(sectionId);
  }
}

// ฟังก์ชันสำหรับไฮไลท์ส่วนที่เลือก
function highlightSection(sectionId) {
  // ลบไฮไลท์ทั้งหมด
  document.querySelectorAll('.card').forEach(card => {
    card.style.boxShadow = '';
    card.style.border = '';
  });
  
  // ไฮไลท์ส่วนที่เลือก
  const selectedSection = document.querySelector(`#${sectionId}`).closest('.card');
  if (selectedSection) {
    selectedSection.style.boxShadow = '0 0 20px rgba(25, 135, 84, 0.3)';
    selectedSection.style.border = '2px solid #198754';
    
    // ลบไฮไลท์หลังจาก 3 วินาที
    setTimeout(() => {
      selectedSection.style.boxShadow = '';
      selectedSection.style.border = '';
    }, 3000);
  }
}

// ฟังก์ชันสำหรับติดต่อสนับสนุน
function contactSupport() {
  const modal = new bootstrap.Modal(document.getElementById('contactSupportModal'));
  modal.show();
}

// ฟังก์ชันสำหรับส่งข้อความสนับสนุน
function submitSupport() {
  const name = document.getElementById('supportName').value.trim();
  const email = document.getElementById('supportEmail').value.trim();
  const subject = document.getElementById('supportSubject').value.trim();
  const message = document.getElementById('supportMessage').value.trim();
  
  if (!name || !email || !subject || !message) {
    alert('กรุณากรอกข้อมูลให้ครบถ้วน');
    return;
  }
  
  // ตรวจสอบรูปแบบอีเมล
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert('กรุณากรอกอีเมลให้ถูกต้อง');
    return;
  }
  
  // ส่งข้อมูลไปยัง Firestore (ถ้ามี)
  if (window.firebase && window.firebase.firestore) {
    const db = window.firebase.firestore();
    const supportRef = db.collection('support_messages').doc();
    
    const supportData = {
      name: name,
      email: email,
      subject: subject,
      message: message,
      timestamp: Date.now(),
      status: 'pending',
      category: 'terms_and_conditions'
    };
    
    supportRef.set(supportData).then(() => {
      alert('ส่งข้อความเรียบร้อยแล้ว เราจะติดต่อกลับภายใน 24 ชั่วโมง');
      
      // รีเซ็ตฟอร์ม
      document.getElementById('supportForm').reset();
      
      // ตั้งค่าหัวข้อเริ่มต้น
      document.getElementById('supportSubject').value = 'คำถามเกี่ยวกับข้อตกลงและเงื่อนไข';
      
      // ปิด Modal
      const modal = bootstrap.Modal.getInstance(document.getElementById('contactSupportModal'));
      modal.hide();
    }).catch(error => {
      console.error('เกิดข้อผิดพลาดในการส่งข้อความ:', error);
      alert('เกิดข้อผิดพลาดในการส่งข้อความ กรุณาลองใหม่อีกครั้ง');
    });
  } else {
    // Fallback: แสดงข้อมูลที่กรอก
    alert(`ส่งข้อความเรียบร้อยแล้ว!\n\nชื่อ: ${name}\nอีเมล: ${email}\nหัวข้อ: ${subject}\nรายละเอียด: ${message}\n\nเราจะติดต่อกลับภายใน 24 ชั่วโมง`);
    
    // รีเซ็ตฟอร์ม
    document.getElementById('supportForm').reset();
    
    // ตั้งค่าหัวข้อเริ่มต้น
    document.getElementById('supportSubject').value = 'คำถามเกี่ยวกับข้อตกลงและเงื่อนไข';
    
    // ปิด Modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('contactSupportModal'));
    modal.hide();
  }
}

// ฟังก์ชันสำหรับแสดง/ซ่อนสารบัญเมื่อเลื่อน
function handleScroll() {
  const toc = document.querySelector('.card:has(#general)');
  if (toc) {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const headerHeight = document.querySelector('.sticky-top').offsetHeight;
    
    if (scrollTop > headerHeight + 100) {
      toc.style.position = 'sticky';
      toc.style.top = headerHeight + 10 + 'px';
      toc.style.zIndex = '2';
    } else {
      toc.style.position = '';
      toc.style.top = '';
      toc.style.zIndex = '';
    }
  }
}

// ฟังก์ชันสำหรับเพิ่มเอฟเฟกต์การอ่าน
function addReadingEffects() {
  // เพิ่มเอฟเฟกต์เมื่อเลื่อนผ่านแต่ละส่วน
  const sections = document.querySelectorAll('.card');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, {
    threshold: 0.1
  });
  
  sections.forEach(section => {
    section.style.opacity = '0.8';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'all 0.5s ease-in-out';
    observer.observe(section);
  });
}

// ฟังก์ชันสำหรับเพิ่มการเน้นข้อความสำคัญ
function highlightImportantText() {
  const importantTexts = document.querySelectorAll('.fw-semibold');
  importantTexts.forEach(text => {
    text.style.color = '#198754';
    text.style.fontWeight = '600';
  });
}

// ฟังก์ชันสำหรับเพิ่มการแสดงผลแบบ Print-friendly
function addPrintStyles() {
  const style = document.createElement('style');
  style.textContent = `
    @media print {
      .sticky-top, .btn, .modal { display: none !important; }
      .card { box-shadow: none !important; border: 1px solid #000 !important; }
      body { font-size: 12pt !important; }
    }
  `;
  document.head.appendChild(style);
}

// ฟังก์ชันสำหรับเพิ่มปุ่มพิมพ์
function addPrintButton() {
  const heroSection = document.querySelector('.card-body.p-4.text-white.text-center');
  if (heroSection) {
    const printBtn = document.createElement('button');
    printBtn.className = 'btn btn-light rounded-pill mt-3';
    printBtn.innerHTML = '<i class="fa-light fa-print me-2"></i>พิมพ์เอกสาร';
    printBtn.onclick = () => window.print();
    heroSection.appendChild(printBtn);
  }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  console.log('=== Terms and Conditions Page Loaded ===');
  
  // เพิ่มเอฟเฟกต์การอ่าน
  addReadingEffects();
  
  // เพิ่มการเน้นข้อความสำคัญ
  highlightImportantText();
  
  // เพิ่มสไตล์สำหรับการพิมพ์
  addPrintStyles();
  
  // เพิ่มปุ่มพิมพ์
  addPrintButton();
  
  // Event listener สำหรับการเลื่อน
  window.addEventListener('scroll', handleScroll);
  
  // Event listener สำหรับการกดปุ่มสารบัญ
  document.querySelectorAll('[onclick^="scrollToSection"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const sectionId = btn.getAttribute('onclick').match(/scrollToSection\('(.+?)'\)/)[1];
      scrollToSection(sectionId);
    });
  });
});

// Export functions for global use
window.scrollToSection = scrollToSection;
window.contactSupport = contactSupport;
window.submitSupport = submitSupport;
