import { useState } from 'react'
import './App.css'
import Login from "./pages/Login.jsx";
import {BrowserRouter, Navigate, Route, Router, Routes} from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import Register from "./pages/Register.jsx";

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    return (
       <BrowserRouter>
           <Routes>
               <Route
               path="/register"
               element={<Register/>}
               />
               <Route
               path="/login"
               element={<Login onLogin={()=> setIsLoggedIn(true)}/>}
               />
               <Route
               path="/main"
               element={isLoggedIn? <Dashboard/> : <Navigate to="/login" replace/>}
               />
               <Route
               path="/"
               element={<Navigate to="/register" replace/>}
               />
           </Routes>
       </BrowserRouter>
    );
}

export default App
