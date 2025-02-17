import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Results = () => {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});

    const navigate = useNavigate();

    // Fetch user and data entries on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("http://localhost:3000/api/results", {
                    credentials: "include",
                });

                if (!response.ok) {
                    if (response.status === 401) navigate("/login");
                    throw new Error("Failed to fetch results");
                }

                const result = await response.json();
                setUser(result.user);
                setUserData(result.userData);
            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            const response = await fetch("http://localhost:3000/logout", {
                method: "POST",
                credentials: "include",
            });

            if (response.ok) {
                navigate("/login");
            }
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    // Enable edit mode
    const startEditing = (id, currentData) => {
        setEditingId(id);
        setEditData(currentData);
    };

    // Handle input changes in the editable row
    const handleEditChange = (e) => {
        setEditData({ ...editData, [e.target.name]: e.target.value });
    };

    // Update entry in MongoDB
    const handleUpdate = async (id) => {
        try {
            const response = await fetch(`http://localhost:3000/edit/${id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(editData),
            });

            if (response.ok) {
                setUserData(userData.map(item => (item._id === id ? editData : item)));
                setEditingId(null); // Exit edit mode
            }
        } catch (error) {
            console.error("Error updating entry:", error);
        }
    };

    // Delete entry
    const handleDelete = async (id) => {
        try {
            const response = await fetch(`http://localhost:3000/delete/${id}`, {
                method: "POST",
                credentials: "include",
            });

            if (response.ok) {
                setUserData(userData.filter(item => item._id !== id));
            }
        } catch (error) {
            console.error("Error deleting entry:", error);
        }
    };

    if (!user) return <p>Loading...</p>;

    return (
        <div className="container mx-auto mt-10">
            <div className="results-header">
                <h1 className="text-2xl font-bold">Welcome, {user.username}</h1>
            </div>

            {/* Data Entries Table */}
            <div className="block">
                <h3 className="text-xl font-semibold mb-4">Your Data Entries</h3>
                <table className="results-table">
                    <thead>
                    <tr>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Timestamp</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {userData.map((item) => (
                        <tr key={item._id}>
                            {editingId === item._id ? (
                                <>
                                    <td>
                                        <input type="text" name="title" value={editData.title} className="input-field w-auto mb-2"
                                               onChange={handleEditChange} />
                                    </td>
                                    <td>
                                        <input type="text" name="description" value={editData.description} className="input-field w-auto mb-2"
                                               onChange={handleEditChange} />
                                    </td>
                                    <td>
                                        <input type="datetime-local" name="timestamp" value={editData.timestamp} className="input-field w-auto mb-2"
                                               onChange={handleEditChange} />
                                    </td>
                                    <td>
                                        <button onClick={() => handleUpdate(item._id)}>Update</button>
                                        <button onClick={() => setEditingId(null)}>Cancel</button>
                                    </td>
                                </>
                            ) : (
                                <>
                                    <td>{item.title}</td>
                                    <td>{item.description}</td>
                                    <td>{item.timestamp}</td>
                                    <td>
                                        <button onClick={() => startEditing(item._id, item)}>Edit</button>
                                        <button onClick={() => handleDelete(item._id)}>Delete</button>
                                    </td>
                                </>
                            )}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Logout */}
            <div className="block text-center mt-4">
                <button onClick={handleLogout} className="text-blue-600 hover:text-blue-800">Logout</button>
            </div>
        </div>
    );
};

export default Results;
