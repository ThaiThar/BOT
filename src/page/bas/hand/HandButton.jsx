import React, { useEffect } from "react";
import Swal from "sweetalert2";
import "./handbutton.css";

function HandButton({ handCards }) {

    useEffect(() => {
        // ฟังก์ชันสำหรับดูรูปใบเดียวแบบใหญ่
        window.showSingleCard = (img) => {
            Swal.fire({
                html: `
                    <img src="${img}" 
                        style="width:100%; border-radius:10px; border: 2px solid #000;" />
                `,
                width: "450px",
                background: "#111",
                confirmButtonText: "ปิด",
            });
        };
    }, []);

    const openHandPopup = () => {

        if (handCards.length === 0) {
            Swal.fire("🔹 คุณยังไม่มีการ์ดในมือ");
            return;
        }

        Swal.fire({
            title: `การ์ดในมือ (${handCards.length} ใบ)`,
            html: `
                <div style="
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 10px;
                    max-height: 420px;
                    overflow-y: auto;
                ">
                    ${handCards
                        .map(
                            (img) => `
                                <img 
                                    src="${img}" 
                                    style="width:100%; cursor:pointer; border-radius:8px; border:2px solid #000;" 
                                    onclick="window.showSingleCard('${img}')"
                                />
                            `
                        )
                        .join("")}
                </div>
            `,
            width: "700px",
            confirmButtonText: "ปิด",
        });
    };

    return (
        <button className="hand-floating-btn" onClick={openHandPopup}>
            🎴 Hand ({handCards.length})
        </button>
    );
}

export default HandButton;
