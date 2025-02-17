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
        <div className="flex items-center justify-center h-screen bg-gray-100">

            <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-semibold text-center text-gray-700">Create an Account</h2>

                {error && <p className='text-red-500 text-center'>{error}</p>}
                {success && <p className='text-green-500 text-center'>{success}</p>}

                <form onSubmit = {handleRegister}>
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
                        Register
                    </button>
                </form>

                <p className="text-sm text-center text-gray-500 mt-4">
                    Already have an account? <a href="/login" className="text-blue-500 hover:underline">Login here</a>
                </p>
            </div>
        </div>
    );
};

export default Register;