import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getDatabase, set, get, ref } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

// Firebase Config ของคุณ
const firebaseConfig = {
  apiKey: "AIzaSyDW0AwKbYa1coRKP_lYDSB9GXCZVq2JwYo",
  authDomain: "activity-log-9da9b.firebaseapp.com",
  databaseURL: "https://activity-log-9da9b-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "activity-log-9da9b",
  storageBucket: "activity-log-9da9b.firebasestorage.app",
  messagingSenderId: "302930477910",
  appId: "1:302930477910:web:c35e578b8b9f57062f8cf7"
};

// เริ่มต้น Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ตัวแปร global สำหรับเก็บข้อมูลผู้ใช้
window.globalUserData = null;

document.addEventListener("DOMContentLoaded", function () {
  liff.init({ liffId: "2007520085-nVWrdM4A" })
    .then(() => {
      if (!liff.isLoggedIn()) {
        liff.login();
      } else {
        handleLineUser();
      }
    })
    .catch(err => {
      console.error('LIFF Initialization failed ', err);
    });
});

async function handleLineUser() {
  try {
    const profile = await liff.getProfile();
    const lineUserId = profile.userId;
    const regRef = ref(db, "registrations/" + lineUserId);

    // ตรวจสอบว่ามีข้อมูลใน Firebase หรือยัง
    const snapshot = await get(regRef);
    if (snapshot.exists()) {
      // มีข้อมูลแล้ว
      window.globalUserData = snapshot.val();
      console.log("User data from Firebase:", window.globalUserData); // แสดงข้อมูลที่ได้จาก Firebase
      // ป้องกัน redirect ซ้ำถ้าอยู่ที่ index.html อยู่แล้ว
      if (!window.location.pathname.endsWith("index.html")) {
        window.location.href = "index.html";
      }
    } else {
      // ยังไม่มีข้อมูล ให้แสดงฟอร์มลงทะเบียน
      window.lineUser = {
        lineUserId,
        lineProfile: {
          displayName: profile.displayName,
          pictureUrl: profile.pictureUrl,
          statusMessage: profile.statusMessage || ""
        }
      };
      console.log("LINE profile data:", window.lineUser); // แสดงข้อมูล LINE profile
      // ไม่ต้อง redirect, ให้ผู้ใช้กรอกฟอร์ม
    }
  } catch (err) {
    console.error('Error handling LINE user: ', err);
    alert("เกิดข้อผิดพลาดในการตรวจสอบผู้ใช้ LINE");
  }
}

// จับ Event ของฟอร์ม
const registrationForm = document.getElementById("registrationForm");
if (registrationForm) {
  registrationForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const surname = document.getElementById("surname").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();

    if (!name || !surname || !email || !phone) {
      alert("กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    if (!window.lineUser || !window.lineUser.lineUserId) {
      alert("ไม่พบ LINE User ID กรุณาเข้าสู่ระบบผ่าน LINE อีกครั้ง");
      return;
    }
    const regRef = ref(db, "registrations/" + window.lineUser.lineUserId);
    const userData = {
      name: name,
      surname: surname,
      email: email,
      phone: phone,
      lineUserId: window.lineUser.lineUserId,
      pictureUrl: window.lineUser.lineProfile.pictureUrl,
      displayName: window.lineUser.lineProfile.displayName,
      timestamp: Date.now(),
    };
    set(regRef, userData)
      .then(() => {
        window.globalUserData = userData;
        alert("บันทึกข้อมูลสำเร็จ");
        document.getElementById("registrationForm").reset();
        // ป้องกัน redirect ซ้ำถ้าอยู่ที่ index.html อยู่แล้ว
        if (!window.location.pathname.endsWith("index.html")) {
          window.location.href = "index.html";
        }
      })
      .catch((error) => {
        alert("เกิดข้อผิดพลาด: " + error.message);
      });
  });
}