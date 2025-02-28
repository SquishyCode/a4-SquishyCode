import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Results = () => {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios("https://a4-squishycode.onrender.com/results", {withCredentials: true});

                console.log("Session Check Response:", response.data);

                setUser(response.data.user);
                setUserData(response.data.userData);
            } catch (error) {
                if (error.response && error.response.status === 401) navigate("/login");
                console.error("Failed to fetch results", error);
            }
        };
        fetchData();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await axios.post("https://a4-squishycode.onrender.com/logout", {}, { withCredentials: true });
            console.log("Logout successful"); // Debugging log
            navigate("/login"); // Redirect after logout
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };


    const addNewEntry = async () => {
        try {
            const newEntry = {
                title: "New Title",
                description: "New Description",
                timestamp: new Date().toISOString()
            };

            // Send request to backend
            const response = await axios.post("https://a4-squishycode.onrender.com/add", newEntry, {
                withCredentials: true
            });

            console.log("Add Entry Response:", response.data);

            if (!response.data || !response.data.newEntry) {
                console.error("Invalid response from backend:", response.data);
                return;
            }

            setUserData(prevData => [...prevData, response.data.newEntry]);

            setEditingId(response.data.newEntry._id);
            setEditData(response.data.newEntry);

            location.reload();

        } catch (error) {
            console.error("Error adding entry:", error.response ? error.response.data : error);
        }
    };



    const handleDelete = async (id) => {
        try {
            await axios.post(`https://a4-squishycode.onrender.com/delete/${id}`, {},
                {withCredentials: true});
            setUserData(prevData => prevData.filter(item => item._id !== id));
        } catch (error) {
            console.error("Error deleting entry:", error);
        }
    };

    const handleUpdate = async (id) => {
        try {
            await axios.post(`https://a4-squishycode.onrender.com/edit/${id}`, editData,
                {withCredentials: true});
            setUserData(userData.map(item => (item._id === id ? { ...item, ...editData } : item)));
            setEditingId(null);
        } catch (error) { console.error("Error updating entry:", error); }
    };

    return (
        <div className="flex flex-col min-h-screen p-4 bg-white shadow-md rounded-lg">
            <h1 className="text-2xl font-bold mb-4 text-center">Welcome, {user?.username}</h1>
            <button onClick={addNewEntry} className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 mb-4 self-start">Add New Entry</button>
            <div className="flex flex-col space-y-4 mb-4">
                {userData.map((item) => (
                    <div key={item._id} className="border p-4 rounded-lg shadow-sm flex items-center justify-between space-x-4">
                        {editingId === item._id ? (
                            <>
                                <input type="text" name="title" value={editData.title} onChange={(e) => setEditData({ ...editData, title: e.target.value })} className="flex-1" />
                                <input type="text" name="description" value={editData.description} onChange={(e) => setEditData({ ...editData, description: e.target.value })} className="flex-1" />
                                <input type="datetime-local" name="timestamp" value={editData.timestamp} onChange={(e) => setEditData({ ...editData, timestamp: e.target.value })} className="flex-1" />
                                <div className="flex space-x-2">
                                    <button onClick={() => handleUpdate(item._id)} className="bg-green-500 text-white py-1 px-3 rounded hover:bg-green-600">Save</button>
                                    <button onClick={() => setEditingId(null)} className="bg-gray-500 text-white py-1 px-3 rounded hover:bg-gray-600">Cancel</button>
                                </div>
                            </>
                        ) : (
                            <>
                                <span className="flex-1 font-semibold">{item.title}</span>
                                <span className="flex-1">{item.description}</span>
                                <span className="flex-1 text-gray-500">{item.timestamp}</span>
                                <div className="flex space-x-2">
                                    <button onClick={() => setEditingId(item._id)} className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600">Edit</button>
                                    <button onClick={() => handleDelete(item._id)} className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600">Delete</button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
            <button onClick={handleLogout} className="mt-auto bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 self-center">Logout</button>
        </div>
    );
};

export default Results;
