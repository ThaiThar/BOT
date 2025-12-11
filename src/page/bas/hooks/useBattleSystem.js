// src/components/Bas/hooks/useBattleSystem.js
import Swal from "sweetalert2";

export function useBattleSystem({
  isEnemy,
  enemyAvatarSlots,
  setEnemyAvatarSlots,
  enemyModSlots,
  setEnemyModSlots,
  enemyEnd1,
  setEnemyEnd1,
  broadcast,
  updateRotation, // เพื่อหมุนตัวเราหลังโจมตี
}) {

  // Logic เมื่อเลือกเป้าหมายได้แล้ว
  const resolveAttack = (attackerIndex, targetIndex) => {
    if (isEnemy) return null;

    const card = enemyAvatarSlots[targetIndex];
    if (!card) return null;

    const mods = enemyModSlots[targetIndex] || [];
    
    // คำนวณผลลัพธ์ใหม่
    const newEnemyEnd1 = [...enemyEnd1, card, ...mods];
    const newEnemyAv = [...enemyAvatarSlots];
    const newEnemyMods = [...enemyModSlots];

    newEnemyAv[targetIndex] = null;
    newEnemyMods[targetIndex] = [];

    // อัปเดต State ฝั่งเรา (ภาพที่เห็น)
    setEnemyEnd1(newEnemyEnd1);
    setEnemyAvatarSlots(newEnemyAv);
    setEnemyModSlots(newEnemyMods);

    // หมุนตัวเรา
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

  // เปิด UI เลือกเป้าหมาย
  const startAttack = (attackerIndex) => {
    if (isEnemy) return;

    const targets = enemyAvatarSlots
      .map((card, idx) => ({ card, idx }))
      .filter((t) => t.card);

    if (targets.length === 0) {
      Swal.fire("ไม่มีเป้าหมายให้โจมตี");
      return;
    }

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
      title: "เลือก Avatar เป้าหมาย",
      html: `<div style="display:flex;gap:10px;justify-content:center">${html}</div>`,
      showConfirmButton: false,
      background: "#111",
      didOpen: () => {
        Swal.getHtmlContainer()
          .querySelectorAll(".atk-btn")
          .forEach((btn) => {
            btn.onclick = () => {
              const targetIndex = parseInt(btn.dataset.idx, 10);
              
              // คำนวณผลการโจมตี
              const result = resolveAttack(attackerIndex, targetIndex);

              // ส่งผลลัพธ์ไปหาคู่แข่ง
              if (result) {
                broadcast("update_enemy_after_attack", {
                  ...result,
                  attackerIndex,
                });
              }
              Swal.close();
            };
          });
      },
    });
  };

  return { startAttack };
}