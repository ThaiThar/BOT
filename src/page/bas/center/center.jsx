// import React from "react"; // ❌ ลบ { useState } ออก เพราะไม่ได้ใช้แล้ว
// import Swal from "sweetalert2";
// import "./centerstyle.css";

// function Center({
//   magicSlots,
//   setMagicSlots,
//   avatarSlots,
//   setAvatarSlots,
//   modSlots,
//   setModSlots,
//   setHandCards,
//   end1Cards,
//   setEnd1Cards,
//   end2Cards,
//   setEnd2Cards,
//   deckCards,
//   setDeckCards,
//   isEnemy,

//   // ✅ รับ Props เรื่องการหมุนมาจาก Bas (Bas จะเป็นคนส่ง Socket ให้)
//   avatarRotation,
//   setAvatarRotation
// }) {
//   const rotateAvatar = (index) => {
//     if (isEnemy) return;
//     setAvatarRotation((prev) => {
//       const next = [...prev];
//       // หมุนสลับระหว่าง 0 กับ 90 องศา
//       next[index] = next[index] === 0 ? 90 : 0;
//       return next;
//     });
//   };

//   // -----------------------------
//   // 🔷 เมนูเลือกการกระทำ (Swal)
//   // -----------------------------
//   const chooseAction = (img, onReturn) => {
//     Swal.fire({
//       title: "เลือกสิ่งที่ต้องการทำ",
//       html: `
//         <img src="${img}" style="width:500px; border-radius:10px; margin-bottom:12px; border:2px solid #fff;" />
//         <div style="display:flex; flex-direction:column; gap:5px;">
//           <button class="zone-btn" id="btnHand">🖐 คืนเข้ามือ</button>
//           <button class="zone-btn" id="btnEnd1">🔥 ทิ้งไป END1</button>
//           <button class="zone-btn" id="btnEnd2">💀 ทิ้งไป END2</button>
//           <button class="zone-btn" id="btnDeck">📥 กลับเข้ากอง (ใบล่างสุด)</button>
//         </div>
//       `,
//       showConfirmButton: false,
//       background: "#222",
//       color: "#fff",
//       width: 550,
//       allowOutsideClick: true,
//       didOpen: () => {
//         // ใช้ didOpen เพื่อความเสถียร (ตามที่เคยแก้ให้)
//         const modal = Swal.getHtmlContainer();
//         const closeAndReturn = (action) => {
//           Swal.close();
//           onReturn(action);
//         }

//         modal.querySelector("#btnHand").onclick = () => closeAndReturn("hand");
//         modal.querySelector("#btnEnd1").onclick = () => closeAndReturn("end1");
//         modal.querySelector("#btnEnd2").onclick = () => closeAndReturn("end2");
//         modal.querySelector("#btnDeck").onclick = () => closeAndReturn("deck");
//       }
//     });
//   };

//   // -----------------------------
//   // 🔵 คืนการ์ดจาก Magic
//   // -----------------------------
//   const returnCardFromMagic = (index) => {
//     if (isEnemy) return;
//     const card = magicSlots[index];
//     if (!card) return;

//     chooseAction(card, (action) => {
//       if (action === "hand") setHandCards((prev) => [...prev, card]);
//       if (action === "end1") setEnd1Cards((prev) => [...prev, card]);
//       if (action === "end2") setEnd2Cards((prev) => [...prev, card]);
//       if (action === "deck") setDeckCards((prev) => [...prev, card]);

//       const updated = [...magicSlots];
//       updated[index] = null;
//       setMagicSlots(updated);
//     });
//   };

//   // -----------------------------
//   // 🟢 คืนการ์ดจาก Avatar (+ mods ติดไปด้วย)
//   // -----------------------------
//   const returnCardFromAvatar = (index) => {
//     if (isEnemy) return;
//     const avatarCard = avatarSlots[index];
//     if (!avatarCard) return;

//     const modsOfThisAvatar = modSlots[index] || [];

//     chooseAction(avatarCard, (action) => {
//       // Logic การคืนการ์ด
//       const returnItems = [avatarCard, ...modsOfThisAvatar];

//       if (action === "hand") setHandCards((prev) => [...prev, ...returnItems]);
//       if (action === "end1") setEnd1Cards((prev) => [...prev, ...returnItems]);
//       if (action === "end2") setEnd2Cards((prev) => [...prev, ...returnItems]);
//       if (action === "deck") setDeckCards((prev) => [...prev, ...returnItems]);

//       // เคลียร์ Avatar
//       const updatedAv = [...avatarSlots];
//       updatedAv[index] = null;
//       setAvatarSlots(updatedAv);

//       // เคลียร์ Mod
//       const updatedMods = [...modSlots];
//       updatedMods[index] = [];
//       setModSlots(updatedMods);

//       // ✅ รีเซ็ตมุมหมุนผ่าน Bas (Socket จะส่งไปบอกเพื่อนด้วยว่าการ์ดหายไปแล้ว ให้หมุนกลับเป็น 0)
//       setAvatarRotation((prev) => {
//         const next = [...prev];
//         next[index] = 0;
//         return next;
//       });
//     });
//   };

//   // -----------------------------
//   // 🟣 คืนจาก Modification
//   // -----------------------------
//   const returnCardFromMod = (avatarIndex, modIndex) => {

//     if (isEnemy) return;
//     const card = modSlots[avatarIndex][modIndex];
//     if (!card) return;

//     chooseAction(card, (action) => {
//       if (action === "hand") setHandCards((prev) => [...prev, card]);
//       if (action === "end1") setEnd1Cards((prev) => [...prev, card]);
//       if (action === "end2") setEnd2Cards((prev) => [...prev, card]);
//       if (action === "deck") setDeckCards((prev) => [...prev, card]);

//       const updated = [...modSlots];
//       updated[avatarIndex] = updated[avatarIndex].filter((_, i) => i !== modIndex);
//       setModSlots(updated);
//     });
//   };

//   return (
//     <div className="boxcenter">

//       {/* AVATAR + MODS */}
//       <div className="avatar-row">
//         {avatarSlots.map((avatarImg, i) => (
//           <div key={i} className="avatar-block">
//             <div
//               className="avatarcenter"
//               style={{
//                 background: avatarRotation[i] !== 0 ? "none" : "white",
//                 transition: "0.25s",
//               }}
//             >
//               {avatarImg && (
//                 <div className="avatar-img-wrapper">
//                   <img
//                     src={avatarImg}
//                     className="avatar-img"
//                     onClick={() => returnCardFromAvatar(i)}

//                     // ✅ เมื่อคลิกขวา จะเรียกฟังก์ชันข้างบน -> ไปเรียก Wrapper ใน Bas -> ส่ง Socket
//                     onContextMenu={(e) => {
//                       e.preventDefault();
//                       rotateAvatar(i);
//                     }}

//                     style={{
//                       transform: `rotate(${avatarRotation[i]}deg)`,
//                       transition: "0.25s ease",
//                     }}
//                   />
//                 </div>
//               )}
//             </div>

//             <div className="modificationcard-wrapper">
//               {modSlots[i].map((modImg, idx) => (
//                 <img
//                   key={idx}
//                   src={modImg}
//                   className="mod-img"
//                   onClick={() => returnCardFromMod(i, idx)}
//                 />
//               ))}
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* MAGIC ZONE */}
//       <div className="centermagic">
//         {magicSlots.map((img, i) => (
//           <div key={i} className="magiccenter">
//             {img && (
//               <img
//                 src={img}
//                 className="center-img"
//                 onClick={() => returnCardFromMagic(i)}
//               />
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default Center;

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
  setDeckCards,
  isEnemy,
  avatarRotation,
  setAvatarRotation
}) {

  // --------------------------------------------------
  // 🟦 Preview-only สำหรับฝั่งสตู
  // --------------------------------------------------
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

  // --------------------------------------------------
  // 🟧 หมุน Avatar (เฉพาะผู้เล่น)
  // --------------------------------------------------
  const rotateAvatar = (index) => {
    if (isEnemy) return;

    setAvatarRotation((prev) => {
      const next = [...prev];
      next[index] = next[index] === 0 ? 90 : 0;
      return next;
    });
  };

  // --------------------------------------------------
  // 🟩 เมนู Swal สำหรับผู้เล่น (สตูเปิดไม่ได้)
  // --------------------------------------------------
  const chooseAction = (img, onReturn) => {

    // ⛔ สตู → แสดงแค่รูป
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
      }
    });
  };

  // --------------------------------------------------
  // 🔵 คืนจาก Magic
  // --------------------------------------------------
  const returnCardFromMagic = (index) => {
    const card = magicSlots[index];
    if (!card) return;

    chooseAction(card, (action) => {
      if (isEnemy) return previewOnly(card);

      if (action === "hand") setHandCards((prev) => [...prev, card]);
      if (action === "end1") setEnd1Cards((prev) => [...prev, card]);
      if (action === "end2") setEnd2Cards((prev) => [...prev, card]);
      if (action === "deck") setDeckCards((prev) => [...prev, card]);

      const updated = [...magicSlots];
      updated[index] = null;
      setMagicSlots(updated);
    });
  };

  // --------------------------------------------------
  // 🟢 คืนจาก Avatar (รวม Mods)
  // --------------------------------------------------
  const returnCardFromAvatar = (index) => {
    const avatarCard = avatarSlots[index];
    if (!avatarCard) return;

    const modsOfThisAvatar = modSlots[index] || [];

    chooseAction(avatarCard, (action) => {
      if (isEnemy) return previewOnly(avatarCard);

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

  // --------------------------------------------------
  // 🟣 คืนจาก Modification
  // --------------------------------------------------
  const returnCardFromMod = (avatarIndex, modIndex) => {
    const card = modSlots[avatarIndex][modIndex];
    if (!card) return;

    chooseAction(card, (action) => {
      if (isEnemy) return previewOnly(card);

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

      {/* AVATAR + MOD Zone */}
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

                    // ✔ สตู = ดูรูปอย่างเดียว
                    onClick={() =>
                      isEnemy
                        ? previewOnly(avatarImg)
                        : returnCardFromAvatar(i)
                    }

                    // ✔ สตูห้ามคลิกขวา
                    onContextMenu={(e) => {
                      e.preventDefault();
                      if (!isEnemy) rotateAvatar(i);
                    }}

                    style={{
                      transform: `rotate(${avatarRotation[i]}deg)`,
                      transition: "0.25s ease",
                    }}
                  />
                </div>
              )}
            </div>

            {/* MODS */}
            <div className="modificationcard-wrapper">
              {modSlots[i].map((modImg, idx) => (
                <img
                  key={idx}
                  src={modImg}
                  className="mod-img"
                  onClick={() =>
                    isEnemy ? previewOnly(modImg) : returnCardFromMod(i, idx)
                  }
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

                // ✔ สตูคลิกดูรูปเท่านั้น
                onClick={() =>
                  isEnemy ? previewOnly(img) : returnCardFromMagic(i)
                }
              />
            )}
          </div>
        ))}
      </div>

    </div>
  );
}

export default Center;
