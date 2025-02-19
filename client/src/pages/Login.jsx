import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("https://a4-squishycode.onrender.com/login", { username, password });
            if (response.status === 200) {
                navigate("/results");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Login Failed");
        }
    };

    const handleGitHubLogin = () => { window.location.href = "https://a4-squishycode.onrender.com/auth/github"; };

    return (
        <div className="container">
            <div className="box">
                <h2 className="title">Login</h2>
                <form onSubmit={handleLogin}>
                    <div className="mb-6">
                        <label className="label">Username</label>
                        <input type="text" value={username} className="input" onChange={(e) => setUsername(e.target.value)} required />
                    </div>
                    <div className="mb-6">
                        <label className="label">Password</label>
                        <input type="password" value={password} className="input" onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="button button-blue">Login</button>
                </form>
                {error && <p className="error">{error}</p>}
                <div className="text-center mt-6">
                    <button onClick={handleGitHubLogin} className="button button-gray">Login with GitHub</button>
                </div>
                <p className="footer">Don't have an account? <a href="/register" className="link">Sign up</a></p>
            </div>
        </div>
    );
};

export default Login;
