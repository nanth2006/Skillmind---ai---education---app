import { useState } from "react"
import Sidebar from "../components/Sidebar"

function Motivation(){

  const [text,setText] = useState("")

  const generate=()=>{
    setText("🔥 Finish your goal before deadline!")
  }

  return(
    <div>
      <Sidebar/>

      <div className="main">
        <h1>Motivation</h1>

        <button onClick={generate}>Generate</button>

        <p>{text}</p>
      </div>
    </div>
  )
}

export default Motivation