// src/components/Bas/hooks/useBattleSystem.js
import Swal from "sweetalert2";

export function useBattleSystem({
  isEnemy,
  avatarSlots, // ✅ เพิ่ม: ต้องรับเข้ามาด้วย ไม่งั้นจะหา myAttackerCard ไม่เจอ
  enemyAvatarSlots,
  setEnemyAvatarSlots,
  enemyModSlots,
  setEnemyModSlots,
  enemyEnd1,
  setEnemyEnd1,
  broadcast,
  updateRotation, 
  triggerBattleAnim,
}) {

  // 1. ฟังก์ชันคำนวณความเสียหาย (Logic ล้วนๆ)
  const executeDamageLogic = (attackerIndex, targetIndex) => {
    // Safety Check
    if (isEnemy) return null;

    const card = enemyAvatarSlots[targetIndex];
    if (!card) return null;

    const mods = enemyModSlots[targetIndex] || [];

    // คำนวณผลลัพธ์ใหม่
    const newEnemyEnd1 = [...enemyEnd1, card, ...mods];
    const newEnemyAv = [...enemyAvatarSlots];
    const newEnemyMods = [...enemyModSlots];

    // ลบการ์ดศัตรูออกจากสนาม
    newEnemyAv[targetIndex] = null;
    newEnemyMods[targetIndex] = [];

    // อัปเดต State ฝั่งเรา (ภาพที่เห็นบนจอเรา)
    setEnemyEnd1(newEnemyEnd1);
    setEnemyAvatarSlots(newEnemyAv);
    setEnemyModSlots(newEnemyMods);

    // หมุนตัวเรา (ผู้โจมตี) 90 องศา
    updateRotation((prev) => {
      const next = [...prev];
      next[attackerIndex] = 90;
      return next;
    });

    // ส่งคืนค่าเพื่อเอาไป Broadcast บอกเพื่อน
    return {
      enemyEnd1: newEnemyEnd1,
      enemyAvatar: newEnemyAv,
      enemyMods: newEnemyMods,
    };
  };

  // 2. ฟังก์ชันเริ่มการโจมตี (UI + SweetAlert)
  const startAttack = (attackerIndex) => {
    if (isEnemy) return;

    // ✅ ดึงรูปการ์ดเรา (ผู้โจมตี)
    const myAttackerCard = avatarSlots[attackerIndex];

    // รายการเป้าหมาย (เฉพาะช่องที่มีการ์ด)
    const targets = enemyAvatarSlots
      .map((card, idx) => ({ card, idx }))
      .filter((t) => t.card);

    if (targets.length === 0) {
      Swal.fire("ไม่มีเป้าหมายให้โจมตี");
      return;
    }

    // สร้าง HTML ปุ่มเลือกเป้าหมาย
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

            Swal.close(); // ปิดหน้าต่างเลือก

            // 1. 🎬 เริ่ม Animation ทั้งสองฝั่ง (ส่งรูปเรา vs รูปเขา)
            triggerBattleAnim(myAttackerCard, targetCardImg);

            // 2. ⏳ รอเวลา Animation จบ (2.5 วินาที) แล้วค่อยคำนวณ Damage
            setTimeout(() => {
              const result = executeDamageLogic(attackerIndex, targetIndex);
              
              if (result) {
                 // ส่งผลลัพธ์กระดานล่าสุดไปให้คู่แข่ง (เพื่อให้กระดานเขาอัปเดตว่าการ์ดหายไปแล้ว)
                 broadcast("update_enemy_after_attack", {
                    ...result,
                    attackerIndex,
                 });
              }
            }, 2500); // ต้องตรงกับเวลา animation ใน CSS
          };
        });
      },
    });
  };

  return { startAttack };
}