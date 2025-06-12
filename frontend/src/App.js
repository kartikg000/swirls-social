import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Homepage from './Homepage';
import Profile from './Profile';
import Posts from './Posts';
import Messages from './Messages';
import Register from './Register';
import Login from './Login';
import './theme.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import SpaceBackground from "./SpaceBackground";
import SpaceIceCreamCone from "./SpaceIceCreamCone";

function ThemeToggle({ theme, setTheme }) {
    return (
        <button
            className="theme-toggle-btn"
            style={{
                position: 'fixed',
                top: 24,
                right: 24,
                zIndex: 2000,
                background: 'rgba(30,30,30,0.18)',
                border: 'none',
                borderRadius: 24,
                padding: 10,
                boxShadow: '0 2px 12px 0 rgba(0,0,0,0.13)',
                cursor: 'pointer',
                outline: 'none',
                fontSize: 28,
                color: theme === 'dark' ? '#ffe0ec' : '#22304a',
                transition: 'background 0.3s, color 0.3s',
            }}
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
            {theme === 'dark' ? (
                <span role="img" aria-label="moon">🌙</span>
            ) : (
                <span role="img" aria-label="sun">☀️</span>
            )}
        </button>
    );
}

function Navbar({ user, setUser }) {
    return (
        <nav className="navbar navbar-expand-lg space-navbar shadow-sm">
            <div className="container">
                <Link className="navbar-brand d-flex align-items-center" to="/">
                    <span style={{ fontWeight: 700, color: '#b3e0ff', letterSpacing: 2, textShadow: '0 2px 8px #0a183d99' }}>🪐 Swirl</span>
                </Link>
                <div className="collapse navbar-collapse">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item"><Link className="nav-link" style={{ color: '#b3e0ff' }} to="/">Home</Link></li>
                        {!user && <li className="nav-item"><Link className="nav-link" style={{ color: '#b3e0ff' }} to="/login">Login</Link></li>}
                        {!user && <li className="nav-item"><Link className="nav-link" style={{ color: '#b3e0ff' }} to="/register">Register</Link></li>}
                        {user && (
                            <>
                                <li className="nav-item"><Link className="nav-link" style={{ color: '#b3e0ff' }} to="/profile">Profile</Link></li>
                                <li className="nav-item"><Link className="nav-link" style={{ color: '#b3e0ff' }} to="/posts">Posts</Link></li>
                                <li className="nav-item"><Link className="nav-link" style={{ color: '#b3e0ff' }} to="/messages">Messages</Link></li>
                                <li className="nav-item"><button className="btn btn-link nav-link" style={{ color: '#b3e0ff' }} onClick={() => setUser(null)}>Logout</button></li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
}

function HomeWithAuth({ user, setUser, onLogin, onRegisterComplete }) {
    // Show homepage, login, and register on the homepage
    return (
        <div className="container" style={{ marginTop: 40 }}>
            <Homepage />
            <div className="row mt-4">
                <div className="col-md-6">
                    <Login onLogin={onLogin} />
                </div>
                <div className="col-md-6">
                    <Register onComplete={onRegisterComplete} />
                </div>
            </div>
        </div>
    );
}

function App() {
    const [user, setUser] = useState(null);
    const [theme, setTheme] = useState('dark');

    React.useEffect(() => {
        document.body.classList.toggle('light-theme', theme === 'light');
        document.body.classList.toggle('dark-theme', theme === 'dark');
    }, [theme]);

    const handleLogin = (userData) => {
        setUser(userData);
    };

    const handleRegisterComplete = () => {
        // Just show success message, the Register component will handle navigation
    };

    return (
        <Router>
            <div>
                <ThemeToggle theme={theme} setTheme={setTheme} />
                <SpaceBackground theme={theme} />
                <Navbar user={user} setUser={setUser} />
                <Routes>
                    <Route path="/" element={user ? <Navigate to="/profile" /> : <HomeWithAuth user={user} setUser={setUser} onLogin={handleLogin} onRegisterComplete={handleRegisterComplete} />} />
                    <Route path="/register" element={<Register onComplete={handleRegisterComplete} />} />
                    <Route path="/login" element={<Login onLogin={handleLogin} />} />
                    <Route path="/profile" element={user ? <Profile user={user} /> : <Navigate to="/login" />} />
                    <Route path="/posts" element={user ? <Posts user={user} /> : <Navigate to="/login" />} />
                    <Route path="/messages" element={user ? <Messages user={user} /> : <Navigate to="/login" />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
