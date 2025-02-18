import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Register = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("https://a4-squishycode.onrender.com/register", { username, password });
            if (response.status === 201) {
                setSuccess("Registration successful!");
                setError(null);
                setTimeout(() => navigate("/login"), 2000);
            }
        } catch (err) {
            setError(err.response?.data?.message || "An error occurred. Please try again.");
            setSuccess(null);
        }
    };

    return (
        <div className="container">
            <div className="box">
                <h2 className="title">Create an Account</h2>
                {error && <p className="error">{error}</p>}
                {success && <p className="text-green-500 text-center">{success}</p>}
                <form onSubmit={handleRegister}>
                    <div className="mb-4">
                        <label className="label">Username</label>
                        <input type="text" value={username} className="input" onChange={(e) => setUsername(e.target.value)} required />
                    </div>
                    <div className="mb-4">
                        <label className="label">Password</label>
                        <input type="password" value={password} className="input" onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="button button-blue">Register</button>
                </form>
                <p className="footer">
                    Already have an account? <a href="/login" className="link">Login here</a>
                </p>
            </div>
        </div>
    );
};

export default Register;
