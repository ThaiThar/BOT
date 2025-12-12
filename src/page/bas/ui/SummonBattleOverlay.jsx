// src/components/Bas/ui/SummonBattleOverlay.jsx
import React from "react";
import Swal from "sweetalert2";
import "./SummonBattleOverlay.css";

function SummonBattleOverlay({ 
    summonState, 
    myRole, 
    handCards, 
    startClash, 
    submitEnemyCard, 
    submitSupportCard,
    submitEnemyCard2 
}) {
    if (!summonState.isActive) return null;

    const { stage, owner, cardMain, cardEnemy, cardSupport, cardEnemy2, timeLeft } = summonState;
    const isOwner = myRole === owner;

    // --- 1. หน้าจอ Pending ---
    if (stage === "pending") {
        return (
            <div className="summon-overlay pending">
                <div className="card-preview">
                    <img src={cardMain} className="main-card glow" alt="Main" />
                    <div className="timer-badge">{timeLeft}</div>
                </div>
                {isOwner ? (
                    <div className="status-text">
                        <h2>⏳ กำลังร่ายเวทย์...</h2>
                        <p>รอคู่แข่งตัดสินใจ</p>
                    </div>
                ) : (
                    <div className="enemy-action">
                        <h2>⚠️ ศัตรูกำลังลงการ์ด!</h2>
                        <button className="battle-btn" onClick={startClash}>
                            ⚔️ เข้าสู่โหมดต่อสู้
                        </button>
                    </div>
                )}
            </div>
        );
    }

    // --- 2. หน้าจอ Battle Arena ---
    const handleSelectCard = (callback) => {
        if (handCards.length === 0) return Swal.fire("ไม่มีการ์ดในมือ!", "", "error");
        
        Swal.fire({
            title: "เลือกการ์ดเพื่อต่อสู้",
            html: `
                <div style="display:flex; gap:10px; overflow-x:auto; padding:10px; justify-content:center;">
                    ${handCards.map((img, i) => `
                        <img src="${img}" class="hand-select-img" data-index="${i}" 
                             style="width:100px; height:140px; object-fit:cover; cursor:pointer; border:2px solid #fff; border-radius:5px; transition:0.2s;" 
                             onmouseover="this.style.transform='scale(1.1)'"
                             onmouseout="this.style.transform='scale(1)'"
                        />
                    `).join("")}
                </div>
            `,
            width: 800,
            showConfirmButton: false,
            background: "#1a1a1a",
            color: "#fff",
            // ✅ FIX 1: ปิดการคืน Focus เพื่อแก้ปัญหา aria-hidden error
            returnFocus: false, 
            // ✅ FIX 2: ปรับ Z-Index ของ Swal ให้สูงกว่า Overlay แน่นอน
            customClass: {
                container: 'swal-z-index-fix'
            },
            didOpen: () => {
                document.querySelectorAll(".hand-select-img").forEach(el => {
                    el.onclick = () => {
                        const idx = el.getAttribute("data-index");
                        
                        // ปิด Swal ก่อน
                        Swal.close();

                        // ✅ FIX 3: ใช้ setTimeout เพื่อให้ Swal ปิดสนิทก่อนเรียก Callback
                        // ช่วยป้องกัน State Update ชนกับ Animation ของ Swal
                        setTimeout(() => {
                            if (handCards[idx]) {
                                callback(handCards[idx]);
                            } else {
                                console.error("Card not found at index:", idx);
                            }
                        }, 200); 
                    };
                });
            }
        });
    };

    return (
        <div className="summon-overlay battle-arena">
            <div className="battle-header">
                <h1 className="battle-title">⚔️ CHAIN BATTLE ⚔️</h1>
                <div className="battle-timer">เวลาเหลือ: {timeLeft} วินาที</div>
            </div>

            <div className="arena-grid">
                {/* 1. Main Avatar */}
                <div className="card-slot">
                    <p className="slot-label">Avatar เป้าหมาย</p>
                    <img src={cardMain} className="arena-card main" alt="Main" />
                </div>

                {/* 2. Enemy 1 */}
                <div className="card-slot">
                    <p className="slot-label">ขัดขวาง 1 (ศัตรู)</p>
                    {cardEnemy ? (
                        <img src={cardEnemy} className="arena-card enemy" alt="Enemy" />
                    ) : (
                        <div className="empty-slot">
                            {stage === "clash_enemy" ? "รอศัตรูเลือก..." : "-"}
                        </div>
                    )}
                </div>

                {/* 3. Support */}
                <div className="card-slot">
                    <p className="slot-label">ป้องกัน (เรา)</p>
                    {cardSupport ? (
                        <img src={cardSupport} className="arena-card support" alt="Support" />
                    ) : (
                        <div className="empty-slot">
                             {stage === "clash_owner" ? "รอเจ้าของเลือก..." : "-"}
                        </div>
                    )}
                </div>

                {/* 4. Enemy 2 */}
                <div className="card-slot">
                    <p className="slot-label">ขัดขวาง 2 (ศัตรู)</p>
                    {cardEnemy2 ? (
                        <img src={cardEnemy2} className="arena-card enemy" alt="Enemy2" />
                    ) : (
                        <div className="empty-slot" style={{borderStyle: 'dotted', opacity: 0.5}}>
                            {stage === "clash_enemy_2" ? "รอศัตรู..." : "-"}
                        </div>
                    )}
                </div>
            </div>

            {/* ACTION BAR */}
            <div className="action-bar">
                {/* ศัตรูเลือกใบที่ 1 */}
                {!isOwner && stage === "clash_enemy" && (
                    <button className="select-btn pulse" onClick={() => handleSelectCard(submitEnemyCard)}>
                        🎴 เลือกการ์ดขัดขวาง 1
                    </button>
                )}

                {/* เจ้าของเลือก Support */}
                {isOwner && stage === "clash_owner" && (
                    <button className="select-btn pulse" onClick={() => handleSelectCard(submitSupportCard)}>
                        🛡️ เลือกการ์ดป้องกันเพิ่ม
                    </button>
                )}

                {/* ศัตรูเลือกใบที่ 2 */}
                {!isOwner && stage === "clash_enemy_2" && (
                    <button className="select-btn pulse danger" onClick={() => handleSelectCard(submitEnemyCard2)}>
                        💥 เลือกการ์ดขัดขวาง 2
                    </button>
                )}

                {/* สถานะรอ */}
                {isOwner && (stage === "clash_enemy" || stage === "clash_enemy_2") && (
                    <p className="status-wait">รอคู่แข่งเลือกการ์ด...</p>
                )}
                {!isOwner && stage === "clash_owner" && (
                    <p className="status-wait">รอเจ้าของเลือกการ์ดเสริม...</p>
                )}
            </div>
        </div>
    );
}

export default SummonBattleOverlay;