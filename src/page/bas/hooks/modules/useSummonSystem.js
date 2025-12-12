// src/components/Bas/hooks/modules/useSummonSystem.js
import { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";

export function useSummonSystem({
    broadcast, myRole, setAvatarSlots, setHandCards, setEnd1Cards, setEnemyEnd1
}) {
    const [summonState, setSummonState] = useState({
        isActive: false,
        stage: "idle",
        owner: null,
        slotIndex: null,
        cardMain: null, cardEnemy: null, cardSupport: null, cardEnemy2: null,
        timeLeft: 5,
    });

    const timerRef = useRef(null);

    // ... (initiateSummon, startClash, submitEnemyCard เหมือนเดิม) ...
    const initiateSummon = (card, index) => {
        setHandCards(prev => prev.filter(c => c !== card));
        const newState = { isActive: true, stage: "pending", owner: myRole, slotIndex: index, cardMain: card, cardEnemy: null, cardSupport: null, cardEnemy2: null, timeLeft: 5 };
        setSummonState(newState);
        broadcast("summon_update", newState);
    };

    const startClash = () => {
        setSummonState(prev => {
            const next = { ...prev, stage: "clash_enemy", timeLeft: 15 };
            broadcast("summon_update", next);
            return next;
        });
    };

    const submitEnemyCard = (card) => {
        setHandCards(prev => prev.filter(c => c !== card));
        setSummonState(prev => {
            const next = { ...prev, stage: "clash_owner", cardEnemy: card, timeLeft: 15 };
            broadcast("summon_update", next);
            return next;
        });
    };

    // 4. เจ้าของส่งการ์ด Support (แก้แล้ว)
    const submitSupportCard = (card) => {
        setHandCards(prev => prev.filter(c => c !== card));

        // คำนวณ State ใหม่ก่อน
        const nextState = {
            ...summonState, // ใช้ค่าปัจจุบัน
            stage: "clash_enemy_2",
            cardSupport: card,
            timeLeft: 15
        };

        // อัปเดตและส่ง Socket
        setSummonState(nextState);
        broadcast("summon_update", nextState);
    };

    // 5. ✅ (แก้แล้ว) ศัตรูส่งการ์ดใบที่ 2 (Counter 2)
    const submitEnemyCard2 = (card) => {
        setHandCards(prev => prev.filter(c => c !== card));

        // 1. สร้าง State สุดท้าย
        const finalState = {
            ...summonState, // ใช้ค่าปัจจุบัน
            cardEnemy2: card
        };

        // 2. อัปเดต UI ให้เห็นการ์ดก่อน
        setSummonState(finalState);
        broadcast("summon_update", finalState);

        // 3. ⚠️ สั่งจบเกมทันที (ไม่ต้องรอ setSummonState เสร็จ)
        // เรียก resolveBattle ฝั่งเรา
        resolveBattle(finalState);

        // ส่งคำสั่งให้เพื่อน resolveBattle ฝั่งเขา
        broadcast("summon_finish", finalState);
    }

    // Timer Logic (เหมือนเดิม)
    useEffect(() => {
        if (!summonState.isActive) return;
        if (summonState.owner === myRole) {
            if (summonState.timeLeft > 0) {
                timerRef.current = setTimeout(() => {
                    setSummonState(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
                }, 1000);
            } else {
                handleTimeout();
            }
        }
        return () => clearTimeout(timerRef.current);
    }, [summonState.isActive, summonState.timeLeft, summonState.stage]);

    const handleTimeout = () => {
        // ... (Logic เดิม) ...
        // เมื่อหมดเวลา ให้จบเกมตาม State ล่าสุด
        resolveBattle(summonState);
        broadcast("summon_finish", summonState);
    };

    // ... (resolveBattle และ closeSummon เหมือนเดิม) ...
    // ... (ส่วนนี้Logicถูกต้องแล้ว ไม่ต้องแก้) ...
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
            // ฝั่งเจ้าของ (Owner)
            if (cardsOfOwner.length > 0) setEnd1Cards(prev => [...prev, ...cardsOfOwner]);
            if (cardsOfEnemy.length > 0) setEnemyEnd1(prev => [...prev, ...cardsOfEnemy]);

            if (isWin) {
                setAvatarSlots(prev => {
                    const next = [...prev];
                    next[slotIndex] = cardMain;

                    // ✅✅✅ เพิ่มบรรทัดนี้: ส่งข้อมูลไปบอกศัตรูให้เห็นการ์ดด้วย! ✅✅✅
                    broadcast("update_avatar", next);

                    return next;
                });
                Swal.fire({ icon: 'success', title: 'Summon Success!', timer: 1500, showConfirmButton: false, position: 'top' });
            } else {
                Swal.fire({ title: "SUMMON FAILED!", icon: 'error', timer: 1500, showConfirmButton: false, background: '#000', color: '#fff' });
            }
        } else {
            // ฝั่งศัตรู (Enemy)
            if (cardsOfOwner.length > 0) setEnemyEnd1(prev => [...prev, ...cardsOfOwner]);
            if (cardsOfEnemy.length > 0) setEnd1Cards(prev => [...prev, ...cardsOfEnemy]);

            if (isWin) Swal.fire({ title: "ป้องกันล้มเหลว!", icon: 'warning', timer: 1500, showConfirmButton: false });
            else Swal.fire({ title: "ป้องกันสำเร็จ!", icon: 'success', timer: 1500, showConfirmButton: false });
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