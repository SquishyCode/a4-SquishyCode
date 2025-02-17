import React,{useState} from "react";
import {useNavigate} from 'react-router-dom';


const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:3000/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({username, password}),
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Login Failed");
            }

            navigate("/results");
        } catch (err) {
            setError(err.message);
        }
    };

    const handleGitHubLogin = () => {
        window.location.href = "http://localhost:3000/auth/github";
    }

    return (
        <div className="container">
            <div className="box">
                <h2 className="title">Login</h2>

                <form onSubmit={handleLogin}>
                    <div className="mb-6">
                        <label className="label">Username</label>
                        <input
                            type="text"
                            value={username}
                            className="input"
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label className="label">Password</label>
                        <input
                            type="password"
                            value={password}
                            className="input"
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="button button-blue">
                        Login
                    </button>
                </form>

                {error && <p className="error">{error}</p>}

                <div className="text-center mt-6">
                    <button onClick={handleGitHubLogin} className="button button-gray">
                        Login with GitHub
                    </button>
                </div>

                <p className="footer">
                    Don't have an account? <a href="/register" className="link">Sign up</a>
                </p>
            </div>
        </div>
    );
};

export default Login;