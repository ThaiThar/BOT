import Swal from "sweetalert2";

/**
 * ฟังก์ชันสอดแนมการ์ด
 * @param {Array} deckCards
 * @param {Function} setDeckCards
 * @param {Function} setHandCards
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
    confirmButtonText: "ตกลง",
  }).then((res) => {
    if (!res.isConfirmed) return;

    let count = parseInt(res.value);
    if (isNaN(count) || count < 1) return Swal.fire("จำนวนไม่ถูกต้อง");

    if (count > deckCards.length) {
      return Swal.fire("❌ ในกองมีการ์ดไม่พอ");
    }

    const peekCards = deckCards.slice(0, count);

    const html = `
      <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin-bottom:15px;">
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

      <button id="btnSkip" style="
        width:100%; padding:10px; border-radius:8px;
        background:#444; color:#fff; border:2px solid #888; cursor:pointer;
      ">ไม่เลือก (ส่งลงใต้กองทั้งหมด)</button>
    `;

    Swal.fire({
      title: `เลือกการ์ด 1 ใบจาก ${count} ใบ`,
      html,
      width: 600,
      showConfirmButton: false,
      background: "#111",
      color: "#fff",
          allowOutsideClick: false,
    });

    setTimeout(() => {
      // -------------------------------
      // ✔ กดไม่เลือก → การ์ดทั้งหมดลงใต้กอง
      // -------------------------------
      const skipBtn = document.getElementById("btnSkip");
      skipBtn.onclick = () => {
        Swal.close();

        const updatedDeck = [
          ...deckCards.slice(count), // ลบใบที่ดู
          ...peekCards,              // ย้ายลงท้ายกอง
        ];

        setDeckCards(updatedDeck);

        Swal.fire("✔ ส่งลงใต้กองทั้งหมดแล้ว", "", "success");
      };

      // -------------------------------
      // ✔ เลือกปกติ → ใบที่เลือก เข้ามือ
      // -------------------------------
      document.querySelectorAll(".snoop-card").forEach((el) => {
        el.onclick = () => {
          const index = parseInt(el.dataset.index);
          const chosen = peekCards[index];

          Swal.close();

          // ใบที่เลือก → มือ
          setHandCards((prev) => [...prev, chosen]);

          // ใบที่ไม่ได้เลือก → ใต้กอง
          const leftover = peekCards.filter((_, i) => i !== index);

          const updatedDeck = [
            ...deckCards.slice(count),
            ...leftover,
          ];

          setDeckCards(updatedDeck);

          Swal.fire("✔ เลือกการ์ดแล้ว", "", "success");
        };
      });
    }, 50);
  });
}
