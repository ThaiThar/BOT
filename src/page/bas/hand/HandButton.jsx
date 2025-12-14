import React from "react";
import Swal from "sweetalert2";
import "./handbutton.css";

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
  const safeHandCards = Array.isArray(handCards) ? handCards : [];
  const safeModSlots = Array.isArray(modSlots) ? modSlots : [[], [], [], []];

  // ฟังก์ชันลบการ์ดจากมือ (ใช้สำหรับ Action แบบ Local เช่น ทิ้งการ์ด หรือ Mod)
  const removeCardFromHand = (handIndex) => {
    setHandCards((prev) =>
      Array.isArray(prev) ? prev.filter((_, i) => i !== handIndex) : []
    );
  };

  // -----------------------------------------------------
  // ⚔️ ลง Battle (ใช้ initiateSummon -> ให้ Parent ลบการ์ด)
  // -----------------------------------------------------
  const dropToBattle = (img, handIndex) => {
    initiateSummon?.(img, "battle");
    // ❌ เอาออก: removeCardFromHand(handIndex); 
    // ✅ รอให้ Server/Parent อัปเดต handCards กลับมาเอง
  };

  // -----------------------------------------------------
  // ⚡ ลง Magic (ใช้ initiateSummon -> ให้ Parent ลบการ์ด)
  // -----------------------------------------------------
  const dropToMagic = (img, handIndex) => {
    const idx = magicSlots.indexOf(null);
    if (idx === -1) return Swal.fire("❌ Magic Zone เต็มแล้ว");

    initiateSummon?.(img, `magic-${idx}`);
    // ❌ เอาออก: removeCardFromHand(handIndex);
  };

  // -----------------------------------------------------
  // 🛡 ลง Avatar (ใช้ initiateSummon -> ให้ Parent ลบการ์ด)
  // -----------------------------------------------------
  const dropToAvatar = (img, handIndex) => {
    const idx = avatarSlots.indexOf(null);
    if (idx === -1) return Swal.fire("❌ Avatar Zone เต็มแล้ว");

    initiateSummon?.(img, idx);
    // ❌ เอาออก: removeCardFromHand(handIndex);
  };

  // -----------------------------------------------------
  // 🔧 ลง Modification (Local State -> ลบเองได้เลย)
  // -----------------------------------------------------
  const dropToModification = (img, handIndex) => {
    Swal.fire({
      title: "ลงเป็น Modification ของ Avatar ช่องไหน?",
      input: "select",
      inputOptions: {
        0: "Avatar ช่อง 1",
        1: "Avatar ช่อง 2",
        2: "Avatar ช่อง 3",
        3: "Avatar ช่อง 4",
      },
      confirmButtonText: "ลงการ์ด",
      background: "#222",
      color: "#fff",
    }).then((res) => {
      if (!res.isConfirmed) return;
      const avatarIndex = Number(res.value);
      if (!avatarSlots[avatarIndex])
        return Swal.fire("❌ Avatar ยังไม่มีการ์ด");

      const updated = [...safeModSlots];
      updated[avatarIndex] = [...updated[avatarIndex], img];
      setModSlots(updated);

      // ✅ อันนี้ยังต้องลบเอง เพราะไม่ได้ผ่าน initiateSummon
      removeCardFromHand(handIndex);
    });
  };

  // -----------------------------------------------------
  // 🎮 เปิดเมนูเลือก Action
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
            <button class="zone-btn danger" id="btnEnd1">🔥 END1</button>
            <button class="zone-btn danger" id="btnEnd2">💀 END2</button>
          </div>
        </div>
      `,
      showConfirmButton: false,
      width: 450,
      background: "#111",
      color: "#fff",
      allowOutsideClick: true,
    });

    setTimeout(() => {
      const bind = (id, fn) => {
        const el = document.getElementById(id);
        if (el)
          el.onclick = () => {
            Swal.close();
            fn();
          };
      };

      // Action ที่ยิง Socket (เอา removeCard ออกแล้วใน fn ข้างบน)
      bind("btnBattleCenter", () => dropToBattle(img, handIndex));
      bind("btnMagic", () => dropToMagic(img, handIndex));
      bind("btnAvatar", () => dropToAvatar(img, handIndex));
      
      // Action Local (ยังต้องลบมือเอง)
      bind("btnMod", () => dropToModification(img, handIndex));
      bind("btnEnd1", () => {
        setEnd1Cards((p) => [...p, img]);
        removeCardFromHand(handIndex);
      });
      bind("btnEnd2", () => {
        setEnd2Cards((p) => [...p, img]);
        removeCardFromHand(handIndex);
      });
    }, 50);
  };

  // -----------------------------------------------------
  // 🎴 เปิด Popup ดูการ์ดในมือ
  // -----------------------------------------------------
  const openHandPopup = () => {
    if (isEnemy)
      return Swal.fire({
        title: "มือของคู่แข่ง",
        text: `มีการ์ด ${enemyHandCount} ใบ`,
        icon: "info",
        background: "#111",
        color: "#fff",
      });

    if (safeHandCards.length === 0)
      return Swal.fire({
        title: "🔹 ไม่มีการ์ดในมือ",
        background: "#111",
        color: "#fff",
      });

    Swal.fire({
      title: `การ์ดในมือ (${safeHandCards.length} ใบ)`,
      html: `
        <div class="hand-grid">
          ${safeHandCards
            .map(
              (img, i) => `
            <img src="${img}" class="hand-img" data-i="${i}" />
          `
            )
            .join("")}
        </div>
      `,
      width: "750px",
      background: "#111",
      color: "#fff",
      showConfirmButton: false,
      allowOutsideClick: true,
    });

    setTimeout(() => {
      document.querySelectorAll(".hand-img").forEach((el) => {
        el.onclick = () => {
          const idx = Number(el.dataset.i);
          Swal.close();
          openCardAction(safeHandCards[idx], idx);
        };
      });
    }, 50);
  };

  return (
    <button
      className="hand-floating-btn"
      onClick={openHandPopup}
      disabled={isEnemy}
      style={{
        background: isEnemy
          ? "linear-gradient(45deg, #c0392b, #e74c3c)"
          : undefined,
      }}
    >
      {isEnemy
        ? `🎴 Enemy (${enemyHandCount})`
        : `🎴 Hand (${safeHandCards.length})`}
    </button>
  );
}

export default HandButton;