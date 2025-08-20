# Page Configuration System

## 📋 **ภาพรวม**

ระบบ `pageConfig.js` เป็นระบบจัดการการตั้งค่าหน้าต่างๆ ในแอปพลิเคชัน โดยเฉพาะการจัดการ redirect และการจำแนกประเภทของหน้า

## 🚀 **ฟีเจอร์หลัก**

### **1. การจัดการ Redirect**
- ✅ **ป้องกัน redirect ซ้ำ** - ไม่ redirect ถ้าอยู่ที่หน้าเดิมอยู่แล้ว
- ✅ **ยกเว้นหน้าต่างๆ** - หน้าบางหน้าจะไม่ถูก redirect
- ✅ **จัดการ redirect อัตโนมัติ** - ไปหน้า register เมื่อยังไม่ได้ลงทะเบียน

### **2. การจำแนกประเภทหน้า**
- 🔐 **Auth Pages** - หน้าที่ต้องการการยืนยันตัวตน
- 🌐 **Public Pages** - หน้าสาธารณะที่ไม่ต้องการการยืนยันตัวตน  
- 🏠 **Core Pages** - หน้าหลักของระบบ

### **3. การจัดการหน้าที่ยกเว้น**
- ➕ **เพิ่มหน้าที่ยกเว้น** - เพิ่มหน้าอื่นๆ ได้ง่าย
- ➖ **ลบหน้าออกจากยกเว้น** - ลบหน้าออกจากรายการยกเว้น
- 📋 **ดูรายการหน้าที่ยกเว้น** - ตรวจสอบหน้าที่ยกเว้นทั้งหมด

## 📁 **โครงสร้างไฟล์**

```
javascript/
├── pageConfig.js          # ไฟล์หลักของระบบ
├── filebase.js            # ใช้ pageConfig.js
├── userDataManager.js     # จัดการข้อมูลผู้ใช้
└── script.js              # JavaScript ทั่วไป
```

## 🎯 **วิธีการใช้งาน**

### **1. เพิ่มหน้าใหม่ที่ไม่ต้องการ redirect**

```javascript
// เพิ่มหน้าใหม่ในรายการยกเว้น
window.addExcludedPage('new-page');

// หรือเพิ่มในไฟล์ pageConfig.js โดยตรง
const EXCLUDED_FROM_REDIRECT = [
  'scanner',
  'invite', 
  'upload',
  'new-page'  // เพิ่มตรงนี้
];
```

### **2. ตรวจสอบประเภทของหน้า**

```javascript
// ตรวจสอบว่าต้องการการยืนยันตัวตนหรือไม่
if (window.requiresAuthentication()) {
  console.log('หน้านี้ต้องการการยืนยันตัวตน');
}

// ตรวจสอบว่าเป็นหน้าสาธารณะหรือไม่
if (window.isPublicPage()) {
  console.log('หน้านี้เป็นหน้าสาธารณะ');
}

// ตรวจสอบว่าเป็นหน้าหลักหรือไม่
if (window.isCorePage()) {
  console.log('หน้านี้เป็นหน้าหลักของระบบ');
}
```

### **3. ตรวจสอบการ redirect**

```javascript
// ตรวจสอบว่าควร redirect ไปหน้า index.html หรือไม่
if (window.shouldRedirectTo('index.html')) {
  console.log('ควร redirect ไปหน้า index.html');
}

// ตรวจสอบว่าควร redirect ไปหน้า register.html หรือไม่
if (window.shouldRedirectTo('register.html')) {
  console.log('ควร redirect ไปหน้า register.html');
}
```

## 📋 **รายการหน้าที่ยกเว้น (ปัจจุบัน)**

### **หน้าที่ยกเว้นจากการ redirect ไปหน้า index.html:**
- `scanner` - หน้า scanner
- `invite` - หน้าเชิญเพื่อน
- `upload` - หน้าอัปโหลดไฟล์
- `guide` - หน้าคู่มือการใช้งาน
- `manual` - หน้าคู่มือ
- `q-and-a` - หน้าคำถามที่พบบ่อย
- `terms-and-conditions` - หน้าข้อกำหนดและเงื่อนไข
- `register` - หน้าลงทะเบียน
- `profile` - หน้าโปรไฟล์ (ถ้ามี)
- `settings` - หน้าตั้งค่า (ถ้ามี)
- `help` - หน้าช่วยเหลือ (ถ้ามี)
- `about` - หน้าเกี่ยวกับเรา (ถ้ามี)
- `contact` - หน้าติดต่อ (ถ้ามี)
- `faq` - หน้าคำถามที่พบบ่อย (ถ้ามี)
- `support` - หน้าสนับสนุน (ถ้ามี)
- `dashboard` - หน้าแดชบอร์ด (ถ้ามี)
- `admin` - หน้าผู้ดูแลระบบ (ถ้ามี)
- `reports` - หน้ารายงาน (ถ้ามี)
- `analytics` - หน้าวิเคราะห์ข้อมูล (ถ้ามี)
- `notifications` - หน้าแจ้งเตือน (ถ้ามี)

## 🔧 **การตั้งค่าในไฟล์ HTML**

### **ลำดับการโหลด Script:**
```html
<!-- 1. โหลด pageConfig.js ก่อน -->
<script src="javascript/pageConfig.js"></script>

<!-- 2. โหลด userDataManager.js -->
<script src="javascript/userDataManager.js"></script>

<!-- 3. โหลด filebase.js -->
<script src="javascript/filebase.js"></script>

<!-- 4. โหลด script อื่นๆ -->
<script src="javascript/script.js"></script>
```

## 📝 **ตัวอย่างการใช้งาน**

### **ตัวอย่างที่ 1: เพิ่มหน้าใหม่**
```javascript
// เพิ่มหน้า 'news' ในรายการยกเว้น
window.addExcludedPage('news');

// ตรวจสอบ
console.log('หน้าที่ยกเว้น:', window.getExcludedPages());
```

### **ตัวอย่างที่ 2: ตรวจสอบประเภทหน้า**
```javascript
// ตรวจสอบว่าหน้าปัจจุบันต้องการการยืนยันตัวตนหรือไม่
if (window.requiresAuthentication()) {
  // แสดงปุ่มเข้าสู่ระบบ
  showLoginButton();
} else {
  // ซ่อนปุ่มเข้าสู่ระบบ
  hideLoginButton();
}
```

### **ตัวอย่างที่ 3: จัดการ redirect แบบกำหนดเอง**
```javascript
// ตรวจสอบว่าควร redirect หรือไม่
if (window.shouldRedirectTo('index.html')) {
  // แสดงข้อความแจ้งเตือนก่อน redirect
  if (confirm('ต้องการไปหน้าแรกหรือไม่?')) {
    window.location.href = 'index.html';
  }
}
```

## 🚨 **ข้อควรระวัง**

1. **ลำดับการโหลด** - `pageConfig.js` ต้องโหลดก่อน `filebase.js`
2. **การตั้งชื่อหน้า** - ใช้ชื่อที่สอดคล้องกับ path ใน URL
3. **การเพิ่มหน้าที่ยกเว้น** - ตรวจสอบว่าไม่ซ้ำกับหน้าที่มีอยู่

## 🔄 **การอัปเดต**

### **เพิ่มหน้าที่ยกเว้นใหม่:**
```javascript
// ในไฟล์ pageConfig.js
const EXCLUDED_FROM_REDIRECT = [
  // ... หน้าที่ยกเว้นเดิม
  'new-page-name'  // เพิ่มตรงนี้
];
```

### **ลบหน้าออกจากยกเว้น:**
```javascript
// ใช้ฟังก์ชัน removeExcludedPage
window.removeExcludedPage('page-name');
```

## 📞 **การสนับสนุน**

หากมีปัญหาหรือต้องการความช่วยเหลือ:
1. ตรวจสอบ Console ใน Developer Tools
2. ตรวจสอบลำดับการโหลด Script
3. ตรวจสอบการตั้งค่าใน `pageConfig.js`

---

**หมายเหตุ:** ระบบนี้ถูกออกแบบให้ง่ายต่อการบำรุงรักษาและขยายตัวในอนาคต
