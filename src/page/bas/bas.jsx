import React from 'react'
import './style.css'
import Start from './start/start.jsx'
import Center from './center/center.jsx'
import End1 from './end1/end1.jsx'

function bas() {
  return (
    <div className='fillborad'>
      <div className="handcard"></div>
      <div style={{display:'flex'}}>
      <div className="start"><Start /></div>
      <div className="center"> <Center /></div>
      <div className="end1"><End1 /> </div>
      </div>
    </div>
  )
}

export default bas
