// src/components/Bas/center/center.jsx
import React from "react";
import Swal from "sweetalert2";
import "./centerstyle.css";

function Center({
  magicSlots = [], 
  setMagicSlots,
  avatarSlots = [], 
  setAvatarSlots,
  modSlots = [],    
  setModSlots,
  setHandCards,
  end1Cards,
  setEnd1Cards,
  end2Cards,
  setEnd2Cards,
  deckCards,
  setDeckCards,
  isEnemy,
  avatarRotation = [0,0,0,0], 
  setAvatarRotation,
  onAttack,
}) {
  
  const previewOnly = (img) => {
    Swal.fire({
      title: "",
      html: `<img src="${img}" style="width:450px; border-radius:12px;" />`,
      showConfirmButton: false,
      background: "#111",
      color: "#fff",
      allowOutsideClick: true,
    });
  };

  const rotateAvatar = (index) => {
    if (isEnemy) return;
    setAvatarRotation((prev) => {
      const next = [...prev];
      next[index] = next[index] === 0 ? 90 : 0;
      return next;
    });
  };

  const chooseAction = (img, onReturn) => {
    if (isEnemy) return previewOnly(img);

    Swal.fire({
      title: "เลือกสิ่งที่ต้องการทำ",
      html: `
        <img src="${img}" style="width:500px; border-radius:10px; margin-bottom:12px; border:2px solid #fff;" />
        <div style="display:flex; flex-direction:column; gap:5px;">
          <button class="zone-btn" id="btnHand">🖐 คืนเข้ามือ</button>
          <button class="zone-btn" id="btnEnd1">🔥 ทิ้งไป END1</button>
          <button class="zone-btn" id="btnEnd2">💀 ทิ้งไป END2</button>
          <button class="zone-btn" id="btnDeck">📥 กลับเข้ากอง (ใบล่างสุด)</button>
        </div>
      `,
      showConfirmButton: false,
      background: "#222",
      color: "#fff",
      width: 550,
      allowOutsideClick: true,
      didOpen: () => {
        const modal = Swal.getHtmlContainer();
        const closeAndReturn = (action) => {
          Swal.close();
          onReturn(action);
        };

        modal.querySelector("#btnHand").onclick = () => closeAndReturn("hand");
        modal.querySelector("#btnEnd1").onclick = () => closeAndReturn("end1");
        modal.querySelector("#btnEnd2").onclick = () => closeAndReturn("end2");
        modal.querySelector("#btnDeck").onclick = () => closeAndReturn("deck");
      },
    });
  };

  const returnCardFromMagic = (index) => {
    const card = magicSlots[index];
    if (!card) return;

    chooseAction(card, (action) => {
      if (action === "hand") setHandCards((prev) => [...prev, card]);
      if (action === "end1") setEnd1Cards((prev) => [...prev, card]);
      if (action === "end2") setEnd2Cards((prev) => [...prev, card]);
      if (action === "deck") setDeckCards((prev) => [...prev, card]);

      const updated = [...magicSlots];
      updated[index] = null;
      setMagicSlots(updated);
    });
  };

  const returnCardFromAvatar = (index) => {
    const avatarCard = avatarSlots[index];
    if (!avatarCard) return;

    const modsOfThisAvatar = modSlots[index] || [];

    chooseAction(avatarCard, (action) => {
      const returnItems = [avatarCard, ...modsOfThisAvatar];

      if (action === "hand") setHandCards((prev) => [...prev, ...returnItems]);
      if (action === "end1") setEnd1Cards((prev) => [...prev, ...returnItems]);
      if (action === "end2") setEnd2Cards((prev) => [...prev, ...returnItems]);
      if (action === "deck") setDeckCards((prev) => [...prev, ...returnItems]);

      const updatedAv = [...avatarSlots];
      updatedAv[index] = null;
      setAvatarSlots(updatedAv);

      const updatedMods = [...modSlots];
      updatedMods[index] = [];
      setModSlots(updatedMods);

      setAvatarRotation((prev) => {
        const next = [...prev];
        next[index] = 0;
        return next;
      });
    });
  };

  const returnCardFromMod = (avatarIndex, modIndex) => {
    if (!modSlots[avatarIndex]) return;
    const card = modSlots[avatarIndex][modIndex];
    if (!card) return;

    chooseAction(card, (action) => {
      if (action === "hand") setHandCards((prev) => [...prev, card]);
      if (action === "end1") setEnd1Cards((prev) => [...prev, card]);
      if (action === "end2") setEnd2Cards((prev) => [...prev, card]);
      if (action === "deck") setDeckCards((prev) => [...prev, card]);

      const updated = [...modSlots];
      updated[avatarIndex] = updated[avatarIndex].filter(
        (_, i) => i !== modIndex
      );
      setModSlots(updated);
    });
  };

  // --------------------------------------------------
  // UI RENDER
  // --------------------------------------------------
  return (
    <div 
      className="boxcenter" 
      // ❌ เอา style flexDirection ออก เพื่อให้มันเรียงตามธรรมชาติ
      // การกลับหัวจะถูกจัดการโดย rotate(180deg) ใน BattleFieldOnline.jsx เอง
    >
      
      {/* 1. AVATAR + MOD Zone */}
      <div className="avatar-row">
        {(avatarSlots || []).map((avatarImg, i) => (
          <div key={i} className="avatar-block">
            <div
              className="avatarcenter"
              style={{
                background: (avatarRotation?.[i] !== 0) ? "transparent" : "rgba(255,255,255,0.1)",
                transition: "0.25s",
              }}
            >
              {avatarImg && (
                <div className="avatar-img-wrapper">
                  <img
                    src={avatarImg}
                    className="avatar-img"
                    onClick={() => isEnemy ? previewOnly(avatarImg) : returnCardFromAvatar(i)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      if (!isEnemy) rotateAvatar(i);
                    }}
                    style={{
                      transform: `rotate(${avatarRotation?.[i] || 0}deg)`,
                      transition: "0.25s ease",
                    }}
                  />
                </div>
              )}
            </div>

            {/* ปุ่มโจมตี */}
            {!isEnemy && avatarImg && avatarRotation?.[i] === 0 && (
              <button
                className="atk-btn-card"
                onClick={() => onAttack && onAttack(i)}
              >
                ⚔️ โจมตี
              </button>
            )}

            {/* MODS */}
            <div className="modificationcard-wrapper">
              {(modSlots[i] || []).map((modImg, idx) => (
                <img
                  key={idx}
                  src={modImg}
                  className="mod-img"
                  onClick={() => isEnemy ? previewOnly(modImg) : returnCardFromMod(i, idx)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 2. MAGIC ZONE */}
      <div className="centermagic">
        {(magicSlots || []).map((img, i) => (
          <div key={i} className="magiccenter">
            {img && (
              <img
                src={img}
                className="center-img"
                onClick={() => isEnemy ? previewOnly(img) : returnCardFromMagic(i)}
              />
            )}
          </div>
        ))}
      </div>

    </div>
  );
}

export default Center;