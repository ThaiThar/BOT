import React from "react";
import Swal from "sweetalert2";
import "./centerstyle.css";

// ✅ Import Overlay ตัวใหม่
import SummonBattleOverlay from "../ui/SummonBattleOverlay";

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
  avatarRotation = [0, 0, 0, 0],
  setAvatarRotation,
  onAttack,

  // ✅ Battle system
  summonState,
  startClash,
  submitEnemyCard,
  submitSupportCard,
  submitEnemyCard2,
  myRole,
  handCards = [],
}) {
  // =================================================
  // 🛡 SAFETY GUARDS (แก้ .map พังจาก socket)
  // =================================================
  const safeMagicSlots = Array.isArray(magicSlots)
    ? magicSlots
    : [null, null, null, null];

  const safeAvatarSlots = Array.isArray(avatarSlots)
    ? avatarSlots
    : [null, null, null, null];

  // ⭐ สำคัญสุด: modSlots ต้องเป็น array 4 ช่อง และแต่ละช่องต้องเป็น array
  const safeModSlots = Array.isArray(modSlots)
    ? [0, 1, 2, 3].map((i) =>
        Array.isArray(modSlots[i]) ? modSlots[i] : []
      )
    : [[], [], [], []];

  const safeRotation = Array.isArray(avatarRotation)
    ? avatarRotation
    : [0, 0, 0, 0];

  // =================================================
  // 🖼 Preview Only
  // =================================================
  const previewOnly = (img) => {
    Swal.fire({
      html: `<img src="${img}" style="width:450px; border-radius:12px;" />`,
      showConfirmButton: false,
      background: "#111",
      color: "#fff",
      allowOutsideClick: true,
    });
  };

  // =================================================
  // 🔄 Rotate Avatar
  // =================================================
  const rotateAvatar = (index) => {
    if (isEnemy || !setAvatarRotation) return;
    setAvatarRotation((prev) => {
      const next = [...(Array.isArray(prev) ? prev : [0, 0, 0, 0])];
      next[index] = next[index] === 0 ? 90 : 0;
      return next;
    });
  };

  // =================================================
  // 🎯 Choose Return Action
  // =================================================
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

  // =================================================
  // 🔁 Return from Magic
  // =================================================
  const returnCardFromMagic = (index) => {
    const card = safeMagicSlots[index];
    if (!card) return;

    chooseAction(card, (action) => {
      if (action === "hand") setHandCards((p) => [...p, card]);
      if (action === "end1") setEnd1Cards((p) => [...p, card]);
      if (action === "end2") setEnd2Cards((p) => [...p, card]);
      if (action === "deck") setDeckCards((p) => [...p, card]);

      const updated = [...safeMagicSlots];
      updated[index] = null;
      setMagicSlots(updated);
    });
  };

  // =================================================
  // 🔁 Return from Avatar (+ Mods)
  // =================================================
  const returnCardFromAvatar = (index) => {
    const avatarCard = safeAvatarSlots[index];
    if (!avatarCard) return;

    const modsOfThisAvatar = safeModSlots[index] || [];

    chooseAction(avatarCard, (action) => {
      const returnItems = [avatarCard, ...modsOfThisAvatar];

      if (action === "hand") setHandCards((p) => [...p, ...returnItems]);
      if (action === "end1") setEnd1Cards((p) => [...p, ...returnItems]);
      if (action === "end2") setEnd2Cards((p) => [...p, ...returnItems]);
      if (action === "deck") setDeckCards((p) => [...p, ...returnItems]);

      const updatedAv = [...safeAvatarSlots];
      updatedAv[index] = null;
      setAvatarSlots(updatedAv);

      const updatedMods = [...safeModSlots];
      updatedMods[index] = [];
      setModSlots(updatedMods);

      setAvatarRotation?.((prev) => {
        const next = [...(Array.isArray(prev) ? prev : [0, 0, 0, 0])];
        next[index] = 0;
        return next;
      });
    });
  };

  // =================================================
  // 🔁 Return from Mod
  // =================================================
  const returnCardFromMod = (avatarIndex, modIndex) => {
    const card = safeModSlots[avatarIndex]?.[modIndex];
    if (!card) return;

    chooseAction(card, (action) => {
      if (action === "hand") setHandCards((p) => [...p, card]);
      if (action === "end1") setEnd1Cards((p) => [...p, card]);
      if (action === "end2") setEnd2Cards((p) => [...p, card]);
      if (action === "deck") setDeckCards((p) => [...p, card]);

      const updated = [...safeModSlots];
      updated[avatarIndex] = updated[avatarIndex].filter(
        (_, i) => i !== modIndex
      );
      setModSlots(updated);
    });
  };

  // =================================================
  // ⚡ Summon State
  // =================================================
  const isSummoning = summonState?.isActive;

  // =================================================
  // 🧩 RENDER
  // =================================================
  return (
    <div className="boxcenter" style={{ position: "relative" }}>
      {/* 🔥 Overlay */}
      <SummonBattleOverlay
        summonState={summonState}
        myRole={myRole}
        handCards={handCards}
        startClash={startClash}
        submitEnemyCard={submitEnemyCard}
        submitSupportCard={submitSupportCard}
        submitEnemyCard2={submitEnemyCard2}
      />

      {/* ================= AVATAR ZONE ================= */}
      <div className="avatar-row">
        {safeAvatarSlots.map((avatarImg, i) => {
          const isPending =
            isSummoning && summonState?.slotIndex === i;
          const displayImg = isPending
            ? summonState.cardImage
            : avatarImg;

          return (
            <div key={i} className="avatar-block">
              <div
                className="avatarcenter"
                style={{
                  border: isPending ? "2px dashed yellow" : "none",
                }}
              >
                {displayImg && (
                  <div className="avatar-img-wrapper">
                    <img
                      src={displayImg}
                      className="avatar-img"
                      onClick={() => {
                        if (isPending) return;
                        isEnemy
                          ? previewOnly(displayImg)
                          : returnCardFromAvatar(i);
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        if (!isEnemy && !isPending) rotateAvatar(i);
                      }}
                      style={{
                        transform: `rotate(${safeRotation[i]}deg)`,
                        opacity: isPending ? 0.5 : 1,
                        transition: "0.25s ease",
                      }}
                    />
                  </div>
                )}
              </div>

              {!isEnemy &&
                avatarImg &&
                !isPending &&
                safeRotation[i] === 0 && (
                  <button
                    className="atk-btn-card"
                    onClick={() => onAttack?.(i)}
                  >
                    ⚔️ โจมตี
                  </button>
                )}

              <div className="modificationcard-wrapper">
                {safeModSlots[i].map((modImg, idx) => (
                  <img
                    key={idx}
                    src={modImg}
                    className="mod-img"
                    onClick={() =>
                      isEnemy
                        ? previewOnly(modImg)
                        : returnCardFromMod(i, idx)
                    }
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= MAGIC ZONE ================= */}
      <div className="centermagic">
        {safeMagicSlots.map((img, i) => {
          const magicId = `magic-${i}`;
          const isPending =
            isSummoning && summonState?.slotIndex === magicId;
          const displayImg = isPending
            ? summonState.cardImage
            : img;

          return (
            <div key={i} className="magiccenter">
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  border: isPending ? "2px dashed yellow" : "none",
                  borderRadius: "8px",
                }}
              >
                {displayImg && (
                  <img
                    src={displayImg}
                    className="center-img"
                    onClick={() => {
                      if (isPending) return;
                      isEnemy
                        ? previewOnly(displayImg)
                        : returnCardFromMagic(i);
                    }}
                    style={{
                      opacity: isPending ? 0.5 : 1,
                      transition: "0.25s ease",
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Center;
