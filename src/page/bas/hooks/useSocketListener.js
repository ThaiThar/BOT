import { useEffect } from "react";

/**
 * ฟัง socket event ทั้งหมดที่เกี่ยวกับเกม
 */
export function useSocketListener({
  socket,
  setEnemyHandCount,
  setEnemyAvatarSlots,
  setEnemyModSlots,
  setEnemyEnd1,
}) {
  useEffect(() => {
    if (!socket) {
      console.warn("❌ socket not found");
      return;
    }

    // ===============================
    // 🃏 รับจำนวนการ์ดในมือศัตรู
    // ===============================
    const onUpdateHandCount = (payload) => {
      console.log("📥 UPDATE_HAND_COUNT", payload);
      if (payload?.count !== undefined) {
        setEnemyHandCount(Number(payload.count));
      }
    };

    // ===============================
    // ⚔️ ผลหลังโจมตี
    // ===============================
    const onEnemyAfterAttack = (payload) => {
      if (!payload) return;

      if (payload.enemyAvatar)
        setEnemyAvatarSlots(payload.enemyAvatar);

      if (payload.enemyMods)
        setEnemyModSlots(payload.enemyMods);

      if (payload.enemyEnd1)
        setEnemyEnd1(payload.enemyEnd1);
    };

    // ===== bind =====
    socket.on("UPDATE_HAND_COUNT", onUpdateHandCount);
    socket.on("update_enemy_after_attack", onEnemyAfterAttack);

    // ===== cleanup =====
    return () => {
      socket.off("UPDATE_HAND_COUNT", onUpdateHandCount);
      socket.off("update_enemy_after_attack", onEnemyAfterAttack);
    };
  }, [
    socket,
    setEnemyHandCount,
    setEnemyAvatarSlots,
    setEnemyModSlots,
    setEnemyEnd1,
  ]);
}
