import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = "https://swirls-backend.onrender.com";

function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        email: '',
        password: '',
        name: '',
        age: '',
        parent_email: ''
    });
    const [message, setMessage] = useState('');

    const handleChange = e => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setMessage('Registering...');

        try {
            const res = await fetch(`${BACKEND_URL}/register/child`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    email: form.email,
                    password: form.password,
                    name: form.name,
                    age: parseInt(form.age),
                    parent_email: form.parent_email
                })
            });

            console.log('Response status:', res.status);
            const responseText = await res.text();
            console.log('Raw response:', responseText);

            try {
                const data = JSON.parse(responseText);
                if (res.ok) {
                    setMessage('Registration successful! Redirecting to login...');
                    navigate('/login', { replace: true });
                } else {
                    const errorMsg = typeof data === 'string' ? data :
                        data.detail || data.message ||
                        'Registration failed. Please try again.';
                    setMessage(errorMsg);
                }
            } catch (parseError) {
                setMessage(responseText || 'Unknown error occurred');
            }
        } catch (err) {
            console.error('Registration error:', err);
            setMessage('Connection error. Please try again.');
        }
    };

    return (
        <div className="container" style={{ maxWidth: 400, margin: "40px auto" }}>
            <h2 className="form-title">Register</h2>
            {message && (
                <div className={`alert ${message.includes('successful') ? 'alert-success' : 'alert-danger'}`}
                    style={{ whiteSpace: 'pre-wrap' }}>
                    {message}
                </div>
            )}
            <form onSubmit={handleSubmit}>
                <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Email"
                    required
                    className="form-control mb-2"
                />
                <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Password"
                    required
                    className="form-control mb-2"
                />
                <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Name"
                    required
                    className="form-control mb-2"
                />
                <input
                    name="age"
                    type="number"
                    value={form.age}
                    onChange={handleChange}
                    placeholder="Age"
                    required
                    className="form-control mb-2"
                />
                <input
                    name="parent_email"
                    type="email"
                    value={form.parent_email}
                    onChange={handleChange}
                    placeholder="Parent's Email"
                    required
                    className="form-control mb-2"
                />
                <button type="submit" className="btn btn-primary w-100">Register</button>
            </form>
        </div>
    );
}

export default Register;