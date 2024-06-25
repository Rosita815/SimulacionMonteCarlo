
import Simulacion from './Simulacion'; 
import Dashboard from './Dashboard';
import index from './index.js';
import { Routes, Route } from "react-router-dom"

import './App.css';




function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={ <Simulacion /> } />
        <Route path="Dashboard" element={ <Dashboard /> } />
      </Routes>
    </div>
  )
}
export default App;
