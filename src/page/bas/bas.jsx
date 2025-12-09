import React, { useState } from 'react'
import './style.css'
import Start from './start/start.jsx'
import Center from './center/center.jsx'
import End1 from './end1/end1.jsx'
import HandButton from './hand/HandButton.jsx'   // ← นำเข้าใหม่

function Bas() {

  const [handCards, setHandCards] = useState([]);

  const handleDrawCard = (card) => {
    setHandCards(prev => [...prev, card]);
  };

  return (
    <div className='fillborad'>

      {/* ⭐ ปุ่มลอยสำหรับเปิด hand popup */}
      <HandButton handCards={handCards} />

      <div style={{display:'flex'}}>
        <div className="start"><Start /></div>
        <div className="center"><Center /></div>

        <div className="end1">
          <End1 onDrawCard={handleDrawCard} />
        </div>
      </div>
    </div>
  )
}

export default Bas;
