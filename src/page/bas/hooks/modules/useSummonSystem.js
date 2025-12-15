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
  setMagicSlots // ✅ ยังต้องรับตัวนี้อยู่ เพื่อใช้ตอนชนะ Battle
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
  // 🚀 Initiate Summon
  // -----------------------------------------------------------
  const initiateSummon = (card, target) => {
    // ✅ ลบการ์ดจากมือทันทีที่เริ่ม
    setHandCards((prev) => prev.filter((c) => c !== card));

    // ✅ ไม่มีการเช็ค Magic ตรงนี้แล้ว ปล่อยให้เข้ากระบวนการ Battle ทั้งหมด
    // target อาจจะเป็น 0 (Avatar) หรือ "magic-0" (Magic) ก็ได้
    
    const newState = {
      isActive: true,
      stage: "pending",
      owner: myRole,
      slotIndex: target, // เก็บ target ไว้ตรงนี้ (จะเป็น "magic-0" หรือ 0 ก็ได้)
      cardMain: card,
      cardEnemy: null,
      cardSupport: null,
      cardEnemy2: null,
      timeLeft: 5,
    };
    setSummonState(newState);
    broadcast("summon_update", newState);
  };

  // -----------------------------------------------------------
  // ⚔️ Battle Logic (เหมือนเดิม)
  // -----------------------------------------------------------
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
  // ⏳ Timer Logic (เหมือนเดิม)
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
  // ⚖️ Resolve Battle (แก้ตรงนี้!)
  // -----------------------------------------------------------
  const resolveBattle = (finalState) => {
    const { owner, cardMain, cardEnemy, cardSupport, cardEnemy2, slotIndex } = finalState;
    const isOwner = owner === myRole;

    // กฎแพ้ชนะ
    const isCase1 = !cardEnemy; // ศัตรูไม่ลงการ์ดขัด
    const isCase3 = cardEnemy && cardSupport && !cardEnemy2; // เราแก้ทางได้
    const isWin = isCase1 || isCase3;

    // การ์ดที่ใช้แล้วต้องลงสุสาน
    const cardsOfOwner = [];
    if (!isWin && cardMain) cardsOfOwner.push(cardMain); // ถ้าแพ้ การ์ดหลักลงสุสาน
    if (cardSupport) cardsOfOwner.push(cardSupport);

    const cardsOfEnemy = [];
    if (cardEnemy) cardsOfEnemy.push(cardEnemy);
    if (cardEnemy2) cardsOfEnemy.push(cardEnemy2);

    if (isOwner) {
      // --- เราเป็นเจ้าของเทิร์น ---
      if (cardsOfOwner.length > 0) setEnd1Cards((prev) => [...prev, ...cardsOfOwner]);
      if (cardsOfEnemy.length > 0) setEnemyEnd1((prev) => [...prev, ...cardsOfEnemy]);

      if (isWin) {
        // ✅✅✅ ถ้าชนะเช็คว่าเป็น Magic หรือ Avatar ✅✅✅
        if (typeof slotIndex === "string" && slotIndex.startsWith("magic-")) {
            // --- กรณีลง Magic ---
            const magicIdx = parseInt(slotIndex.split("-")[1], 10);
            setMagicSlots(prev => {
                const next = [...prev];
                next[magicIdx] = cardMain;
                broadcast("update_magic", next); // แจ้งศัตรู
                return next;
            });
        } else {
            // --- กรณีลง Avatar (ปกติ) ---
            setAvatarSlots((prev) => {
              const next = [...prev];
              next[slotIndex] = cardMain;
              broadcast("update_avatar", next); // แจ้งศัตรู
              return next;
            });
        }
        
        Swal.fire({ icon: "success", title: "Summon Success!", timer: 1500, showConfirmButton: false, position: "top" });
      } else {
        // ถ้าแพ้
        Swal.fire({ title: "SUMMON FAILED!", icon: "error", timer: 1500, showConfirmButton: false, background: "#000", color: "#fff" });
      }

    } else {
      // --- เราเป็นฝ่ายตั้งรับ (ศัตรูลงการ์ด) ---
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