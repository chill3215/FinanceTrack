import { useState, useEffect } from 'react'
import './App.css'
import Login from "./pages/Login.jsx";
import {BrowserRouter, Navigate, Route, Routes, useNavigate, useLocation} from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import Register from "./pages/Register.jsx";

function GoogleCallback({ onLogin }) {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        if (token) {
            localStorage.setItem('jwtToken', token);
            onLogin();
            navigate('/main', { replace: true });
        } else {
            navigate('/login', { replace: true });
        }
    }, []);

    return null;
}

function RegisterEntry({ isLoggedIn }) {
    const location = useLocation();
    const fromLogin = new URLSearchParams(location.search).get("from") === "login";

    if (isLoggedIn) return <Navigate to="/main" replace />;
    if (!fromLogin) return <Navigate to="/login" replace />;

    return <Register />;
}

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(localStorage.getItem("jwtToken")));

    const handleLogout = () => {
        setIsLoggedIn(false);
    };

    return (
       <BrowserRouter>
           <Routes>
               <Route
               path="/register"
               element={<RegisterEntry isLoggedIn={isLoggedIn} />}
               />
               <Route
               path="/login"
               element={isLoggedIn ? <Navigate to="/main" replace /> : <Login onLogin={()=> setIsLoggedIn(true)}/>} 
               />
               <Route
               path="/main"
               element={isLoggedIn ? <Dashboard onLogout={handleLogout}/> : <Navigate to="/login" replace/>}
               />
               <Route
               path="/auth/callback"
               element={<GoogleCallback onLogin={() => setIsLoggedIn(true)} />}
               />
               <Route
               path="/"
               element={isLoggedIn ? <Navigate to="/main" replace /> : <Navigate to="/login" replace />}
               />
               <Route
               path="*"
               element={isLoggedIn ? <Navigate to="/main" replace /> : <Navigate to="/login" replace />}
               />
           </Routes>
       </BrowserRouter>
    );
}

export default App
