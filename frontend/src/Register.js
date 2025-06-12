import React, { useState } from 'react';

function Register({ onComplete }) {
    const [step, setStep] = useState(1);
    const [child, setChild] = useState({ name: '', age: '', email: '', password: '' });
    const [parent, setParent] = useState({ name: '', email: '', password: '', relationship: '' });
    const [childId, setChildId] = useState(null);
    const [message, setMessage] = useState('');
    const [childProof, setChildProof] = useState(null);
    const [parentProof, setParentProof] = useState(null);

    // Handle child form input
    const handleChildChange = e => {
        const { name, value } = e.target;
        setChild(child => ({
            ...child,
            [name]: value
        }));
    };

    // Handle parent form input
    const handleParentChange = e => {
        const { name, value } = e.target;
        setParent(parent => ({
            ...parent,
            [name]: value
        }));
    };

    // Submit child registration
    const handleChildSubmit = async e => {
        e.preventDefault();
        setMessage('Registering child...');
        const formData = new FormData();
        formData.append('name', child.name);
        formData.append('age', child.age);
        formData.append('email', child.email);
        formData.append('password', child.password);
        if (childProof) formData.append('proof', childProof);

        try {
            const res = await fetch('/register/child', {
                method: 'POST',
                body: formData
            });
            let data;
            try {
                data = await res.json();
            } catch {
                data = {};
            }
            if (!res.ok) {
                setMessage((data && (data.detail || data.error)) || 'Child registration failed');
                return;
            }
            setChildId(data.id);
            setStep(2); // Show parent registration form
            setMessage('');
        } catch (err) {
            setMessage('Server error during child registration');
        }
    };

    // Submit parent registration
    const handleParentSubmit = async e => {
        e.preventDefault();
        setMessage('Registering parent...');
        const formData = new FormData();
        formData.append('name', parent.name);
        formData.append('email', parent.email);
        formData.append('password', parent.password);
        formData.append('relationship', parent.relationship);
        formData.append('child_id', childId);
        if (parentProof) formData.append('proof', parentProof);

        try {
            const res = await fetch('/register/parent', {
                method: 'POST',
                body: formData
            });
            let data;
            try {
                data = await res.json();
            } catch {
                data = {};
            }
            if (!res.ok) {
                setMessage((data && (data.detail || data.error)) || 'Parent registration failed');
                return;
            }
            setStep(3); // Show completion message
            setMessage('Registration complete! You can now log in.');
            setTimeout(() => onComplete && onComplete(), 2000);
        } catch (err) {
            setMessage('Server error during parent registration');
        }
    };

    return (
        <div className="container" style={{ maxWidth: 500, margin: "40px auto" }}>
            <h2 className="form-title">Two-Step Registration</h2>
            {message && <div style={{ margin: "10px 0", color: "blue" }}>{message}</div>}

            {step === 1 && (
                <form onSubmit={handleChildSubmit}>
                    <h4 className="form-step">Step 1: Child Details</h4>
                    <input name="name" value={child.name} onChange={handleChildChange} placeholder="Child's Name" required className="form-control mb-2" />
                    <input name="age" value={child.age} onChange={handleChildChange} placeholder="Child's Age" required className="form-control mb-2" />
                    <input name="email" value={child.email} onChange={handleChildChange} placeholder="Child's Email" required className="form-control mb-2" />
                    <input name="password" type="password" value={child.password} onChange={handleChildChange} placeholder="Password" required className="form-control mb-2" />
                    <label className="form-label">ID (PDF):
                        <input type="file" accept="application/pdf" className="form-control mb-2" onChange={e => setChildProof(e.target.files[0])} />
                    </label>
                    <button type="submit" className="btn btn-primary">Next</button>
                </form>
            )}

            {step === 2 && (
                <form onSubmit={handleParentSubmit}>
                    <h4 className="form-step">Step 2: Parent/Guardian Details</h4>
                    <input name="name" value={parent.name} onChange={handleParentChange} placeholder="Parent's Name" required className="form-control mb-2" />
                    <input name="email" value={parent.email} onChange={handleParentChange} placeholder="Parent's Email" required className="form-control mb-2" />
                    <input name="password" type="password" value={parent.password} onChange={handleParentChange} placeholder="Password" required className="form-control mb-2" />
                    <select name="relationship" value={parent.relationship} onChange={handleParentChange} required className="form-control mb-2">
                        <option value="">Select relationship</option>
                        <option value="father">Father</option>
                        <option value="mother">Mother</option>
                        <option value="guardian">Guardian</option>
                    </select>
                    <label className="form-label">ID (PDF):
                        <input type="file" accept="application/pdf" className="form-control mb-2" onChange={e => setParentProof(e.target.files[0])} />
                    </label>
                    <button type="submit" className="btn btn-primary">Register</button>
                </form>
            )}

            {step === 3 && (
                <div className="form-label" style={{ color: "green", marginTop: 20 }}>
                    Registration complete! You can now log in.
                </div>
            )}
        </div>
    );
}

export default Register;
