import Swal from "sweetalert2";

export function viewDeck(deckCards) {
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
                        (img) =>
                            `<img src="${img}" style="width:100%; border-radius:8px; border:2px solid #000;" />`
                    )
                    .join("")}
            </div>
        `,
        confirmButtonText: "ปิด",
        width: "800px",
    });
}
