import React from 'react'
import './battleStyle.css'


// ✅ รับ battleCenterCard เข้ามาเป็น Props
function Battle({ battleCenterCard }) {
  return (
    <div className='battlecenter'>
      <div className='battlebox'>
        <div className='center-battle start'></div>
        
        {/* ✅ แสดงการ์ด ถ้ามีข้อมูลส่งมา */}
        <div className='center-battle center'>
            {battleCenterCard && (
                <img 
                    className='img-battle-center'
                    src={battleCenterCard} 
                    alt="Battle Card" 
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }
                  
                  } 
                />
            )}
        </div>

        <div className='center-battle end'></div>
      </div>
    </div>
  )
}

export default Battle