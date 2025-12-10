import React, { useEffect } from "react";
import Swal from "sweetalert2";
import "./handbutton.css";

function HandButton({
    handCards, setHandCards,
    magicSlots, setMagicSlots,
    avatarSlots, setAvatarSlots,
    modSlots, setModSlots,
    end1Cards, setEnd1Cards,
    end2Cards, setEnd2Cards
}) {

    const dropToMagic = (img) => {
        const idx = magicSlots.indexOf(null);
        if (idx === -1) {
            Swal.fire("❌ Magic Zone เต็มแล้ว (4 ใบ)");
            return;
        }

        const updated = [...magicSlots];
        updated[idx] = img;
        setMagicSlots(updated);

        removeCardFromHand(img);
    };


    const dropToAvatar = (img) => {
        const idx = avatarSlots.indexOf(null);
        if (idx === -1) {
            Swal.fire("❌ Avatar Zone เต็มแล้ว (4 ใบ)");
            return;
        }

        const updated = [...avatarSlots];
        updated[idx] = img;
        setAvatarSlots(updated);

        removeCardFromHand(img);
    };


    const dropToModification = (img) => {
        Swal.fire({
            title: "ลงเป็น Modification ของช่อง Avatar ไหน?",
            input: "select",
            inputOptions: {
                0: "Avatar ช่อง 1",
                1: "Avatar ช่อง 2",
                2: "Avatar ช่อง 3",
                3: "Avatar ช่อง 4",
            },
            confirmButtonText: "ลงการ์ด",
        }).then(res => {
            if (!res.isConfirmed) return;

            const avatarIndex = parseInt(res.value);

            if (!avatarSlots[avatarIndex]) {
                Swal.fire("❌ ช่อง Avatar นี้ยังไม่มีการ์ด");
                return;
            }

            const updated = [...modSlots];
            updated[avatarIndex] = [...updated[avatarIndex], img];
            setModSlots(updated);

            removeCardFromHand(img);
        });
    };


    const removeCardFromHand = (img) => {
        setHandCards(prev => prev.filter(card => card !== img));
    };


    const openCardAction = (img) => {
        Swal.fire({
            title: "เลือกการกระทำ",
            html: `
            <img src="${img}" width="500px" class="preview-card" />
            <div class="action-btn-wrap">
                <button class="zone-btn" id="btnMagic">⚡ Magic</button>
                <button class="zone-btn" id="btnAvatar">🛡 Avatar</button>
                <button class="zone-btn" id="btnMod">🔧 Modification</button>
                <button class="zone-btn danger" id="btnEnd1">🔥 ทิ้งไป END1</button>
                <button class="zone-btn danger" id="btnEnd2">💀 ทิ้งไป END2</button>
            </div>
        `,
            showConfirmButton: false,
            width: 550,
            background: "#111",
            color: "#fff",
            allowOutsideClick: false,
            allowEscapeKey: true
        });

        setTimeout(() => {
            const disableAll = () => {
                document.querySelectorAll(".zone-btn").forEach(btn => btn.disabled = true);
            };

            document.getElementById("btnMagic").onclick = () => {
                disableAll();
                Swal.close();
                dropToMagic(img);
            };

            document.getElementById("btnAvatar").onclick = () => {
                disableAll();
                Swal.close();
                dropToAvatar(img);
            };

            document.getElementById("btnMod").onclick = () => {
                disableAll();
                Swal.close();
                dropToModification(img);
            };

            document.getElementById("btnEnd1").onclick = () => {
                disableAll();
                Swal.close();
                setEnd1Cards(prev => [...prev, img]);
                removeCardFromHand(img);
            };

            document.getElementById("btnEnd2").onclick = () => {
                disableAll();
                Swal.close();
                setEnd2Cards(prev => [...prev, img]);
                removeCardFromHand(img);
            };

        }, 20);
    };




    const openHandPopup = () => {

        if (handCards.length === 0) {
            Swal.fire("🔹 คุณยังไม่มีการ์ดในมือ");
            return;
        }

        Swal.fire({
            title: `การ์ดในมือ (${handCards.length} ใบ)`,
            html: `
                <div class="hand-grid">
                    ${handCards
                    .map(
                        (img) => `
                                <img 
                                    src="${img}" 
                                    class="hand-img"
                                    onclick="window.openCardAction('${img}')"
                                />
                            `
                    ).join("")}
                </div>
            `,
            width: "700px",
            background: "#111",
            color: "#fff"
        });

        window.openCardAction = openCardAction;
    };


    return (
        <button className="hand-floating-btn" onClick={openHandPopup}>
            🎴 Hand ({handCards.length})
        </button>
    );
}

export default HandButton;
