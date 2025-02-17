import {useState} from "react";
import {useNavigate} from "react-router-dom";


const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();

    const handleRegister = async(e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:3000/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({username, password}),
                credentials: "include",
            });

            const data = await response.json();

            if(!response.ok){
                throw new Error(data.message || "Registration failed");
            }

            console.log("User has been registered successfully! Navigating to Login...")
            setSuccess(true);
            setError(null);
            navigate("/login");
        } catch (err) {
            console.log("User is already created! Failed task.")
            setError(err.message);
            setSuccess(false);
        }
    };

    return (
        <div className="container">

            <div className="box">
                <h2 className="title">Create an Account</h2>

                {error && <p className='error'>{error}</p>}
                {success && <p className='text-green-500 text-center'>{success}</p>}

                <form onSubmit = {handleRegister}>
                    <div className="mb-4">
                        <label className="label">Username</label>
                        <input type="text" value={username}
                               className="input"
                               onChange={(e) => setUsername(e.target.value)}
                               required/>
                    </div>

                    <div className="mb-4">
                        <label className="label">Password</label>
                        <input type="password" value={password}
                               className="input"
                               onChange={(e) => setPassword(e.target.value)}
                               required/>
                    </div>

                    <button type="submit"
                            className="button button-blue">
                        Register
                    </button>
                </form>

                <p className="footer">
                    Already have an account? <a href="/login" className="text-blue-500 hover:underline">Login here</a>
                </p>
            </div>
        </div>
    );
};

export default Register;