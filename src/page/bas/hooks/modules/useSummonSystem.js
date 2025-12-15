// src/components/Bas/hooks/modules/useSummonSystem.js
import { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";

export function useSummonSystem({
  broadcast,
  myRole,
  setAvatarSlots,
  setHandCards,
  setEnd1Cards,
  setEnemyEnd1,
  magicSlots,
  setMagicSlots,

  // ✅ 1. Props เพิ่มเติมที่ต้องใช้
  avatarSlots, // กระดานเรา (ใช้เช็คการ์ดเก่าก่อนทับ)
  enemyAvatarSlots, // กระดานศัตรู (ใช้เช็คเพื่อดีดการ์ด)
  setEnemyAvatarSlots,
  enemyEnd1
}) {
  const [summonState, setSummonState] = useState({
    isActive: false,
    stage: "idle",
    owner: null,
    slotIndex: null,
    cardMain: null,
    cardEnemy: null,
    cardSupport: null,
    cardEnemy2: null,
    timeLeft: 5,
  });

  const timerRef = useRef(null);

  // -----------------------------------------------------------
  // 🚀 Initiate & Battle Phases
  // -----------------------------------------------------------
  const initiateSummon = (card, target) => {
    setHandCards((prev) => prev.filter((c) => c !== card));
    const newState = {
      isActive: true,
      stage: "pending",
      owner: myRole,
      slotIndex: target,
      cardMain: card,
      cardEnemy: null,
      cardSupport: null,
      cardEnemy2: null,
      timeLeft: 5,
    };
    setSummonState(newState);
    broadcast("summon_update", newState);
  };

  const startClash = () => {
    setSummonState((prev) => {
      const next = { ...prev, stage: "clash_enemy", timeLeft: 15 };
      broadcast("summon_update", next);
      return next;
    });
  };

  const submitEnemyCard = (card) => {
    setHandCards((prev) => prev.filter((c) => c !== card));
    setSummonState((prev) => {
      const next = { ...prev, stage: "clash_owner", cardEnemy: card, timeLeft: 15 };
      broadcast("summon_update", next);
      return next;
    });
  };

  const submitSupportCard = (card) => {
    setHandCards((prev) => prev.filter((c) => c !== card));
    const nextState = { ...summonState, stage: "clash_enemy_2", cardSupport: card, timeLeft: 15 };
    setSummonState(nextState);
    broadcast("summon_update", nextState);
  };

  const submitEnemyCard2 = (card) => {
    setHandCards((prev) => prev.filter((c) => c !== card));
    const finalState = { ...summonState, cardEnemy2: card };
    setSummonState(finalState);
    broadcast("summon_update", finalState);
    resolveBattle(finalState);
    broadcast("summon_finish", finalState);
  };

  // -----------------------------------------------------------
  // ⏳ Timer Logic
  // -----------------------------------------------------------
  useEffect(() => {
    if (!summonState.isActive) return;
    if (summonState.owner === myRole) {
      if (summonState.timeLeft > 0) {
        timerRef.current = setTimeout(() => {
          setSummonState((prev) => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
        }, 1000);
      } else {
        handleTimeout();
      }
    }
    return () => clearTimeout(timerRef.current);
  }, [summonState.isActive, summonState.timeLeft, summonState.stage]);

  const handleTimeout = () => {
    resolveBattle(summonState);
    broadcast("summon_finish", summonState);
  };

  // -----------------------------------------------------------
  // ⚖️ Resolve Battle (Logic หลัก)
  // -----------------------------------------------------------
  const resolveBattle = (finalState) => {
    const { owner, cardMain, cardEnemy, cardSupport, cardEnemy2, slotIndex } = finalState;
    const isOwner = owner === myRole;

    const isCase1 = !cardEnemy;
    const isCase3 = cardEnemy && cardSupport && !cardEnemy2;
    const isWin = isCase1 || isCase3;

    // การ์ดที่ใช้แล้วต้องลงสุสาน
    const cardsOfOwner = [];
    if (!isWin && cardMain) cardsOfOwner.push(cardMain);
    if (cardSupport) cardsOfOwner.push(cardSupport);

    const cardsOfEnemy = [];
    if (cardEnemy) cardsOfEnemy.push(cardEnemy);
    if (cardEnemy2) cardsOfEnemy.push(cardEnemy2);

    if (isOwner) {
      // --- เราเป็นเจ้าของเทิร์น ---
      if (cardsOfOwner.length > 0) setEnd1Cards((prev) => [...prev, ...cardsOfOwner]);
      if (cardsOfEnemy.length > 0) setEnemyEnd1((prev) => [...prev, ...cardsOfEnemy]);

      if (isWin) {
        if (typeof slotIndex === "string" && slotIndex.startsWith("magic-")) {
          // --- Magic Logic ---
          const magicIdx = parseInt(slotIndex.split("-")[1], 10);
          setMagicSlots(prev => {
            const next = [...prev];
            next[magicIdx] = cardMain;
            broadcast("update_magic", next);
            return next;
          });
        } else {
          // --- Avatar / Battle Logic ---

          // ✅ 1. จัดการ "ทับการ์ดเก่า" (Overwrite Logic)
          // ทำข้างนอก setter เพื่อกันเบิ้ล (React Strict Mode Safe)
          if (slotIndex === "battle") {
            const oldCard = avatarSlots?.battle;
            if (oldCard) {
              setEnd1Cards((prevEnd) => {
                const newEnd = [...prevEnd, oldCard];
                broadcast("update_end1", newEnd);
                return newEnd;
              });
            }
          }

          // ✅ 2. ลงการ์ดใบใหม่
          setAvatarSlots((prev) => {
            const next = [...prev];
            next.battle = prev.battle; // กู้ค่าเดิมกันหาย

            if (slotIndex === "battle") {
              next.battle = cardMain; // ทับใบใหม่ลงไป
            } else {
              next[slotIndex] = cardMain;
            }

            // ส่งข้อมูลบอกศัตรู (แปลง Array -> Object เพื่อรักษา Battle key)
            const payload = {
              0: next[0], 1: next[1], 2: next[2], 3: next[3],
              battle: next.battle
            };
            broadcast("update_avatar", payload);

            return next;
          });

          // ✅ 3. Logic ดีดการ์ดศัตรู (Kick Enemy Logic)
          if (slotIndex === "battle") {
            const enemyBattleCard = enemyAvatarSlots?.battle;
            
            if (enemyBattleCard) {
              // 3.1 ย้ายการ์ดศัตรูลง End
              const newEnemyEnd = [...enemyEnd1, enemyBattleCard];
              
              // 3.2 ลบออกจากกระดาน
              const newEnemyAvArray = [...enemyAvatarSlots];
              newEnemyAvArray.battle = null;

              // 3.3 อัปเดต State เรา
              setEnemyAvatarSlots(newEnemyAvArray);
              setEnemyEnd1(newEnemyEnd);

              // 3.4 สร้าง Payload สั่งลบฝั่งศัตรู
              const enemyAvPayload = {
                0: newEnemyAvArray[0], 1: newEnemyAvArray[1], 2: newEnemyAvArray[2], 3: newEnemyAvArray[3],
                battle: null // สั่งลบชัดเจน
              };

              broadcast("update_enemy_after_summon", {
                enemyEnd1: newEnemyEnd,
                enemyAvatar: enemyAvPayload
              });

              Swal.fire({ icon: "success", title: "Battle Override!", text: "การ์ด Battle ของศัตรูถูกทำลาย!", timer: 1500 });
            } else {
              Swal.fire({ icon: "success", title: "Summon Success!", timer: 1500, showConfirmButton: false, position: "top" });
            }
          } else {
            Swal.fire({ icon: "success", title: "Summon Success!", timer: 1500, showConfirmButton: false, position: "top" });
          }
        }
      } else {
        Swal.fire({ title: "SUMMON FAILED!", icon: "error", timer: 1500, showConfirmButton: false, background: "#000", color: "#fff" });
      }

    } else {
      // --- เราเป็นฝ่ายตั้งรับ ---
      if (cardsOfOwner.length > 0) setEnemyEnd1((prev) => [...prev, ...cardsOfOwner]);
      if (cardsOfEnemy.length > 0) setEnd1Cards((prev) => [...prev, ...cardsOfEnemy]);

      if (isWin) Swal.fire({ title: "ป้องกันล้มเหลว!", icon: "warning", timer: 1500, showConfirmButton: false });
      else Swal.fire({ title: "ป้องกันสำเร็จ!", icon: "success", timer: 1500, showConfirmButton: false });
    }

    setTimeout(() => closeSummon(), 800);
  };

  const closeSummon = () => {
    const reset = { isActive: false, stage: "idle", owner: null, cardMain: null, cardEnemy: null, cardSupport: null, cardEnemy2: null, timeLeft: 0 };
    setSummonState(reset);
    broadcast("summon_reset", reset);
  };

  return { summonState, setSummonState, initiateSummon, startClash, submitEnemyCard, submitSupportCard, submitEnemyCard2, resolveBattle };
}