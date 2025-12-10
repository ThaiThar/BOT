import Swal from "sweetalert2";

// ฟังก์ชันนี้จะรับไฟล์ -> ส่งไป PHP -> ได้ URL กลับมา -> ส่งต่อให้ callback
export async function handleChooseCards(files, callback) {
  const selectedFiles = Array.from(files);

  // 1. เช็คจำนวน
  if (selectedFiles.length !== 50) {
    Swal.fire({
      icon: "error",
      title: "จำนวนไม่ครบ!",
      text: `คุณเลือก ${selectedFiles.length} ใบ (ต้องครบ 50 ใบ)`,
    });
    return;
  }

  // 2. แสดง Loading
  Swal.fire({
    title: "กำลังอัปโหลด...",
    text: "กรุณารอสักครู่ ระบบกำลังส่งการ์ดไปที่ Server",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  try {
    // 3. เตรียมข้อมูลส่ง (FormData)
    const formData = new FormData();
    selectedFiles.forEach((file) => {
      // ⚠️ สำคัญ: ต้องใส่ [] เพื่อให้ PHP รู้ว่าเป็น array หลายไฟล์
      formData.append("cards[]", file);
    });

    // 4. ยิงไปที่ Server PHP (เปลี่ยน URL ตามที่ Laragon สร้างให้)
    // ปกติ Laragon จะเข้าผ่าน localhost/ชื่อโฟลเดอร์ หรือ ชื่อโฟลเดอร์.test
    const API_URL = "https://agenda.bkkthon.ac.th/card-game-api/upload.php"; 

    const response = await fetch(API_URL, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (data.success) {
      Swal.close();
      // 5. ส่ง URL กลับไปให้ระบบทำงานต่อ
      callback(data.urls);
    } else {
      throw new Error(data.message || "Upload failed");
    }

  } catch (error) {
    console.error("Upload Error:", error);
    Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถเชื่อมต่อ Server หรืออัปโหลดล้มเหลว", "error");
  }
}