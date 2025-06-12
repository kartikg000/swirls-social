import React from 'react';
import { useNavigate } from 'react-router-dom';

function Homepage() {
    const navigate = useNavigate();
    return (
        <div className="container page-glass-transition text-center" style={{ padding: 40 }}>
            <h1 style={{ color: '#eaf6ff', textShadow: '0 2px 8px #0a183d99' }}>Welcome to Swirl</h1>
            <p style={{ color: '#eaf6ff', textShadow: '0 1px 4px #0a183d99' }}>
                A safe and fun way for kids to connect under parental supervision.
            </p>
            <button className="btn btn-primary pastel-accent" style={{ color: '#22304a', fontWeight: 700 }} onClick={() => navigate('/register')}>Get Started</button>
        </div>
    );
}

export default Homepage;
