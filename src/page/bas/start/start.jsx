import React, { useState } from "react";
import { Camera, RefreshCw, Dice5 } from "lucide-react";
import "./startstyle.css";
import backCardUrl from "../../../assets/backcard.jpg";
import Swal from "sweetalert2";

function Start() {
  const [cards, setCards] = useState(
    Array.from({ length: 5 }, () => ({ image: null, flipped: false }))
  );
  const [images, setImages] = useState([]);
  const [stage, setStage] = useState("choose");
  const handleChooseImages = (files) => {
    const selected = Array.from(files).slice(0, 5);
    Promise.all(
      selected.map(
        (f) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(f);
          })
      )
    ).then((results) => {
      setImages(results);
      setStage("ready");
    });
  };

  const randomAssign = () => {
    const shuffled = [...images]
      .map((img) => ({ img, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map((x) => x.img);

    setCards(shuffled.map((img) => ({ image: img, flipped: false })));
    setStage("show");
  };

  const toggleFlip = (index) => {
    if (stage !== "show") return;

    setCards((prev) =>
      prev.map((card, i) =>
        i === index ? { ...card, flipped: !card.flipped } : card
      )
    );
  };

  const openpopup = () => {
    Swal.fire({
      imageUrl: "https://placeholder.pics/svg/300x1500",
      imageHeight: 1000,
      imageAlt: "A tall image",
    });
  };

  const resetAll = () => {
    setCards(
      Array.from({ length: 5 }, () => ({ image: null, flipped: false }))
    );
    setImages([]);
    setStage("choose");
  };
  const cssCode = `

`;
  const handleRightClick = (event, card) => {
  event.preventDefault(); // ❗ปิดเมนูคลิกขวาปกติ

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

    // หลังจาก Swal สร้าง DOM เสร็จ
    setTimeout(() => {
      const zoomImg = document.getElementById("zoomFollowImg");
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
      <div className="topControl">
        {stage === "choose" && (
          <div className="file-input-wrapper">
            <label className="fileBtn fileBtn-glow">
              <input
                type="file"
                accept="image/*"
                multiple
                style={{ display: "none" }}
                onChange={(e) => handleChooseImages(e.target.files)}
              />
              <Camera size={18} className="fileIcon" />
              <span>เลือกการ์ด (สูงสุด 5 รูป)</span>
            </label>
          </div>
        )}

        {stage === "ready" && (
          <>
            <p>เลือกรูปแล้ว {images.length} รูป</p>
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
