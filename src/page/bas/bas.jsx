import React, { useState } from "react";
import "./style.css";
import Start from "./start/start.jsx";
import Center from "./center/center.jsx";
import End1 from "./end1/end1.jsx";
import HandButton from "./hand/HandButton.jsx";

function Bas() {
  const [handCards, setHandCards] = useState([]);
  const [magicSlots, setMagicSlots] = useState([null, null, null, null]);
  const [avatarSlots, setAvatarSlots] = useState([null, null, null, null]);
  const [modSlots, setModSlots] = useState([[], [], [], []]);
  const [end1Cards, setEnd1Cards] = useState([]);
  const [end2Cards, setEnd2Cards] = useState([]);
  const [deckCards, setDeckCards] = useState([]);
  const [avatarRotation, setAvatarRotation] = useState([0,0,0,0]);

  const handleDrawCard = (card) => {
    setHandCards((prev) => [...prev, card]);
  };

  return (
    <div className="fillborad">
      <HandButton
        handCards={handCards}
        setHandCards={setHandCards}
        magicSlots={magicSlots}
        setMagicSlots={setMagicSlots}
        avatarSlots={avatarSlots}
        setAvatarSlots={setAvatarSlots}
        modSlots={modSlots}
        setModSlots={setModSlots}
      />

      <div style={{ display: "flex" }}>
        <div className="start">
          <Start />
        </div>

        <div className="center">
          <Center
            magicSlots={magicSlots}
            setMagicSlots={setMagicSlots}
            avatarSlots={avatarSlots}
            setAvatarSlots={setAvatarSlots}
            modSlots={modSlots}
            setModSlots={setModSlots}
            setHandCards={setHandCards}
            end1Cards={end1Cards}
            setEnd1Cards={setEnd1Cards}
            end2Cards={end2Cards}
            setEnd2Cards={setEnd2Cards}
            deckCards={deckCards}
            setDeckCards={setDeckCards}
          />
        </div>

        <div className="end1">
          <End1
            onDrawCard={handleDrawCard}
            end1Cards={end1Cards}
            setEnd1Cards={setEnd1Cards}
            end2Cards={end2Cards}
            setEnd2Cards={setEnd2Cards}
            deckCards={deckCards}
            setDeckCards={setDeckCards}
            setHandCards={setHandCards}   
          />
        </div>
      </div>
    </div>
  );
}

export default Bas;
