import {useState} from "react";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function login() {
        const res = await fetch("http://localhost:3000/auth/login", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({email,  password})
        });
        //ließt json obj von Response body
        const data = await res.json();
        localStorage.setItem("jwtToken", data.token);
        alert("login erfolgreich");
    }

    return (
        <div>
            <h2>Login</h2>
            <input placeholder="Email" type="text" onChange={(e) => setEmail(e.target.value)}/>
            <input placeholder="Password" type="password" onChange={(e) => setPassword(e.target.value)}/>
            <button onClick={login}>Login</button>
        </div>
    );
}

export default Login;