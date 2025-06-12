import React from 'react';

function Profile({ user }) {
    const mode = user.isChild ? "Child Mode" : "Parent Mode";

    return (
        <div className="container page-glass-transition text-center">
            <h2 className="form-title">Profile</h2>
            <p className="form-label">Name: {user.name}</p>
            <p className="form-label">Email: {user.email}</p>
            <p className="form-label">Mode: {mode}</p>
        </div>
    );
}

export default Profile;
