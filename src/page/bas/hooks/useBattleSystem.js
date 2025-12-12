// src/components/Bas/hooks/useBattleSystem.js
import Swal from "sweetalert2";

export function useBattleSystem({
  isEnemy,
  avatarSlots,
  enemyAvatarSlots,
  setEnemyAvatarSlots,
  enemyModSlots,
  setEnemyModSlots,
  enemyEnd1,
  setEnemyEnd1,
  
  // props สำหรับการตีบ้าน
  enemyStartCards,       
  setEnemyStartCards,    
  
  broadcast,
  updateRotation,
  triggerBattleAnim,
}) {

  // ----------------------------------------------------
  // ⚔️ 1. Logic ตีการ์ด (Minion Attack)
  // ----------------------------------------------------
  const executeDamageLogic = (attackerIndex, targetIndex) => {
    if (isEnemy) return null;

    const card = enemyAvatarSlots[targetIndex];
    if (!card) return null;

    const mods = enemyModSlots[targetIndex] || [];
    const newEnemyEnd1 = [...enemyEnd1, card, ...mods];
    const newEnemyAv = [...enemyAvatarSlots];
    const newEnemyMods = [...enemyModSlots];

    newEnemyAv[targetIndex] = null;
    newEnemyMods[targetIndex] = [];

    setEnemyEnd1(newEnemyEnd1);
    setEnemyAvatarSlots(newEnemyAv);
    setEnemyModSlots(newEnemyMods);

    updateRotation((prev) => {
      const next = [...prev];
      next[attackerIndex] = 90;
      return next;
    });

    return {
      enemyEnd1: newEnemyEnd1,
      enemyAvatar: newEnemyAv,
      enemyMods: newEnemyMods,
    };
  };

  // ----------------------------------------------------
  // 🏰 2. Logic ตีบ้าน (Base Attack) - ✅ แก้ไขรองรับ 6 ชีวิต
  // ----------------------------------------------------
  const executeBaseAttackLogic = (attackerIndex) => {
    if (isEnemy) return;

    // หาการ์ดใบแรกที่ยังไม่ถูกเปิด
    const targetCardIndex = enemyStartCards.findIndex(card => !card.flipped);

    // ✅ หมุนตัวเรา (ไม่ว่าจะตีการ์ดหรือตีคน ก็ต้องหมุน)
    updateRotation((prev) => {
      const next = [...prev];
      next[attackerIndex] = 90;
      return next;
    });

    // 🟢 กรณี A: ยังมีการ์ดเหลือ (ตีการ์ดใบที่ 1-5)
    if (targetCardIndex !== -1) {
      
      // 1. เตรียมข้อมูลการ์ดใหม่ (พลิกไพ่)
      const newStartCards = [...enemyStartCards];
      const hitCard = newStartCards[targetCardIndex]; 
      
      newStartCards[targetCardIndex] = { 
        ...hitCard, 
        flipped: true 
      };

      // 2. อัปเดตหน้าจอเรา และ ส่งให้ศัตรู
      setEnemyStartCards(newStartCards);

      // 3. แสดงผลหน้าจอเรา
      Swal.fire({
        title: "⚔️ ทำลายการ์ดป้องกัน!",
        text: `การ์ดใบที่ ${targetCardIndex + 1} ถูกเปิดเผย`,
        imageUrl: hitCard.image,
        imageHeight: 300,
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
        background: "#111",
        color: "#4f4"
      });

      // 4. ส่งข้อมูลไปบอกศัตรู
      broadcast("receive_base_damage", {
         newCards: newStartCards,   
         hitCardImage: hitCard.image 
      });

    } 
    // 🔴 กรณี B: การ์ดหมดแล้ว (ตีครั้งที่ 6 = ตีตัวผู้เล่น)
    else {
      
      // 1. บอกศัตรูว่า "นายโดนตีตัวตายแล้ว!" (Game Over)
      broadcast("game_over", {}); 

      // 2. บอกเราว่า "ชนะแล้ว"
      Swal.fire({
        title: "👑 VICTORY! 👑",
        text: "คุณโจมตีผู้เล่นโดยตรงและได้รับชัยชนะ!",
        icon: "success",
        imageUrl: "https://media.giphy.com/media/2gtoSIzdrSMFO/giphy.gif", // ใส่รูป Gif ชนะเท่ๆ ได้
        imageHeight: 200,
        background: "#000",
        color: "#FFD700",
        confirmButtonText: "ยอดเยี่ยม"
      });
    }
  };

  // ----------------------------------------------------
  // 🚀 Main Function: เริ่มต้นโจมตี
  // ----------------------------------------------------
  const startAttack = (attackerIndex) => {
    if (isEnemy) return;

    const myAttackerCard = avatarSlots[attackerIndex];
    if (!myAttackerCard) return; 

    // หาเป้าหมายที่เป็นการ์ดในสนาม (Minions)
    const targets = enemyAvatarSlots
      .map((card, idx) => ({ card, idx }))
      .filter((t) => t.card);

    // 🔴 CASE 1: ไม่มีการ์ดในสนาม -> ให้ตีบ้าน
    if (targets.length === 0) {
      
      // เช็คจำนวนการ์ดที่เหลือ
      const remainingCards = enemyStartCards.filter(c => !c.flipped).length;
      
      // ✅ ข้อความเปลี่ยนไปตามสถานะ
      let titleMsg = "โจมตีฐานทัพ?";
      let textMsg = `เหลือการ์ดป้องกัน ${remainingCards} ใบ`;
      let confirmMsg = "⚔️ โจมตีการ์ด!";
      let targetImageForAnim = "https://agenda.bkkthon.ac.th/card-game-api/attack_start.png"; // หลังการ์ด

      // ✅ ถ้าการ์ดหมดแล้ว (เหลือ 0 ใบ) -> นี่คือการตีตัวผู้เล่น (Final Blow)
      if (remainingCards === 0) {
         titleMsg = "⚡ โจมตีผู้เล่นโดยตรง!";
         textMsg = "ศัตรูไร้การป้องกัน ต้องการปิดฉากหรือไม่?";
         confirmMsg = "💀 ปิดฉาก!";
         targetImageForAnim = "https://cdn-icons-png.flaticon.com/512/149/149071.png"; // รูปตัวแทนผู้เล่น (User Icon)
      }

      Swal.fire({
        title: titleMsg,
        text: textMsg,
        icon: remainingCards === 0 ? "error" : "warning", // ถ้าตีคนให้เป็นสีแดง
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: confirmMsg,
        cancelButtonText: "ยกเลิก",
        background: "#111",
        color: "#fff"
      }).then((result) => {
        if (result.isConfirmed) {
            // 1. เล่น Animation (ตีการ์ด หรือ ตีคน)
            triggerBattleAnim(myAttackerCard, targetImageForAnim);

            // 2. รอ Animation จบ (2.5 วิ) แล้วคำนวณผล
            setTimeout(() => {
                executeBaseAttackLogic(attackerIndex);
            }, 2500);
        }
      });
      return;
    }

    // 🔵 CASE 2: มีการ์ดในสนาม -> เลือกตีการ์ด (Minion)
    const html = targets
      .map(
        (t) => `
          <button class="atk-btn" data-idx="${t.idx}"
            style="border:none;background:none;cursor:pointer;">
            <img src="${t.card}" style="width:120px;border-radius:8px;border:2px solid #fff;" />
            <div style="color:#fff;font-size:12px">ช่อง ${t.idx + 1}</div>
          </button>`
      )
      .join("");

    Swal.fire({
      title: "เลือกเป้าหมาย",
      html: `<div style="display:flex;gap:10px;justify-content:center">${html}</div>`,
      showConfirmButton: false,
      background: "#111",
      didOpen: () => {
        Swal.getHtmlContainer().querySelectorAll(".atk-btn").forEach((btn) => {
          btn.onclick = () => {
            const targetIndex = parseInt(btn.dataset.idx, 10);
            const targetCardImg = enemyAvatarSlots[targetIndex];

            Swal.close();

            triggerBattleAnim(myAttackerCard, targetCardImg);

            setTimeout(() => {
              const result = executeDamageLogic(attackerIndex, targetIndex);
              if (result) {
                 broadcast("update_enemy_after_attack", {
                    ...result,
                    attackerIndex,
                 });
              }
            }, 2500);
          };
        });
      },
    });
  };

  return { startAttack };
}