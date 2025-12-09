import React, { useState } from "react";
import { Camera, RefreshCw, Dice5 } from "lucide-react";
import './startstyle.css'
import backCardUrl from '../../../assets/backcard.jpg'
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
                imageAlt: "A tall image"
            });
    }

    const resetAll = () => {
        setCards(Array.from({ length: 5 }, () => ({ image: null, flipped: false })));
        setImages([]);
        setStage("choose");
    };
    const cssCode = `

`;
    return (
        <div className="gameContainer">
            <div className="topControl">
                {stage === "choose" && (
                    <div className="file-input-wrapper">
                        <label className="fileBtn">
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                style={{ display: "none" }}
                                onChange={(e) => handleChooseImages(e.target.files)}
                            />
                            <Camera size={20} /> เลือกรูปสูงสุด 5 รูป
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
                        <div key={index} className="cardContainer" onClick={() => toggleFlip(index)}>

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