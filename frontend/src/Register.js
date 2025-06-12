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
    const [isSuccess, setIsSuccess] = useState(false);
    const [shouldNavigate, setShouldNavigate] = useState(false);

    React.useEffect(() => {
        if (shouldNavigate) {
            const timer = setTimeout(() => {
                navigate('/login');
            }, 2000); // Increased to 2 seconds to ensure visibility of success message
            return () => clearTimeout(timer);
        }
    }, [shouldNavigate, navigate]);

    const handleChange = e => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setMessage('Registering...');
        setIsSuccess(false);
        setShouldNavigate(false);

        const formData = new FormData();
        formData.append('email', form.email);
        formData.append('password', form.password);
        formData.append('name', form.name);
        formData.append('age', form.age);
        formData.append('parent_email', form.parent_email);

        console.log('Sending registration request...');

        try {
            const res = await fetch(`${BACKEND_URL}/register/child`, {
                method: 'POST',
                body: formData
            });

            console.log('Response status:', res.status);
            console.log('Response headers:', [...res.headers.entries()]);

            const responseText = await res.text();
            console.log('Raw response:', responseText);

            try {
                const data = JSON.parse(responseText);
                if (res.ok) {
                    console.log('Registration successful:', data);
                    setIsSuccess(true);
                    setMessage('Registration successful! You will be redirected to login in 2 seconds...');
                    setShouldNavigate(true);
                } else {
                    console.error('Registration failed:', data);
                    const errorMsg = typeof data === 'string' ? data :
                        data.detail?.[0]?.msg || data.detail || data.message ||
                        'Registration failed. Please check your information and try again.';
                    setMessage(errorMsg);
                }
            } catch (parseError) {
                console.error('Parse error:', parseError);
                console.error('Raw response that failed to parse:', responseText);
                setMessage(responseText || 'Server error occurred. Please try again.');
            }
        } catch (err) {
            console.error('Network error:', err);
            setMessage('Connection error. Please check your internet connection and try again.');
        }
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
                            disabled={isSuccess}
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
                            disabled={isSuccess}
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
                            disabled={isSuccess}
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
                            disabled={isSuccess}
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
                            disabled={isSuccess}
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary w-100"
                        disabled={isSuccess}
                    >
                        {isSuccess ? 'Registration Successful' : 'Register'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Register;