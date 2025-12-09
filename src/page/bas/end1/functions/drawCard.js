// src/page/bas/end1/functions/drawCard.js
import Swal from "sweetalert2";

export function drawCard(deckCards, setDeckCards, onDrawCard) {
  // ตรวจว่ามีการ์ดเหลือไหม
  if (!deckCards || deckCards.length === 0) {
    Swal.fire("ไม่มีการ์ดเหลือในกอง!");
    return;
  }

  // หยิบใบบนสุด
  const topCard = deckCards[0];

  // เอาใบแรกออกจากกอง
  setDeckCards((prev) => prev.slice(1));

  // ส่งการ์ดไปให้ Hand (ผ่าน onDrawCard จาก End1 props)
  if (typeof onDrawCard === "function") {
    onDrawCard(topCard);
  }
}
