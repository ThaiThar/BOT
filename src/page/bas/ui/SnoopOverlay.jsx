import React from "react";
import backCardUrl from "../../../assets/backcard.jpg"; // ตรวจสอบ path รูปหลังการ์ดให้ถูก

export default function SnoopOverlay({ 
  isOpen, 
  cards, 
  revealedIndexes, 
  ownerRole, 
  myRole, 
  onFlip, 
  onSelect, 
  onClose 
}) {
  if (!isOpen) return null;

  const isMyTurn = myRole === ownerRole;
  const allRevealed = cards.length > 0 && revealedIndexes.length === cards.length;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
      backgroundColor: "rgba(0,0,0,0.85)", zIndex: 10000,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      color: "white"
    }}>
      
      <h2 style={{ marginBottom: 20 }}>
        {isMyTurn ? "🕵️‍♂️ ถึงตาคุณ! เปิดการ์ดเพื่อสอดแนม" : "👁️ ฝ่ายตรงข้ามกำลังสอดแนม..."}
      </h2>

      {/* โซนการ์ด */}
      <div style={{ display: "flex", gap: 15, perspective: "1000px", flexWrap: "wrap", justifyContent: "center" }}>
        {cards.map((img, index) => {
          const isFlipped = revealedIndexes.includes(index);
          
          return (
            <div 
              key={index}
              onClick={() => {
                // กดได้เฉพาะตาเรา และยังไม่เปิด
                if (isMyTurn && !isFlipped) {
                  onFlip(index);
                }
              }}
              style={{
                width: 140, height: 200, position: "relative",
                transformStyle: "preserve-3d",
                transition: "transform 0.6s",
                transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                cursor: (isMyTurn && !isFlipped) ? "pointer" : "default"
              }}
            >
              {/* ด้านหลัง (Back) */}
              <div style={{
                position: "absolute", width: "100%", height: "100%",
                backfaceVisibility: "hidden",
                backgroundImage: `url(${backCardUrl})`,
                backgroundSize: "cover",
                borderRadius: 10,
                border: "2px solid #555"
              }} />

              {/* ด้านหน้า (Front) */}
              <div style={{
                position: "absolute", width: "100%", height: "100%",
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
                backgroundImage: `url(${img})`,
                backgroundSize: "cover",
                borderRadius: 10,
                border: "2px solid #fff",
                boxShadow: "0 0 15px gold"
              }} />
            </div>
          );
        })}
      </div>

      {/* ปุ่มเลือก (แสดงเมื่อเปิดครบทุกใบ และเป็นตาเรา) */}
      {allRevealed && isMyTurn && (
        <div style={{ marginTop: 30, display: "flex", gap: 10, flexDirection: "column", alignItems: "center" }}>
          <p>เลือกการ์ด 1 ใบเพื่อนำขึ้นมือ (ที่เหลือจะลงใต้กอง)</p>
          <div style={{ display: "flex", gap: 10 }}>
            {cards.map((img, i) => (
              <button 
                key={i}
                onClick={() => onSelect(img, i)}
                style={{
                  padding: "8px 12px", borderRadius: 5, border: "none", cursor: "pointer",
                  background: "#4CAF50", color: "white", fontWeight: "bold"
                }}
              >
                เลือกใบที่ {i + 1}
              </button>
            ))}
          </div>
          <button 
            onClick={() => onSelect(null, -1)} // null = ไม่เลือก
            style={{
              marginTop: 10, padding: "10px 20px", borderRadius: 5, border: "1px solid #888", 
              background: "transparent", color: "#aaa", cursor: "pointer"
            }}
          >
            ไม่เลือกเลย (ส่งกลับหมด)
          </button>
        </div>
      )}

      {/* ข้อความบอกสถานะฝ่ายตรงข้าม */}
      {allRevealed && !isMyTurn && (
        <div style={{ marginTop: 30, color: "#aaa" }}>
          ⏳ รอฝ่ายตรงข้ามเลือกการ์ด...
        </div>
      )}

    </div>
  );
}