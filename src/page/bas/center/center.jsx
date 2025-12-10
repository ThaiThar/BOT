import React, { useState } from "react";
import Swal from "sweetalert2";
import "./centerstyle.css";

function Center({
  magicSlots,
  setMagicSlots,
  avatarSlots,
  setAvatarSlots,
  modSlots,
  setModSlots,
  setHandCards,
  end1Cards,
  setEnd1Cards,
  end2Cards,
  setEnd2Cards,
  deckCards,
  setDeckCards,
}) {
  // 🔁 มุมหมุนของ avatar แต่ละช่อง (เริ่ม 0 องศา)
  const [avatarRotation, setAvatarRotation] = useState(
    Array(avatarSlots.length).fill(0)
  );

  const rotateAvatar = (index) => {
    setAvatarRotation((prev) => {
      const next = [...prev];
      next[index] = next[index] === 0 ? 90 : 0;
      return next;
    });
  };

  // -----------------------------
  // 🔷 เมนูเลือกการกระทำ (Swal)
  // -----------------------------
  const chooseAction = (img, onReturn) => {
    Swal.fire({
      title: "เลือกสิ่งที่ต้องการทำ",
      html: `
        <img src="${img}" style="width:500px; border-radius:10px; margin-bottom:12px; border:2px solid #fff;" />
        <button class="zone-btn" id="btnHand">🖐 คืนเข้ามือ</button>
        <button class="zone-btn" id="btnEnd1">🔥 ทิ้งไป END1</button>
        <button class="zone-btn" id="btnEnd2">💀 ทิ้งไป END2</button>
        <button class="zone-btn" id="btnDeck">📥 กลับเข้ากอง (ใบล่างสุด)</button>
      `,
      showConfirmButton: false,
      background: "#222",
      color: "#fff",
      width: 550,
      allowOutsideClick: true,
    });

    setTimeout(() => {
      const disableAll = () => {
        ["btnHand", "btnEnd1", "btnEnd2", "btnDeck"].forEach((id) => {
          const b = document.getElementById(id);
          if (b) b.disabled = true;
        });
      };

      document.getElementById("btnHand").onclick = () => {
        disableAll();
        Swal.close();
        onReturn("hand");
      };

      document.getElementById("btnEnd1").onclick = () => {
        disableAll();
        Swal.close();
        onReturn("end1");
      };

      document.getElementById("btnEnd2").onclick = () => {
        disableAll();
        Swal.close();
        onReturn("end2");
      };

      document.getElementById("btnDeck").onclick = () => {
        disableAll();
        Swal.close();
        onReturn("deck");
      };
    }, 25);
  };

  // -----------------------------
  // 🔵 คืนการ์ดจาก Magic
  // -----------------------------
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

  // -----------------------------
  // 🟢 คืนการ์ดจาก Avatar (+ mods ติดไปด้วย)
  // -----------------------------
  const returnCardFromAvatar = (index) => {
    const avatarCard = avatarSlots[index];
    if (!avatarCard) return;

    const modsOfThisAvatar = modSlots[index] || [];

    chooseAction(avatarCard, (action) => {
      if (action === "hand") {
        setHandCards((prev) => [...prev, avatarCard, ...modsOfThisAvatar]);
      }
      if (action === "end1") {
        setEnd1Cards((prev) => [...prev, avatarCard, ...modsOfThisAvatar]);
      }
      if (action === "end2") {
        setEnd2Cards((prev) => [...prev, avatarCard, ...modsOfThisAvatar]);
      }
      if (action === "deck") {
        setDeckCards((prev) => [...prev, avatarCard, ...modsOfThisAvatar]);
      }

      const updatedAv = [...avatarSlots];
      updatedAv[index] = null;
      setAvatarSlots(updatedAv);

      const updatedMods = [...modSlots];
      updatedMods[index] = [];
      setModSlots(updatedMods);

      // รีเซ็ตมุมหมุนของช่องนี้ด้วย (ถ้าต้องการ)
      setAvatarRotation((prev) => {
        const next = [...prev];
        next[index] = 0;
        return next;
      });
    });
  };

  // -----------------------------
  // 🟣 คืนจาก Modification
  // -----------------------------
  const returnCardFromMod = (avatarIndex, modIndex) => {
    const card = modSlots[avatarIndex][modIndex];
    if (!card) return;

    chooseAction(card, (action) => {
      if (action === "hand") setHandCards((prev) => [...prev, card]);
      if (action === "end1") setEnd1Cards((prev) => [...prev, card]);
      if (action === "end2") setEnd2Cards((prev) => [...prev, card]);
      if (action === "deck") setDeckCards((prev) => [...prev, card]);

      const updated = [...modSlots];
      updated[avatarIndex] = updated[avatarIndex].filter((_, i) => i !== modIndex);
      setModSlots(updated);
    });
  };

  return (
    <div className="boxcenter">


      {/* AVATAR + MODS */}
      <div className="avatar-row">
        {avatarSlots.map((avatarImg, i) => (
          <div key={i} className="avatar-block">
            <div
              className="avatarcenter"
              style={{
                background: avatarRotation[i] !== 0 ? "none" : "white",
                transition: "0.25s",
              }}
            >
              {avatarImg && (
                <div className="avatar-img-wrapper">
                  <img
                    src={avatarImg}
                    className="avatar-img"
                    onClick={() => returnCardFromAvatar(i)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      rotateAvatar(i);
                    }}
                    style={{
                      transform: `rotate(${avatarRotation[i]}deg)`,
                      transition: "0.25s ease",
                    }}
                  />
                </div>
              )}
            </div>



            <div className="modificationcard-wrapper">
              {modSlots[i].map((modImg, idx) => (
                <img
                  key={idx}
                  src={modImg}
                  className="mod-img"
                  onClick={() => returnCardFromMod(i, idx)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* MAGIC ZONE */}
      <div className="centermagic">
        {magicSlots.map((img, i) => (
          <div key={i} className="magiccenter">
            {img && (
              <img
                src={img}
                className="center-img"
                onClick={() => returnCardFromMagic(i)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Center;
