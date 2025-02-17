//import './App.css'
import {Routes, Route } from 'react-router-dom';
import Home from "./pages/Home.jsx";
import Results from "./pages/Results.jsx";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";

function App() {
  return (
    <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path='/results' element={<Results/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path="/login" element={<Login/>}/>
    </Routes>
  );
}

export default App
