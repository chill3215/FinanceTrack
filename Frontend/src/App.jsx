import { useState } from 'react'
import './App.css'
import Login from "./pages/Login.jsx";
import {BrowserRouter, Navigate, Route, Router, Routes} from "react-router-dom";
import MainPage from "./pages/MainPage.jsx";

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    return (
       <BrowserRouter>
           <Routes>
               <Route
               path="/login"
               element={<Login onLogin={()=> setIsLoggedIn(true)}/>}/>
               <Route
               path="/main"
               element={isLoggedIn? <MainPage/> : <Navigate to="/login" replace/>}/>
           </Routes>
       </BrowserRouter>
    );
}

export default App
