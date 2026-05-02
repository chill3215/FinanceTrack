import { useState } from 'react'
import './App.css'
import Login from "./pages/Login.jsx";
import {BrowserRouter, Navigate, Route, Router, Routes} from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import Register from "./pages/Register.jsx";

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(localStorage.getItem("jwtToken")));

    return (
       <BrowserRouter>
           <Routes>
               <Route
               path="/register"
               element={isLoggedIn ? <Navigate to="/main" replace /> : <Register/>}
               />
               <Route
               path="/login"
               element={isLoggedIn ? <Navigate to="/main" replace /> : <Login onLogin={()=> setIsLoggedIn(true)}/>} 
               />
               <Route
               path="/main"
               element={isLoggedIn? <Dashboard/> : <Navigate to="/login" replace/>}
               />
               <Route
               path="/"
               element={isLoggedIn ? <Navigate to="/main" replace /> : <Navigate to="/login" replace />}
               />
           </Routes>
       </BrowserRouter>
    );
}

export default App
