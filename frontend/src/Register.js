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
                body: JSON.stringify(form)
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.detail || 'Registration failed');
            }

            const data = await res.json();
            if (data.error) {
                setMessage(data.error);
            } else {
                setMessage('Registration successful!');
                setTimeout(() => navigate('/login'), 1000);
            }
        } catch (err) {
            console.error('Registration error:', err);
            setMessage(err.message || 'Server error during registration');
        }
    };

    return (
        <div className="container" style={{ maxWidth: 400, margin: "40px auto" }}>
            <h2 className="form-title">Register</h2>
            {message && <div>{message}</div>}
            <form onSubmit={handleSubmit}>
                <input name="email" value={form.email} onChange={handleChange} placeholder="Email" required className="form-control mb-2" />
                <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" required className="form-control mb-2" />
                <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required className="form-control mb-2" />
                <input name="age" type="number" value={form.age} onChange={handleChange} placeholder="Age" required className="form-control mb-2" />
                <input name="parent_email" value={form.parent_email} onChange={handleChange} placeholder="Parent's Email" required className="form-control mb-2" />
                <button type="submit" className="btn btn-primary">Register</button>
            </form>
        </div>
    );
}

export default Register;