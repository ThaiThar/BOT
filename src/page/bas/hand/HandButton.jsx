// src/components/Bas/hand/HandButton.jsx
import React from "react";
import Swal from "sweetalert2";
import "./handbutton.css";

function HandButton({
    handCards, setHandCards,
    magicSlots, setMagicSlots,
    avatarSlots, setAvatarSlots,
    modSlots, setModSlots,
    end1Cards, setEnd1Cards,
    end2Cards, setEnd2Cards,
    
    // ✅ รับ Props initiateSummon เข้ามา (ต้องแก้ใน Bas.jsx ให้ส่งมาด้วยนะ)
    initiateSummon
}) {

    // ------------------------------
    // ลบการ์ดจากมือแบบ index-safe
    // ------------------------------
    const removeCardFromHand = (handIndex) => {
        setHandCards(prev => prev.filter((_, i) => i !== handIndex));
    };

    // ------------------------------
    // ลง Magic
    // ------------------------------
    const dropToMagic = (img, handIndex) => {
        const idx = magicSlots.indexOf(null);
        if (idx === -1) return Swal.fire("❌ Magic Zone เต็มแล้ว");

        const updated = [...magicSlots];
        updated[idx] = img;
        setMagicSlots(updated);

        removeCardFromHand(handIndex);
    };

    // ------------------------------
    // ลง Avatar (✅ แก้ไขให้เรียก Summon System)
    // ------------------------------
    const dropToAvatar = (img, handIndex) => {
        const idx = avatarSlots.indexOf(null);
        if (idx === -1) return Swal.fire("❌ Avatar Zone เต็มแล้ว");

        // ⚠️ ไม่เรียก setAvatarSlots โดยตรงแล้ว
        // เรียก initiateSummon แทน -> มันจะลบการ์ดจากมือและเริ่มนับถอยหลังให้
        
        if (initiateSummon) {
            initiateSummon(img, idx); // img คือรูป, idx คือช่องที่จะลง
        } else {
            console.error("initiateSummon function is missing!");
            // Fallback (เผื่อฉุกเฉิน)
            const updated = [...avatarSlots];
            updated[idx] = img;
            setAvatarSlots(updated);
            removeCardFromHand(handIndex);
        }
    };

    // ------------------------------
    // ลง Modification
    // ------------------------------
    const dropToModification = (img, handIndex) => {
        Swal.fire({
            title: "ลงเป็น Modification ของ Avatar ช่องไหน?",
            input: "select",
            inputOptions: {
                0: "Avatar ช่อง 1",
                1: "Avatar ช่อง 2",
                2: "Avatar ช่อง 3",
                3: "Avatar ช่อง 4"
            },
            confirmButtonText: "ลงการ์ด",
        }).then(res => {
            if (!res.isConfirmed) return;

            const avatarIndex = parseInt(res.value);
            // เช็คว่ามี Avatar อยู่ไหม (ถ้า Avatar กำลัง Pending ก็ลง Mod ไม่ได้นะ)
            if (!avatarSlots[avatarIndex])
                return Swal.fire("❌ Avatar ยังไม่มีการ์ด (หรือกำลังร่าย)");

            const updated = [...modSlots];
            updated[avatarIndex] = [...(updated[avatarIndex] || []), img]; // กันเหนียวเผื่อเป็น undefined
            setModSlots(updated);

            removeCardFromHand(handIndex);
        });
    };

    // ------------------------------
    // เมนูตอนจิ้มการ์ดในมือ
    // ------------------------------
    const openCardAction = (img, handIndex) => {

        Swal.fire({
            title: "เลือกการกระทำ",
            html: `
                <img src="${img}" width="500px" style="border-radius:10px;margin-bottom:10px;" />
                <div class="action-btn-wrap">
                    <button class="zone-btn" id="btnMagic">⚡ Magic</button>
                    <button class="zone-btn" id="btnAvatar">🛡 Avatar</button>
                    <button class="zone-btn" id="btnMod">🔧 Modification</button>
                    <button class="zone-btn danger" id="btnEnd1">🔥 ทิ้ง END1</button>
                    <button class="zone-btn danger" id="btnEnd2">💀 ทิ้ง END2</button>
                </div>
            `,
            showConfirmButton: false,
            width: 550,
            background: "#111",
            color: "#fff",
        });

        setTimeout(() => {
            const disableAll = () =>
                document.querySelectorAll(".zone-btn").forEach(btn => btn.disabled = true);

            document.getElementById("btnMagic").onclick = () => {
                disableAll();
                Swal.close();
                dropToMagic(img, handIndex);
            };

            document.getElementById("btnAvatar").onclick = () => {
                disableAll();
                Swal.close();
                dropToAvatar(img, handIndex); // เรียกตัวใหม่
            };

            document.getElementById("btnMod").onclick = () => {
                disableAll();
                Swal.close();
                dropToModification(img, handIndex);
            };

            document.getElementById("btnEnd1").onclick = () => {
                disableAll();
                Swal.close();
                setEnd1Cards(prev => [...prev, img]);
                removeCardFromHand(handIndex);
            };

            document.getElementById("btnEnd2").onclick = () => {
                disableAll();
                Swal.close();
                setEnd2Cards(prev => [...prev, img]);
                removeCardFromHand(handIndex);
            };

        }, 25);

    };

    // ------------------------------
    // เปิด Hand ทั้งหมด
    // ------------------------------
    const openHandPopup = () => {

        if (handCards.length === 0)
            return Swal.fire("🔹 ไม่มีการ์ดในมือ");

        Swal.fire({
            title: `การ์ดในมือ (${handCards.length} ใบ)`,
            html: `
                <div class="hand-grid">
                    ${handCards.map((img, i) => `
                        <img 
                            src="${img}" 
                            class="hand-img"
                            onclick='window.openCardAction(${JSON.stringify(img)}, ${i})'
                        />
                    `).join("")}
                </div>
            `,
            width: "750px",
            background: "#111",
            color: "#fff",
        });

        window.openCardAction = (img, idx) => {
             // ปิด Popup Hand ก่อนเปิด Action Menu ไม่งั้นซ้อนกัน
             Swal.close();
             setTimeout(() => openCardAction(img, idx), 300); // รอ animation ปิดนิดนึง
        };
    };

    return (
        <button className="hand-floating-btn" onClick={openHandPopup}>
            🎴 Hand ({handCards.length})
        </button>
    );
}

export default HandButton;