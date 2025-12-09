import Swal from "sweetalert2";

export function discardCard(deckCards, setDeckCards, setEndCards, setEnd2Cards) {
    
    // ถ้า deck ว่าง
    if (!deckCards || deckCards.length === 0) {
        Swal.fire("ไม่มีการ์ดในเด็คให้ทิ้ง!");
        return;
    }

    // Popup เลือกใบที่ต้องการทิ้ง
    Swal.fire({
        title: "เลือกการ์ดที่ต้องการทิ้ง",
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
                        (img, index) => `
                            <img 
                                src="${img}" 
                                onclick="window._discardSelect(${index})"
                                style="width:100%; cursor:pointer; border-radius:8px; border:2px solid red;"
                            />
                        `
                    )
                    .join("")}
            </div>
        `,
        showConfirmButton: false,
        width: "800px",
    });

    // Global function สำหรับ SweetAlert ให้เลือกปลายทาง
    window._discardSelect = (index) => {
        const selectedCard = deckCards[index];

        Swal.fire({
            title: "ทิ้งการ์ดไปที่ไหน?",
            showCancelButton: true,
            confirmButtonText: "ไป END",
            cancelButtonText: "ไป END2",
        }).then((result) => {
            if (result.isConfirmed) {
                setEndCards((prev) => [...prev, selectedCard]);
            } else {
                setEnd2Cards((prev) => [...prev, selectedCard]);
            }

            // เอาใบออกจาก deck
            setDeckCards((prev) => prev.filter((_, i) => i !== index));

            Swal.fire({
                title: "ทิ้งการ์ดแล้ว",
                html: `<img src="${selectedCard}" style="width:200px; border-radius:10px; border:2px solid red;">`,
                icon: "success",
                timer: 1300,
            });
        });
    };
}
