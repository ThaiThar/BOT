import React from "react";
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
  setDeckCards
}) {

  // -----------------------------
  // 🔷 เมนูเลือกการกระทำ (Swal)
  // -----------------------------
  const chooseAction = (img, onReturn) => {
    Swal.fire({
      title: "เลือกสิ่งที่ต้องการทำ",
      html: `
      <img src=${img} width="500px" />
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

      if (action === "hand") {
        setHandCards(prev => [...prev, card]);
      }
      if (action === "end1") {
        setEnd1Cards(prev => [...prev, card]);
      }
      if (action === "end2") {
        setEnd2Cards(prev => [...prev, card]);
      }
      if (action === "deck") {
        setDeckCards(prev => [...prev, card]);
      }

      const updated = [...magicSlots];
      updated[index] = null;
      setMagicSlots(updated);
    });
  };

  // -----------------------------
  // 🟢 คืนการ์ดจาก Avatar
  // -----------------------------
  const returnCardFromAvatar = (index) => {
    const card = avatarSlots[index];
    if (!card) return;

    chooseAction(card, (action) => {

      if (action === "hand") setHandCards(prev => [...prev, card]);
      if (action === "end1") setEnd1Cards(prev => [...prev, card]);
      if (action === "end2") setEnd2Cards(prev => [...prev, card]);
      if (action === "deck") setDeckCards(prev => [...prev, card]);

      const updated = [...avatarSlots];
      updated[index] = null;
      setAvatarSlots(updated);

      const newMod = [...modSlots];
      newMod[index] = [];
      setModSlots(newMod);
    });
  };

  // -----------------------------
  // 🟣 คืนจาก Modification
  // -----------------------------
  const returnCardFromMod = (avatarIndex, modIndex) => {
    const card = modSlots[avatarIndex][modIndex];
    if (!card) return;

    chooseAction(card, (action) => {

      if (action === "hand") setHandCards(prev => [...prev, card]);
      if (action === "end1") setEnd1Cards(prev => [...prev, card]);
      if (action === "end2") setEnd2Cards(prev => [...prev, card]);
      if (action === "deck") setDeckCards(prev => [...prev, card]);

      const updated = [...modSlots];
      updated[avatarIndex] = updated[avatarIndex].filter((_, i) => i !== modIndex);
      setModSlots(updated);
    });
  };

  return (
    <div className="boxcenter">

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

      {/* MOD ZONE */}
      <div className="modification">
        {modSlots.map((mods, slotIndex) => (
          <div key={slotIndex} className="modificationcard-wrapper">
            {mods.map((img, idx) => (
              <img
                key={idx}
                src={img}
                className="mod-img"
                onClick={() => returnCardFromMod(slotIndex, idx)}
              />
            ))}
          </div>
        ))}
      </div>

      {/* AVATAR ZONE */}
      <div className="centeravatar">
        {avatarSlots.map((img, i) => (
          <div key={i} className="avatarcenter">
            {img && (
              <img
                src={img}
                className="center-img"
                onClick={() => returnCardFromAvatar(i)}
              />
            )}
          </div>
        ))}
      </div>

    </div>
  );
}

export default Center;
