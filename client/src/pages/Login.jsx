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
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-semibold text-center text-gray-700">Login</h2>

                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <label className="block text-gray-600 text-sm font-semibold mb-2">Username</label>
                        <input type="text" value={username}
                               className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                               onChange={(e) => setUsername(e.target.value)}
                               required/>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-600 text-sm font-semibold mb-2">Password</label>
                        <input type="password" value={password}
                               className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                               onChange={(e) => setPassword(e.target.value)}
                               required/>
                    </div>

                    <button type="submit"
                            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300">
                        Login
                    </button>
                </form>

                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

                <div className='text-center mt-4'>
                    <button onClick={handleGitHubLogin} className="w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-900 transition duration-300">
                        Login with GitHub</button>
                </div>

                <p className="text-sm text-center text-gray-500 mt-4">
                    Don't have an account? <a href="/register" className="text-blue-500 hover:underline">Sign up</a>
                </p>
            </div>
        </div>
    );
};

export default Login;