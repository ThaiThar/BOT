import React from 'react'
import Mos from './page/mos.jsx'
import Bas from './page/bas/bas.jsx'
import Battle from './page/battle/battle.jsx'
import './App.css'

function App() {
  return (
    <div className='borad'>
       <Battle />
      <Bas />
     
      {/* <Mos /> */}
    </div>
  )
}

export default App
