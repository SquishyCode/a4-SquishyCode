import React from 'react';

function Home() {
    const handleGitHubLogin = () => {
        window.location.href = "https://a4-squishycode.onrender.com/auth/github";
    }

    return (
        <div className='container'>
            <h1>Welcome to the App</h1>
            <button onClick={handleGitHubLogin}>Login with Github</button>
        </div>
    )
}

export default Home;