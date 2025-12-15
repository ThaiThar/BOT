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
  // ⚔️ 1. Logic ตีการ์ด (Avatar แตก + Mod ทั้งหมดลงสุสาน)
  // ----------------------------------------------------
  const executeDamageLogic = (attackerIndex, targetIndex) => {
    if (isEnemy) return null;

    const card = enemyAvatarSlots[targetIndex];
    if (!card) return null;

    const mods = enemyModSlots[targetIndex] || [];
    // เอา Avatar + Mods ทั้งหมดลงสุสาน
    const newEnemyEnd1 = [...enemyEnd1, card, ...mods];

    // เคลียร์ช่องนั้น
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
  // 🔧 1.5 Logic ตี Mod (ทำลายเฉพาะ Mod 1 ใบ, Avatar อยู่ครบ)
  // ----------------------------------------------------
  const executeModDamageLogic = (attackerIndex, targetAvatarIndex, targetModIndex) => {
    if (isEnemy) return null;

    // ดึงรายการ Mod ของช่องนั้นมา
    const currentMods = enemyModSlots[targetAvatarIndex] || [];
    const targetModCard = currentMods[targetModIndex];

    if (!targetModCard) return null;

    // 1. เอา Mod ใบนั้นลงสุสาน
    const newEnemyEnd1 = [...enemyEnd1, targetModCard];

    // 2. ลบ Mod ใบนั้นออกจาก Slot (Avatar ยังอยู่)
    const newEnemyMods = [...enemyModSlots];
    // copy array ของช่องนั้นมาก่อน กันค่าเพี้ยน
    const specificMods = [...newEnemyMods[targetAvatarIndex]];
    specificMods.splice(targetModIndex, 1); // ลบออก 1 ใบ
    newEnemyMods[targetAvatarIndex] = specificMods;

    // 3. อัปเดต State
    setEnemyEnd1(newEnemyEnd1);
    setEnemyModSlots(newEnemyMods);

    // 4. หมุนตัวเรา (เพราะตีไปแล้ว)
    updateRotation((prev) => {
      const next = [...prev];
      next[attackerIndex] = 90;
      return next;
    });

    // ส่งค่ากลับไปเพื่อ Broadcast (Avatar ไม่เปลี่ยน ส่งค่าเดิมไป)
    return {
      enemyEnd1: newEnemyEnd1,
      enemyAvatar: enemyAvatarSlots, // Avatar เหมือนเดิม
      enemyMods: newEnemyMods,
    };
  };

  // ----------------------------------------------------
  // 🏰 2. Logic ตีบ้าน (Base Attack)
  // ----------------------------------------------------
  const executeBaseAttackLogic = (attackerIndex) => {
    if (isEnemy) return;

    // หาการ์ดใบแรกที่ยังไม่ถูกเปิด
    const targetCardIndex = enemyStartCards.findIndex(card => !card.flipped);

    // ✅ หมุนตัวเรา
    updateRotation((prev) => {
      const next = [...prev];
      next[attackerIndex] = 90;
      return next;
    });

    // 🟢 กรณี A: ยังมีการ์ดเหลือ
    if (targetCardIndex !== -1) {
      const newStartCards = [...enemyStartCards];
      const hitCard = newStartCards[targetCardIndex];

      newStartCards[targetCardIndex] = { ...hitCard, flipped: true };

      setEnemyStartCards(newStartCards);

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

      broadcast("receive_base_damage", {
        newCards: newStartCards,
        hitCardImage: hitCard.image
      });

    }
    // 🔴 กรณี B: การ์ดหมดแล้ว -> Game Over
    else {
      broadcast("game_over", {});
      Swal.fire({
        title: "👑 VICTORY! 👑",
        text: "คุณโจมตีผู้เล่นโดยตรงและได้รับชัยชนะ!",
        icon: "success",
        imageUrl: "https://media.giphy.com/media/2gtoSIzdrSMFO/giphy.gif",
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
      const remainingCards = enemyStartCards.filter(c => !c.flipped).length;

      let titleMsg = "โจมตีฐานทัพ?";
      let textMsg = `เหลือการ์ดป้องกัน ${remainingCards} ใบ`;
      let confirmMsg = "⚔️ โจมตีการ์ด!";
      let targetImageForAnim = "https://agenda.bkkthon.ac.th/card-game-api/attack_start.png";

      if (remainingCards === 0) {
        titleMsg = "⚡ โจมตีผู้เล่นโดยตรง!";
        textMsg = "ศัตรูไร้การป้องกัน ต้องการปิดฉากหรือไม่?";
        confirmMsg = "💀 ปิดฉาก!";
        targetImageForAnim = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
      }

      Swal.fire({
        title: titleMsg,
        text: textMsg,
        icon: remainingCards === 0 ? "error" : "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: confirmMsg,
        cancelButtonText: "ยกเลิก",
        background: "#111",
        color: "#fff"
      }).then((result) => {
        if (result.isConfirmed) {
          triggerBattleAnim(myAttackerCard, targetImageForAnim);
          setTimeout(() => {
            executeBaseAttackLogic(attackerIndex);
          }, 2500);
        }
      });
      return;
    }

    // 🔵 CASE 2: มีการ์ดในสนาม -> เลือกเป้าหมาย
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
            const targetAvatarIndex = parseInt(btn.dataset.idx, 10);
            const targetCardImg = enemyAvatarSlots[targetAvatarIndex];
            const targetMods = enemyModSlots[targetAvatarIndex] || [];

            Swal.close(); // ปิดหน้าเลือก Avatar ก่อน

            // ----------------------------------------------------
            // ✅ Logic ใหม่: เช็คว่า Avatar มี Mod หรือไม่?
            // ----------------------------------------------------
            if (targetMods.length > 0) {
              // ถาม User: ตีตัว หรือ ตี Mod
              Swal.fire({
                title: "พบการ์ดเสริม!",
                text: "ศัตรูตัวนี้มีการ์ดเสริมติดตั้งอยู่ ต้องการโจมตีอะไร?",
                icon: "question",
                showDenyButton: true,
                showCancelButton: true,
                confirmButtonText: "⚔️ โจมตี Avatar",
                denyButtonText: "🔧 ทำลาย Mod",
                cancelButtonText: "ยกเลิก",
                background: "#222",
                color: "#fff",
                confirmButtonColor: "#d33",
                denyButtonColor: "#f39c12"
              }).then((res) => {
                if (res.isConfirmed) {
                  // ⚔️ เลือกตี Avatar (เหมือนเดิม)
                  triggerBattleAnim(myAttackerCard, targetCardImg);
                  setTimeout(() => {
                    const result = executeDamageLogic(attackerIndex, targetAvatarIndex);
                    if (result) {
                      broadcast("update_enemy_after_attack", { ...result, attackerIndex });
                    }
                  }, 2500);

                } else if (res.isDenied) {

                  const modHtml = targetMods.map((mod, i) => `
                             <button class="mod-atk-btn" data-mod-idx="${i}" style="margin:5px; border:none; background:none; cursor:pointer;">
                                <img src="${mod}" style="width:100px; border-radius:6px; border:2px solid #f39c12;" />
                                <div style="color:#fff; font-size:12px;">Mod ${i + 1}</div>
                             </button>
                        `).join("");

                  Swal.fire({
                    title: "เลือก Mod ที่จะทำลาย",
                    html: `<div style="display:flex; flex-wrap:wrap; justify-content:center;">${modHtml}</div>`,
                    showConfirmButton: false,
                    background: "#111",
                    didOpen: () => {
                      Swal.getHtmlContainer().querySelectorAll(".mod-atk-btn").forEach((modBtn) => {
                        modBtn.onclick = () => {
                          const modIndex = parseInt(modBtn.dataset.modIdx, 10);
                          const modImg = targetMods[modIndex];
                          Swal.close();

                          // เริ่ม Animation ตีไปที่รูป Mod
                          triggerBattleAnim(myAttackerCard, modImg);

                          setTimeout(() => {
                            // เรียก Logic ทำลาย Mod
                            const result = executeModDamageLogic(attackerIndex, targetAvatarIndex, modIndex);
                            if (result) {
                              broadcast("update_enemy_after_attack", { ...result, attackerIndex });
                            }
                          }, 2500);
                        };
                      });
                    }
                  });
                }
              });

            } else {
              // ❌ ไม่มี Mod -> ตี Avatar ตามปกติเลย
              triggerBattleAnim(myAttackerCard, targetCardImg);
              setTimeout(() => {
                const result = executeDamageLogic(attackerIndex, targetAvatarIndex);

                if (result) {
                  // ✅✅✅ แก้ไขตรงนี้: แปลง Avatar Array เป็น Object ก่อนส่ง ✅✅✅
                  const rawAv = result.enemyAvatar;
                  const avatarPayload = {
                    0: rawAv[0], 1: rawAv[1], 2: rawAv[2], 3: rawAv[3],
                    battle: rawAv.battle // รักษาค่า battle ไว้
                  };

                  broadcast("update_enemy_after_attack", {
                    ...result,
                    enemyAvatar: avatarPayload, // ส่งแบบ Object ไป
                    attackerIndex
                  });
                }
              }, 2500);
            }
          };
        });
      },
    });
  };

  return { startAttack };
}