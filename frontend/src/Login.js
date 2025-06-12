import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login({ onLogin }) {
    const [form, setForm] = useState({ email: '', password: '' });
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

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
            const res = await fetch('/login', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.error) {
                setMessage(data.error);
            } else {
                setMessage('Login successful!');
                onLogin(data);
                setTimeout(() => navigate('/profile'), 1000);
            }
        } catch {
            setMessage('Server error during login');
        }
    };

    return (
        <div className="container" style={{ maxWidth: 400, margin: "40px auto" }}>
            <h2 className="form-title">Login</h2>
            {message && <div>{message}</div>}
            <form onSubmit={handleSubmit}>
                <input name="email" value={form.email} onChange={handleChange} placeholder="Email" required className="form-control mb-2" />
                <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" required className="form-control mb-2" />
                <button type="submit" className="btn btn-primary">Login</button>
            </form>
        </div>
    );
}

export default Login;
