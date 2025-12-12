// src/components/Bas/hooks/modules/useBasSocket.js
import { useCallback } from "react";

export function useBasSocket({ socket, roomId, myRole, isEnemy }) {
  const broadcast = useCallback(
    (actionType, payload) => {
      if (!socket || !roomId || isEnemy) return;
      socket.emit("send_action", {
        roomId,
        sender: myRole,
        actionType,
        payload,
      });
    },
    [socket, roomId, isEnemy, myRole]
  );

  return { broadcast };
}