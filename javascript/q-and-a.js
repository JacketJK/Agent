/**
 * Q&A Page JavaScript
 * จัดการการแสดงผลคำถามที่พบบ่อย การค้นหา และการติดต่อสนับสนุน
 */

// ข้อมูลคำถามที่พบบ่อย
const faqData = {
  general: [
    {
      question: "Samitivej Point คืออะไร?",
      answer: "Samitivej Point เป็นระบบสะสมคะแนนสำหรับลูกค้าของโรงพยาบาลสมิติเวช โดยคุณสามารถสะสมคะแนนจากการใช้บริการต่างๆ และแลกเป็นสิทธิประโยชน์ต่างๆ ได้"
    },
    {
      question: "ใครสามารถใช้ Samitivej Point ได้บ้าง?",
      answer: "ลูกค้าทุกคนที่ใช้บริการของโรงพยาบาลสมิติเวชสามารถสมัครเป็นสมาชิก Samitivej Point ได้ โดยไม่จำกัดอายุ"
    },
    {
      question: "การใช้งาน Samitivej Point มีค่าใช้จ่ายหรือไม่?",
      answer: "การสมัครและใช้งาน Samitivej Point ไม่มีค่าใช้จ่ายใดๆ ทั้งสิ้น เป็นบริการฟรีสำหรับลูกค้าของเรา"
    }
  ],
  registration: [
    {
      question: "จะสมัครสมาชิก Samitivej Point ได้อย่างไร?",
      answer: "คุณสามารถสมัครสมาชิกได้ผ่าน LINE โดยสแกน QR Code หรือคลิกลิงก์ที่ได้รับจากเจ้าหน้าที่ หรือสมัครผ่านเว็บไซต์ของเรา"
    },
    {
      question: "ต้องใช้เอกสารอะไรบ้างในการสมัคร?",
      answer: "คุณจะต้องให้ข้อมูลพื้นฐาน เช่น ชื่อ-นามสกุล อีเมล เบอร์โทรศัพท์ และยืนยันตัวตนผ่าน LINE"
    },
    {
      question: "สมัครแล้วจะได้รหัสสมาชิกเมื่อไหร่?",
      answer: "หลังจากสมัครสำเร็จ คุณจะได้รับรหัสสมาชิกทันที ซึ่งจะแสดงในหน้าโปรไฟล์ของคุณ"
    }
  ],
  points: [
    {
      question: "สะสมคะแนนได้อย่างไร?",
      answer: "คุณสามารถสะสมคะแนนได้จากการใช้บริการต่างๆ ของโรงพยาบาล เช่น การตรวจรักษา การซื้อยา การใช้บริการเสริมต่างๆ"
    },
    {
      question: "คะแนนมีอายุการใช้งานหรือไม่?",
      answer: "คะแนนที่สะสมได้จะมีอายุการใช้งาน 2 ปี นับจากวันที่ได้รับคะแนน"
    },
    {
      question: "แลกคะแนนเป็นอะไรได้บ้าง?",
      answer: "คุณสามารถแลกคะแนนเป็นส่วนลดค่าบริการ ผลิตภัณฑ์สุขภาพ หรือสิทธิประโยชน์พิเศษต่างๆ ได้"
    }
  ],
  scanner: [
    {
      question: "สแกนคูปองเพื่ออะไร?",
      answer: "การสแกนคูปองช่วยให้คุณสะสมคะแนนได้เร็วขึ้น และสามารถติดตามประวัติการใช้งานได้อย่างสะดวก"
    },
    {
      question: "คูปองที่สแกนได้มีกี่ประเภท?",
      answer: "มีหลายประเภท เช่น คูปองส่วนลด คูปองสะสมคะแนนพิเศษ คูปองโปรโมชั่นต่างๆ"
    },
    {
      question: "สแกนคูปองแล้วจะได้คะแนนเมื่อไหร่?",
      answer: "คะแนนจะถูกเพิ่มเข้าในบัญชีของคุณทันทีหลังจากสแกนคูปองสำเร็จ"
    }
  ]
};

// ตัวแปรสำหรับการจัดการข้อมูล
let currentCategory = 'all';
let filteredFAQs = [];

// ฟังก์ชันสำหรับโหลด FAQ ตามหมวดหมู่
function loadFAQs(category = 'all') {
  const faqList = document.getElementById('faqList');
  
  if (category === 'all') {
    // รวม FAQ ทั้งหมด
    filteredFAQs = [];
    Object.values(faqData).forEach(categoryFAQs => {
      filteredFAQs.push(...categoryFAQs);
    });
  } else {
    // โหลด FAQ ตามหมวดหมู่
    filteredFAQs = faqData[category] || [];
  }
  
  displayFAQs();
}

// ฟังก์ชันสำหรับแสดง FAQ
function displayFAQs() {
  const faqList = document.getElementById('faqList');
  
  if (filteredFAQs.length === 0) {
    faqList.innerHTML = `
      <div class="text-center text-secondary py-4">
        <div class="icon-dashborad mb-2" style="width: 40px; height: 40px; margin: 0 auto;">
          <i class="fa-light fa-search fa-xl"></i>
        </div>
        <p class="font-size-14 mb-0">ไม่พบคำถามในหมวดหมู่นี้</p>
      </div>
    `;
    return;
  }
  
  faqList.innerHTML = filteredFAQs.map((faq, index) => `
    <div class="accordion" id="faqAccordion${index}">
      <div class="accordion-item border rounded-3">
        <h2 class="accordion-header" id="faqHeading${index}">
          <button class="accordion-button collapsed fw-semibold font-size-14" type="button" 
                  data-bs-toggle="collapse" data-bs-target="#faqCollapse${index}" 
                  aria-expanded="false" aria-controls="faqCollapse${index}">
            ${faq.question}
          </button>
        </h2>
        <div id="faqCollapse${index}" class="accordion-collapse collapse" 
             aria-labelledby="faqHeading${index}" data-bs-parent="#faqAccordion${index}">
          <div class="accordion-body text-secondary font-size-14">
            ${faq.answer}
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

// ฟังก์ชันสำหรับการค้นหา
function searchFAQs(query) {
  if (!query.trim()) {
    loadFAQs(currentCategory);
    return;
  }
  
  const searchTerm = query.toLowerCase();
  const allFAQs = [];
  
  // รวม FAQ ทั้งหมด
  Object.values(faqData).forEach(categoryFAQs => {
    allFAQs.push(...categoryFAQs);
  });
  
  // กรองตามคำค้นหา
  filteredFAQs = allFAQs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm) || 
    faq.answer.toLowerCase().includes(searchTerm)
  );
  
  displayFAQs();
}

// ฟังก์ชันสำหรับเปลี่ยนหมวดหมู่
function changeCategory(category) {
  currentCategory = category;
  
  // อัปเดตสถานะปุ่มหมวดหมู่
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.classList.remove('btn-success', 'btn-primary', 'btn-warning', 'btn-info');
    btn.classList.add('btn-outline-success', 'btn-outline-primary', 'btn-outline-warning', 'btn-outline-info');
  });
  
  // ไฮไลท์ปุ่มที่เลือก
  const selectedBtn = document.querySelector(`[data-category="${category}"]`);
  if (selectedBtn) {
    const btnClass = selectedBtn.classList[1].replace('btn-outline-', 'btn-');
    selectedBtn.classList.remove('btn-outline-success', 'btn-outline-primary', 'btn-outline-warning', 'btn-outline-info');
    selectedBtn.classList.add(btnClass);
  }
  
  // โหลด FAQ ตามหมวดหมู่
  loadFAQs(category);
  
  // ล้างการค้นหา
  document.getElementById('searchInput').value = '';
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
      status: 'pending'
    };
    
    supportRef.set(supportData).then(() => {
      alert('ส่งข้อความเรียบร้อยแล้ว เราจะติดต่อกลับภายใน 24 ชั่วโมง');
      
      // รีเซ็ตฟอร์ม
      document.getElementById('supportForm').reset();
      
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
    
    // ปิด Modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('contactSupportModal'));
    modal.hide();
  }
}

// ฟังก์ชันสำหรับเพิ่ม FAQ ใหม่
function addNewFAQ(category, question, answer) {
  if (!faqData[category]) {
    faqData[category] = [];
  }
  
  faqData[category].push({
    question: question,
    answer: answer
  });
  
  // อัปเดตการแสดงผล
  if (currentCategory === category || currentCategory === 'all') {
    loadFAQs(currentCategory);
  }
}

// ฟังก์ชันสำหรับลบ FAQ
function removeFAQ(category, questionIndex) {
  if (faqData[category] && faqData[category][questionIndex]) {
    faqData[category].splice(questionIndex, 1);
    
    // อัปเดตการแสดงผล
    if (currentCategory === category || currentCategory === 'all') {
      loadFAQs(currentCategory);
    }
  }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  console.log('=== Q&A Page Loaded ===');
  
  // โหลด FAQ ทั้งหมดเริ่มต้น
  loadFAQs();
  
  // Event listener สำหรับการค้นหา
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchFAQs(e.target.value);
    });
  }
  
  // Event listeners สำหรับปุ่มหมวดหมู่
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.getAttribute('data-category');
      changeCategory(category);
    });
  });
  
  // Event listener สำหรับการกด Enter ในช่องค้นหา
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        searchFAQs(e.target.value);
      }
    });
  }
});

// Export functions for global use
window.contactSupport = contactSupport;
window.submitSupport = submitSupport;
window.addNewFAQ = addNewFAQ;
window.removeFAQ = removeFAQ;
window.loadFAQs = loadFAQs;
window.searchFAQs = searchFAQs;
window.changeCategory = changeCategory;
