import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

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
    const [isSuccess, setIsSuccess] = useState(false);

    const handleChange = e => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setMessage('Registering...');
        setIsSuccess(false);

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
                    setIsSuccess(true);
                    setMessage('Registration successful! Please click the button below to login.');
                } else {
                    const errorMsg = typeof data === 'string' ? data :
                        data.detail || data.message ||
                        'Registration failed. Please try again.';
                    setMessage(errorMsg);
                }
            } catch (parseError) {
                console.error('Parse error:', parseError);
                setMessage(responseText || 'Unknown error occurred');
            }
        } catch (err) {
            console.error('Registration error:', err);
            setMessage('Connection error. Please try again.');
        }
    };

    const handleLoginClick = () => {
        navigate('/login', { replace: true });
    };

    return (
        <div className="auth-container">
            <div className="container p-4" style={{ maxWidth: 400, margin: "40px auto" }}>
                <h2 className="text-center mb-4">Register</h2>
                {message && (
                    <div className={`alert ${isSuccess ? 'alert-success' : 'alert-danger'} mb-3`}
                        style={{ whiteSpace: 'pre-wrap' }}>
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
                    <div className="mb-3">
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Name"
                            required
                            className="form-control"
                        />
                    </div>
                    <div className="mb-3">
                        <input
                            name="age"
                            type="number"
                            value={form.age}
                            onChange={handleChange}
                            placeholder="Age"
                            required
                            className="form-control"
                        />
                    </div>
                    <div className="mb-3">
                        <input
                            name="parent_email"
                            type="email"
                            value={form.parent_email}
                            onChange={handleChange}
                            placeholder="Parent's Email"
                            required
                            className="form-control"
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100" disabled={isSuccess}>
                        Register
                    </button>
                </form>
                {isSuccess && (
                    <div className="text-center mt-3">
                        <button onClick={handleLoginClick} className="btn btn-success">
                            Go to Login
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Register;