import {useState} from "react";
import {useNavigate} from "react-router-dom";

function Register(){
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function register() {
        const res = await fetch("http://localhost:3000/auth/register", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({email, password})
        })
        if (res.status === 200) {
            alert("register erfolgreich");
            navigate("/login");
        }
    }

    return (
    <div>
        <h2>Register</h2>
        <input placeholder="Email" type="text" onChange={(e) => setEmail(e.target.value)}/>
        <input placeholder="Password" type="password" onChange={(e) => setPassword(e.target.value)}/>
        <button onClick={register}>Register</button>
    </div>
    );
}

export default Register;