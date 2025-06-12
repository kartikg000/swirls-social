import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = "https://swirls-backend.onrender.com";

function Login({ onLogin }) {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [message, setMessage] = useState('');

    const handleChange = e => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setMessage('Logging in...');
        const formData = new FormData();
        formData.append('email', form.email);
        formData.append('password', form.password);
        try {
            const res = await fetch(`${BACKEND_URL}/login`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json'
                },
                body: formData
            });

            const responseText = await res.text();
            console.log('Login response:', responseText);

            try {
                const data = JSON.parse(responseText);
                if (data.error) {
                    setMessage(data.error);
                } else {
                    setMessage('Login successful!');
                    onLogin(data);
                    navigate('/profile', { replace: true });
                }
            } catch (parseError) {
                setMessage('Invalid server response');
                console.error('Parse error:', parseError);
            }
        } catch (err) {
            console.error('Login error:', err);
            setMessage('Server error during login');
        }
    };

    return (
        <div className="auth-container">
            <div className="container p-4" style={{ maxWidth: 400, margin: "40px auto" }}>
                <h2 className="text-center mb-4">Login</h2>
                {message && (
                    <div className={`alert ${message.includes('successful') ? 'alert-success' : 'alert-danger'} mb-3`}>
                        {message}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <input
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="Email"
                            required
                            className="form-control"
                        />
                    </div>
                    <div className="mb-3">
                        <input
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Password"
                            required
                            className="form-control"
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">Login</button>
                </form>
            </div>
        </div>
    );
}

export default Login;