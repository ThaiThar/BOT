import Swal from "sweetalert2";

/**
 * ฟังก์ชันสอดแนมการ์ด
 * @param {Array} deckCards - กองการ์ดทั้งหมด
 * @param {Function} setDeckCards - setter อัปเดตกอง
 * @param {Function} setHandCards - setter เพิ่มเข้ามือ
 */
export function snoopCards(deckCards, setDeckCards, setHandCards) {
  if (!deckCards || deckCards.length === 0) {
    return Swal.fire("❌ ยังไม่มีการ์ดในเด็ค");
  }

  Swal.fire({
    title: "สอดแนมกี่ใบ?",
    input: "number",
    inputAttributes: { min: 1, max: deckCards.length },
    inputPlaceholder: "จำนวนการ์ดที่ต้องการดู",
    confirmButtonText: "สอดแนม",
  }).then(res => {
    if (!res.isConfirmed) return;

    let count = parseInt(res.value);
    if (isNaN(count) || count < 1) return Swal.fire("จำนวนไม่ถูกต้อง");

    if (count > deckCards.length) {
      return Swal.fire("❌ ในกองมีการ์ดไม่พอ");
    }

    const peekCards = deckCards.slice(0, count); // การ์ดที่ดึงมาดู

    const html = `
      <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:10px;">
        ${peekCards
          .map(
            (img, i) => `
              <img 
                src="${img}"
                class="snoop-card"
                data-index="${i}"
                style="width:100%; cursor:pointer; border-radius:8px; border:2px solid #fff;"
              />
            `
          )
          .join("")}
      </div>
    `;

    Swal.fire({
      title: `เลือกการ์ด 1 ใบจาก ${count} ใบ`,
      html,
      width: 600,
      showConfirmButton: false,
      background: "#111",
      color: "#fff",
    });

    // ให้ Swal แสดงผลก่อน แล้วผูก onclick
    setTimeout(() => {
      document.querySelectorAll(".snoop-card").forEach((el) => {
        el.onclick = () => {
          const index = parseInt(el.dataset.index);
          const chosen = peekCards[index];

          Swal.close();

          // ใบที่เลือก → มือ
          setHandCards(prev => [...prev, chosen]);

          // ใบที่เหลือ → ใต้กอง
          const leftover = peekCards.filter((_, i) => i !== index);

          // อัปเดต deck → (ตัด peek ออก) + leftover ไปท้าย
          const updatedDeck = [
            ...deckCards.slice(count),
            ...leftover
          ];

          setDeckCards(updatedDeck);

          Swal.fire("✔ เลือกการ์ดแล้ว", "", "success");
        };
      });
    }, 50);
  });
}
