// src/components/Bas/start/start.jsx
import React, { useState } from "react"; // ✅ นำ useState กลับมาใช้แค่สำหรับ Loading UI (ไม่ได้ใช้กับ Game State)
import { Camera, RefreshCw, Dice5, Loader2 } from "lucide-react";
import "./startstyle.css";
import backCardUrl from "../../../assets/backcard.jpg";
import Swal from "sweetalert2";

function Start({ 
  cards, 
  setCards, 
  images, 
  setImages, 
  stage, 
  setStage, 
  isEnemy 
}) {
  // 🔹 State สำหรับ UI โหลดดิ้ง (เฉพาะเครื่องเรา ไม่ต้อง Sync)
  const [isUploading, setIsUploading] = useState(false);

  const handleChooseImages = async (files) => {
    // 1. ป้องกันคนอื่นกด
    if (isEnemy) return;
    if (!files || files.length === 0) return;

    const selected = Array.from(files).slice(0, 5);
    setIsUploading(true); // เริ่มหมุนติ้วๆ

    try {
      // 2. เตรียมข้อมูล FormData ส่งเข้า PHP
      const formData = new FormData();
      selected.forEach((file) => {
        // 'cards[]' ตรงกับชื่อที่ PHP $_FILES['cards'] ต้องการ
        formData.append("cards[]", file);
      });

      // 3. ยิงไปที่ Server
      const response = await fetch("https://agenda.bkkthon.ac.th/card-game-api/upload.php", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        // ✅ 4. ได้ URL กลับมาแล้ว! ส่งเข้า State (Socket จะส่ง URL สั้นๆ นี้ไปหาเพื่อน ไม่หลุดแน่นอน)
        setImages(data.urls);
        setStage("ready");
      } else {
        Swal.fire("Upload Failed", data.message || "เกิดข้อผิดพลาดในการอัปโหลด", "error");
      }

    } catch (error) {
      console.error("Upload error:", error);
      Swal.fire("Connection Error", "ไม่สามารถติดต่อ Server อัปโหลดได้", "error");
    } finally {
      setIsUploading(false); // หยุดหมุน
    }
  };

  const randomAssign = () => {
    if (isEnemy) return;

    const shuffled = [...images]
      .map((img) => ({ img, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map((x) => x.img);

    setCards(shuffled.map((img) => ({ image: img, flipped: false })));
    setStage("show");
  };

  const toggleFlip = (index) => {
    if (stage !== "show") return;
    if (isEnemy) return;

    setCards((prev) =>
      prev.map((card, i) =>
        i === index ? { ...card, flipped: !card.flipped } : card
      )
    );
  };

  const resetAll = () => {
    if (isEnemy) return;

    setCards(
      Array.from({ length: 5 }, () => ({ image: null, flipped: false }))
    );
    setImages([]);
    setStage("choose");
  };

  const handleRightClick = (event, card) => {
    event.preventDefault();

    const showImage = card.image ?? backCardUrl;

    const showZoomPopup = (img) => {
      Swal.fire({
        title: "",
        html: `
          <div class="zoom-wrapper">
            <img src="${img}" class="zoom-follow-img" id="zoomFollowImg" />
          </div>
        `,
        width: 550,
        showConfirmButton: false,
        background: "#111",
      });

      setTimeout(() => {
        const zoomImg = document.getElementById("zoomFollowImg");
        if (!zoomImg) return;
        const wrapper = zoomImg.parentElement;

        wrapper.addEventListener("mousemove", (e) => {
          const rect = wrapper.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          const xPercent = (x / rect.width) * 100;
          const yPercent = (y / rect.height) * 100;

          zoomImg.style.transformOrigin = `${xPercent}% ${yPercent}%`;
          zoomImg.style.transform = "scale(2)";
        });

        wrapper.addEventListener("mouseleave", () => {
          zoomImg.style.transform = "scale(1)";
          zoomImg.style.transformOrigin = "center center";
        });
      }, 50);
    };

    showZoomPopup(showImage);
  };

  return (
    <div className="gameContainer">
      {!isEnemy && (
        <div className="topControl">
          {stage === "choose" && (
            <div className="file-input-wrapper">
              <label className={`fileBtn fileBtn-glow ${isUploading ? "disabled" : ""}`}>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={isUploading}
                  style={{ display: "none" }}
                  onChange={(e) => handleChooseImages(e.target.files)}
                />
                
                {isUploading ? (
                  <>
                    <Loader2 size={18} className="fileIcon spin-anim" />
                    <span>กำลังอัปโหลด...</span>
                  </>
                ) : (
                  <>
                    <Camera size={18} className="fileIcon" />
                    <span>เลือกการ์ด (สูงสุด 5 รูป)</span>
                  </>
                )}
              </label>
            </div>
          )}

          {stage === "ready" && (
            <>
              <p>พร้อมแล้ว {images.length} รูป</p>
              <button className="mainBtn" onClick={randomAssign}>
                <Dice5 size={20} /> เริ่มสุ่มการ์ด
              </button>
            </>
          )}

          {stage === "show" && (
            <button className="mainBtn reset" onClick={resetAll}>
              <RefreshCw size={20} /> เริ่มใหม่
            </button>
          )}
        </div>
      )}

      {/* ส่วน CSS Animation เล็กน้อยสำหรับตัวหมุน */}
      <style>{`
        .spin-anim { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .disabled { opacity: 0.6; pointer-events: none; }
      `}</style>

      {stage === "show" && (
        <div className="boxstart">
          {cards.map((card, index) => (
            <div
              key={index}
              className="cardContainer"
              onClick={() => toggleFlip(index)}
              onContextMenu={(e) => handleRightClick(e, card)}
            >
              <div className="cardWrapper">
                <div className={`card ${card.flipped ? "flipped" : ""}`}>
                  <div className="card-inner">
                    <div className="card-front">
                      <img src={backCardUrl} alt="front" />
                    </div>

                    <div className="card-back">
                      {/* รูปตรงนี้จะเป็น URL จาก Server แล้ว */}
                      <img src={card.image} alt="back" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Start;