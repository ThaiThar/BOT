// src/components/Bas/hooks/modules/useTurnModule.js
import { useState, useEffect } from "react";
import Swal from "sweetalert2";

export function useTurnModule({ broadcast, myRole }) {
  // 1. เริ่มต้นเป็น null (ยังไม่มีใครเริ่ม)
  const [currentTurn, setCurrentTurn] = useState(null); 

  const isMyTurn = currentTurn === myRole;

  // 2. ✅ เพิ่ม Effect: ถ้าเราเป็น P1 ให้ทำการสุ่มเมื่อโหลดเสร็จ
  useEffect(() => {
    // ทำเฉพาะ P1 เพื่อให้ผลออกมาเหมือนกัน (Host เป็นคนคุม)
    if (myRole === "P1") {
      const timer = setTimeout(() => {
        // สุ่มเลข: ถ้า > 0.5 ให้ P1 เริ่ม, ถ้าไม่ใช่ให้ P2 เริ่ม
        const starter = Math.random() > 0.5 ? "P1" : "P2";
        
        // อัปเดตตัวเอง
        setCurrentTurn(starter);
        
        // ส่งบอกเพื่อน (ใช้ event ใหม่ชื่อ initial_turn)
        broadcast("initial_turn", starter);

        // แสดงผลฝั่งเรา
        showStartPopup(starter, "P1");
      }, 1500); // รอ 1.5 วิ ให้เพื่อน connect ให้ทันก่อน

      return () => clearTimeout(timer);
    }
  }, [myRole]); // รันครั้งเดียวตอน Mount

  // ฟังก์ชันจบเทิร์น (เหมือนเดิม)
  const endTurn = () => {
    if (!isMyTurn) return;
    const nextTurn = myRole === "P1" ? "P2" : "P1"; // สลับฝั่ง
    setCurrentTurn(nextTurn);
    
    Swal.fire({
      title: "⏳ จบเทิร์นของคุณ",
      text: "กำลังรอฝ่ายตรงข้าม...",
      timer: 1500,
      showConfirmButton: false,
      position: "top-end",
      backdrop: false,
      toast: true
    });

    broadcast("change_turn", nextTurn);
  };

  return { currentTurn, setCurrentTurn, isMyTurn, endTurn };
}

// Helper: ฟังก์ชันแสดง Popup เริ่มเกม
export const showStartPopup = (starter, myRole) => {
  const isMe = starter === myRole;
  Swal.fire({
    title: isMe ? "🎉 คุณได้เริ่มก่อน!" : "🛑 ฝ่ายตรงข้ามเริ่มก่อน",
    text: isMe ? "ลุยเลย! ตาของคุณแล้ว" : "กรุณารอ...",
    icon: isMe ? "success" : "warning",
    timer: 2500,
    showConfirmButton: false,
    backdrop: `rgba(0,0,0,0.8)`,
    allowOutsideClick: false
  });
};