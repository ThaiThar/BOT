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
  
  // ✅ 1. เพิ่ม Props ที่ต้องใช้เช็คการ์ดศัตรู
  enemyAvatarSlots, 
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

  // ... (ฟังก์ชัน initiateSummon, startClash, submit ต่างๆ เหมือนเดิม ไม่ต้องแก้) ...
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

  // ... (useEffect Timer เหมือนเดิม) ...
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
  // ⚖️ Resolve Battle (แก้ตรงนี้!)
  // -----------------------------------------------------------
  const resolveBattle = (finalState) => {
    const { owner, cardMain, cardEnemy, cardSupport, cardEnemy2, slotIndex } = finalState;
    const isOwner = owner === myRole;

    const isCase1 = !cardEnemy;
    const isCase3 = cardEnemy && cardSupport && !cardEnemy2;
    const isWin = isCase1 || isCase3;

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
            // Magic Logic (เหมือนเดิม)
            const magicIdx = parseInt(slotIndex.split("-")[1], 10);
            setMagicSlots(prev => {
                const next = [...prev];
                next[magicIdx] = cardMain;
                broadcast("update_magic", next);
                return next;
            });
        } else {
            // Avatar / Battle Logic
            setAvatarSlots((prev) => {
              const next = [...prev];
              next[slotIndex] = cardMain; 

              // ส่งข้อมูลบอกศัตรูว่าเราลงการ์ดแล้ว
              const payload = { 0: next[0], 1: next[1], 2: next[2], 3: next[3], battle: next["battle"] };
              broadcast("update_avatar", payload); 

              return next;
            });

            // 🔥🔥🔥 2. เพิ่ม Logic ดีดการ์ด Battle ของศัตรู 🔥🔥🔥
            if (slotIndex === "battle") {
                // เช็คว่าศัตรูมีการ์ดใน Battle ไหม
                const enemyBattleCard = enemyAvatarSlots?.battle;
                
                if (enemyBattleCard) {
                    // 2.1 เตรียมข้อมูลใหม่ (เอาการ์ดศัตรูลง End)
                    const newEnemyEnd = [...enemyEnd1, enemyBattleCard];
                    
                    // 2.2 อัปเดตหน้าจอเรา (ลบการ์ด battle ศัตรูออก)
                    const newEnemyAvArray = [...enemyAvatarSlots];
                    newEnemyAvArray.battle = null; 
                    setEnemyAvatarSlots(newEnemyAvArray);
                    setEnemyEnd1(newEnemyEnd);

                    // 2.3 สร้าง Payload สำหรับส่ง Socket (ต้องแปลง Array เป็น Object เพื่อรักษาค่า battle: null)
                    const enemyAvPayload = {
                        0: newEnemyAvArray[0],
                        1: newEnemyAvArray[1],
                        2: newEnemyAvArray[2],
                        3: newEnemyAvArray[3],
                        battle: null // สั่งลบ
                    };

                    // 2.4 ส่งคำสั่งพิเศษ "kick_enemy_battle" ไปหาศัตรู
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