// src/components/Bas/HandButton.js
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "./handbutton.css";
// ✅ Import รูปหลังการ์ด (ตรวจสอบ Path ให้ถูกต้องนะครับ)
import Backcardhand from "../../../assets/backcard.jpg"

function HandButton({
  handCards,
  setHandCards,
  magicSlots,
  setMagicSlots,
  avatarSlots,
  setAvatarSlots,
  modSlots,
  setModSlots,
  end1Cards,
  setEnd1Cards,
  end2Cards,
  setEnd2Cards,
  initiateSummon,
  isEnemy,
  enemyHandCount = 0,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [leftPos, setLeftPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const cardBackImg = Backcardhand;

  const safeHandCards = Array.isArray(handCards) ? handCards : [];
  const safeModSlots = Array.isArray(modSlots) ? modSlots : [[], [], [], []];

  // ฟังก์ชันลบการ์ดจากมือ
  const removeCardFromHand = (handIndex) => {
    setHandCards((prev) => Array.isArray(prev) ? prev.filter((_, i) => i !== handIndex) : []);
  };

  // -----------------------------------------------------
  // ⚔️ Action Functions
  // -----------------------------------------------------
  const dropToBattle = (img, handIndex) => initiateSummon?.(img, "battle");
  
  const dropToMagic = (img, handIndex) => {
    const idx = magicSlots.indexOf(null);
    if (idx === -1) return Swal.fire("❌ Magic Zone เต็มแล้ว");
    initiateSummon?.(img, `magic-${idx}`);
  };

  const dropToAvatar = (img, handIndex) => {
    const idx = avatarSlots.indexOf(null);
    if (idx === -1) return Swal.fire("❌ Avatar Zone เต็มแล้ว");
    initiateSummon?.(img, idx);
  };

  const dropToModification = (img, handIndex) => {
     Swal.fire({
        title: "ลงเป็น Modification ของ Avatar ช่องไหน?",
        input: "select",
        inputOptions: { 0: "Avatar 1", 1: "Avatar 2", 2: "Avatar 3", 3: "Avatar 4" },
        confirmButtonText: "ลงการ์ด",
        background: "#222",
        color: "#fff",
      }).then((res) => {
        if (!res.isConfirmed) return;
        const avatarIndex = Number(res.value);
        if (!avatarSlots[avatarIndex]) return Swal.fire("❌ Avatar ยังไม่มีการ์ด");
        const updated = [...safeModSlots];
        updated[avatarIndex] = [...updated[avatarIndex], img];
        setModSlots(updated);
        removeCardFromHand(handIndex);
      });
  };

  // =====================================================
  // 🔥🔥🔥 ฟังก์ชันทิ้งการ์ดลง End (แก้ไขตามที่ขอ) 🔥🔥🔥
  // =====================================================
  const dropToEnd1 = (img, handIndex) => {
     // 1. เพิ่มการ์ดลงกอง End1 (สุสานเรา)
     setEnd1Cards((prev) => [...prev, img]);
     // 2. ลบออกจากมือ
     removeCardFromHand(handIndex);
  };

  const dropToEnd2 = (img, handIndex) => {
     // 1. เพิ่มการ์ดลงกอง End2 (สุสานศัตรู - กรณีขโมยมาแล้วคืน)
     setEnd2Cards((prev) => [...prev, img]);
     // 2. ลบออกจากมือ
     removeCardFromHand(handIndex);
  };

  // -----------------------------------------------------
  // 🎮 Action Menu
  // -----------------------------------------------------
  const openCardAction = (img, handIndex) => {
      Swal.fire({
        title: "เลือกการกระทำ",
        html: `
          <img src="${img}" width="300px" style="border-radius:10px;margin-bottom:10px; border: 2px solid #fff;" />
          <div class="action-btn-wrap">
            <button class="zone-btn" id="btnBattleCenter">⚔️ ลง Battle</button>
            <button class="zone-btn" id="btnMagic">⚡ Magic</button>
            <button class="zone-btn" id="btnAvatar">🛡 Avatar</button>
            <button class="zone-btn" id="btnMod">🔧 Modification</button>
            <div style="display:flex; gap:5px; margin-top:5px;">
              <button class="zone-btn danger" id="btnEnd1">🔥 ทิ้งลง END1</button>
              <button class="zone-btn danger" id="btnEnd2">💀 ทิ้งลง END2</button>
            </div>
          </div>
        `,
        showConfirmButton: false, 
        width: 450, 
        background: "#111", 
        color: "#fff",
      });

      setTimeout(() => {
        const bind = (id, fn) => { 
            const el = document.getElementById(id); 
            if (el) el.onclick = () => { Swal.close(); fn(); }; 
        };

        bind("btnBattleCenter", () => dropToBattle(img, handIndex));
        bind("btnMagic", () => dropToMagic(img, handIndex));
        bind("btnAvatar", () => dropToAvatar(img, handIndex));
        bind("btnMod", () => dropToModification(img, handIndex));

        // ✅ เรียกใช้ฟังก์ชันทิ้งการ์ดที่เขียนไว้ด้านบน
        bind("btnEnd1", () => dropToEnd1(img, handIndex));
        bind("btnEnd2", () => dropToEnd2(img, handIndex));
      }, 50);
  };

  const openHandPopup = () => {
    if (isEnemy) {
        const enemyCardsArray = Array.from({ length: enemyHandCount });
        return Swal.fire({
            title: `มือของคู่แข่ง (${enemyHandCount} ใบ)`,
            html: `
              <div class="hand-grid">
                ${enemyCardsArray.map(() => `
                    <img src="${cardBackImg}" class="hand-img" style="cursor: default; opacity: 0.8;" />
                `).join("")}
              </div>
            `,
            width: "750px", background: "#111", color: "#fff", showConfirmButton: false, showCloseButton: true,
        });
    }

    if (safeHandCards.length === 0) return Swal.fire({ title: "🔹 ไม่มีการ์ดในมือ", background: "#111", color: "#fff" });

    Swal.fire({
      title: `การ์ดในมือ (${safeHandCards.length} ใบ)`,
      html: `<div class="hand-grid">${safeHandCards.map((img, i) => `<img src="${img}" class="hand-img" data-i="${i}" />`).join("")}</div>`,
      width: "750px", background: "#111", color: "#fff", showConfirmButton: false,
    });
    setTimeout(() => {
      document.querySelectorAll(".hand-img").forEach((el) => {
        if(el.dataset.i) {
            el.onclick = () => { const idx = Number(el.dataset.i); Swal.close(); openCardAction(safeHandCards[idx], idx); };
        }
      });
    }, 50);
  };

  // Logic การลาก (Slider)
  const handleMouseDown = (e) => {
    if (e.target.className.includes("mini-card")) return;
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      let percentage = (e.clientX / window.innerWidth) * 100;
      if (percentage < 5) percentage = 5;
      if (percentage > 95) percentage = 95;
      setLeftPos(percentage);
    };
    const handleMouseUp = () => { setIsDragging(false); };
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div 
      className="hand-slider-wrapper"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={handleMouseDown}
      style={{ left: `${leftPos}%`, cursor: isDragging ? "grabbing" : "grab" }}
    >
      {isHovered && (
          <div className="hand-preview-container">
            {isEnemy ? (
                enemyHandCount > 0 ? (
                    Array.from({ length: enemyHandCount }).map((_, idx) => (
                        <img key={idx} src={cardBackImg} alt="enemy-card" className="mini-card-preview" />
                    ))
                ) : (
                    <span style={{color:'#aaa', fontSize:'12px'}}>ไม่มีการ์ด</span>
                )
            ) : (
                safeHandCards.length > 0 && safeHandCards.map((img, idx) => (
                    <img key={idx} src={img} alt="card" className="mini-card-preview" />
                ))
            )}
          </div>
      )}

      <button
        className="hand-floating-btn"
        onClick={openHandPopup}
        disabled={false}
        style={{
          background: isEnemy ? "linear-gradient(45deg, #c0392b, #e74c3c)" : undefined,
        }}
      >
        {isEnemy
          ? `🎴 Enemy (${enemyHandCount})`
          : `🎴 Hand (${safeHandCards.length})`}
      </button>
    </div>
  );
}

export default HandButton;