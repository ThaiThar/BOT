import Swal from "sweetalert2";

export function viewDeck(deckCards, setDeckCards, setHandCards) {
    if (!deckCards || deckCards.length === 0) {
        Swal.fire("ยังไม่มีการ์ดในเด็ค");
        return;
    }

    Swal.fire({
        title: `การ์ดในเด็คทั้งหมด (${deckCards.length} ใบ)`,
        html: `
            <div style="
                display: grid;
                grid-template-columns: repeat(5, 1fr);
                gap: 10px;
                max-height: 400px;
                overflow-y: auto;
            ">
                ${deckCards
                    .map(
                        (img, index) =>
                            `<img 
                                src="${img}" 
                                style="width:100%; cursor:pointer; border-radius:8px; border:2px solid #000;" 
                                onclick="window.pickDeckCard(${index})"
                            />`
                    )
                    .join("")}
            </div>
        `,
        showConfirmButton: false,
        width: "800px",
        background: "#111",
        color: "#fff"
    });

    // ↑ เพิ่มฟังก์ชัน Global สำหรับเลือกการ์ด
    window.pickDeckCard = (index) => {
        const chosen = deckCards[index];

        // เพิ่มเข้ามือ
        setHandCards(prev => [...prev, chosen]);

        // ลบออกจาก Deck
        setDeckCards(prev => prev.filter((_, i) => i !== index));

        // ปิด swal
        Swal.close();
    };
}
