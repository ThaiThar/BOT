import React from "react";
import Swal from "sweetalert2";
import "./battleStyle.css";

function Battle({
  battleCenterCard,
  setAvatarSlots,
  avatarSlots,
  setHandCards,
  setEnd1Cards,
  broadcast,
  isEnemy,
}) {

  // ฟังก์ชันจัดการการดึงการ์ดออกจาก Battle (ใช้ร่วมกันทั้งดึงมือและทิ้ง)
  const removeCardFromBattle = (callback) => {
    if (!setAvatarSlots || !avatarSlots) return;

    setAvatarSlots((prev) => {
      const next = [...prev];
      // 1. ลบการ์ดจาก Battle
      next.battle = null;

      // 2. สร้าง Payload สำหรับส่ง Socket (ต้องแปลง Array เป็น Object เพื่อรักษาค่า battle: null)
      const payload = {
        0: next[0],
        1: next[1],
        2: next[2],
        3: next[3],
        battle: null, // สั่งลบ
      };

      // 3. ส่งข้อมูลบอกศัตรู
      if (broadcast) {
        broadcast("update_avatar", payload);
      }
      
      return next;
    });

    // 4. ทำ Action ต่อ (เช่น เพิ่มเข้ามือ หรือ ลงสุสาน)
    if (callback) callback();
  };

  const handleCardClick = () => {
    if (!battleCenterCard) return;

    // 🔴 ถ้าเป็นศัตรู หรือไม่มีสิทธิ์แก้ไข -> ดูรูปได้อย่างเดียว
    if (isEnemy || !setAvatarSlots) {
      Swal.fire({
        imageUrl: battleCenterCard,
        imageHeight: "80vh",
        imageAlt: "Battle Card Preview",
        background: "transparent",
        showConfirmButton: false,
        showCloseButton: true,
        backdrop: `rgba(0,0,0,0.8)`,
      });
      return;
    }

    // 🟢 ถ้าเป็นเรา -> แสดงเมนูจัดการ
    Swal.fire({
      title: "จัดการการ์ด Battle",
      html: `
        <div style="margin-bottom:15px; text-align:center;">
          <img src="${battleCenterCard}" style="width:200px; border-radius:10px; border:2px solid #fff;" />
        </div>
        <div style="display:flex; flex-direction:column; gap:10px;">
          <button class="zone-btn" id="btnHand">🖐 ดึงกลับขึ้นมือ</button>
          <button class="zone-btn danger" id="btnEnd1">🔥 ทิ้งลงสุสาน (END)</button>
        </div>
      `,
      showConfirmButton: false,
      background: "#222",
      color: "#fff",
      width: 350,
      didOpen: () => {
        const modal = Swal.getHtmlContainer();

        // ปุ่มดึงกลับมือ
        modal.querySelector("#btnHand").onclick = () => {
          Swal.close();
          removeCardFromBattle(() => {
            setHandCards((prev) => [...prev, battleCenterCard]);
          });
        };

        // ปุ่มทิ้งลงสุสาน
        modal.querySelector("#btnEnd1").onclick = () => {
          Swal.close();
          removeCardFromBattle(() => {
            setEnd1Cards((prev) => [...prev, battleCenterCard]);
          });
        };
      },
    });
  };

  return (
    <div className="battlecenter">
      <div className="battlebox">
        {/* ช่องซ้าย (ว่าง) */}
        <div className="center-battle start"></div>

        {/* ✅ ช่องกลาง: แสดงการ์ด */}
        <div className="center-battle center">
          {battleCenterCard && (
            <img
              className="img-battle-center"
              src={battleCenterCard}
              alt="Battle Card"
              onClick={handleCardClick} // ✅ ใส่ Event Click
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                cursor: "pointer", // ✅ เปลี่ยนเมาส์เป็นรูปมือ
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            />
          )}
        </div>

        {/* ช่องขวา (ว่าง) */}
        <div className="center-battle end"></div>
      </div>
    </div>
  );
}

export default Battle;