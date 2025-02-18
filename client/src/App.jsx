//import './App.css'
import {Routes, Route, Navigate} from 'react-router-dom';
import Home from "./pages/Home.jsx";
import Results from "./pages/Results.jsx";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";

function App() {
  return (
    <Routes>
        <Route exact path="/" element={<Navigate to="/register" replace />} />
        <Route exact path='/results' element={<Results/>}/>
        <Route exact path="/register" element={<Register/>}/>
        <Route exact path="/login" element={<Login/>}/>
    </Routes>
  );
}

export default App
