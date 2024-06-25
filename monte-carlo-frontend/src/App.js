
import Simulacion from './Simulacion'; 
import index from './index.js';
import { Routes, Route } from "react-router-dom"

import './App.css';




function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={ <Simulacion /> } />
      </Routes>
    </div>
  )
}
export default App;
