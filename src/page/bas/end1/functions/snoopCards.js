// src/components/Bas/end1/functions/snoopCards.js
import Swal from "sweetalert2";

export function snoopCards(deckCards, startSnoopSession) { // ✅ รับ startSnoopSession แทน
  if (!deckCards || deckCards.length === 0) {
    return Swal.fire("❌ ยังไม่มีการ์ดในเด็ค");
  }

  Swal.fire({
    title: "สอดแนมกี่ใบ?",
    input: "number",
    inputAttributes: { min: 1, max: deckCards.length },
    confirmButtonText: "เริ่มส่อง",
    background: "#111",
    color: "#fff"
  }).then((res) => {
    if (!res.isConfirmed) return;

    let count = parseInt(res.value);
    if (isNaN(count) || count < 1 || count > deckCards.length) {
      return Swal.fire("จำนวนไม่ถูกต้อง");
    }

    // ตัดการ์ดออกมา
    const peekCards = deckCards.slice(0, count);

    // 🔥 เรียกฟังก์ชันเริ่ม Session (ไปเปิด Overlay แทน)
    startSnoopSession(peekCards);
  });
}