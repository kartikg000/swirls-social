import React, { useState, useEffect } from 'react';

function Messages({ user }) {
    const [friends, setFriends] = useState([]);
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [messages, setMessages] = useState([]);
    const [content, setContent] = useState('');
    const [message, setMessage] = useState('');
    const [friendRequests, setFriendRequests] = useState([]);
    const [requestEmail, setRequestEmail] = useState('');

    useEffect(() => {
        if (user) {
            fetch(`/friends/${user.id}`)
                .then(res => res.json())
                .then(setFriends);
            fetch(`/friend-requests/${user.id}`)
                .then(res => res.json())
                .then(setFriendRequests);
        }
    }, [user]);

    const fetchMessages = (friend) => {
        setSelectedFriend(friend);
        fetch(`/messages?user1=${user.id}&user2=${friend.id}`)
            .then(res => res.json())
            .then(setMessages);
    };

    const handleSend = async e => {
        e.preventDefault();
        if (!selectedFriend) return;
        const formData = new FormData();
        formData.append('sender_id', user.id);
        formData.append('receiver_id', selectedFriend.id);
        formData.append('content', content);
        const res = await fetch('/message', { method: 'POST', body: formData });
        if (res.ok) {
            setContent('');
            fetchMessages(selectedFriend);
        } else {
            setMessage('Failed to send message');
        }
    };

    const handleSendRequest = async e => {
        e.preventDefault();
        // Find user by email
        const res = await fetch('/users');
        const users = await res.json();
        const toUser = users.find(u => u.email === requestEmail);
        if (!toUser) {
            setMessage('User not found');
            return;
        }
        const formData = new FormData();
        formData.append('from_id', user.id);
        formData.append('to_id', toUser.id);
        const reqRes = await fetch('/friend-request', { method: 'POST', body: formData });
        if (reqRes.ok) {
            setMessage('Friend request sent!');
        } else {
            const data = await reqRes.json();
            setMessage(data.detail || 'Failed to send request');
        }
    };

    const handleAccept = async (from_id) => {
        const formData = new FormData();
        formData.append('from_id', from_id);
        formData.append('to_id', user.id);
        const res = await fetch('/friend-request/accept', { method: 'POST', body: formData });
        if (res.ok) {
            setMessage('Friend request accepted!');
            // Refresh friends and requests
            fetch(`/friends/${user.id}`)
                .then(res => res.json())
                .then(setFriends);
            fetch(`/friend-requests/${user.id}`)
                .then(res => res.json())
                .then(setFriendRequests);
        } else {
            setMessage('Failed to accept request');
        }
    };

    return (
        <div className="container page-glass-transition" style={{ padding: 40, textAlign: 'center' }}>
            <h2 className="form-title">Messages</h2>
            <div className="row">
                <div className="col-md-4">
                    <h5 className="form-step">Your Friends</h5>
                    <ul className="list-group">
                        {friends.map(f => (
                            <li key={f.id} className={`list-group-item ${selectedFriend && selectedFriend.id === f.id ? 'active' : ''}`} style={{ cursor: 'pointer' }} onClick={() => fetchMessages(f)}>
                                {f.name} ({f.email})
                            </li>
                        ))}
                    </ul>
                    <form onSubmit={handleSendRequest} className="mt-3">
                        <input type="email" value={requestEmail} onChange={e => setRequestEmail(e.target.value)} placeholder="Friend's Email" className="form-control mb-2" required />
                        <button className="btn btn-secondary" type="submit">Send Friend Request</button>
                    </form>
                    <h6 className="form-step mt-3">Pending Requests</h6>
                    <ul className="list-group">
                        {friendRequests.map(fr => (
                            <li key={fr.from_id} className="list-group-item d-flex justify-content-between align-items-center">
                                From: {fr.from_id}
                                <button className="btn btn-sm btn-success" onClick={() => handleAccept(fr.from_id)}>Accept</button>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="col-md-8">
                    {selectedFriend ? (
                        <>
                            <h5 className="form-step">Chat with {selectedFriend.name}</h5>
                            <div style={{ maxHeight: 300, overflowY: 'auto', border: '1px solid #eee', marginBottom: 10, padding: 10 }}>
                                {messages.map(m => (
                                    <div key={m.id} style={{ textAlign: m.sender_id === user.id ? 'right' : 'left' }}>
                                        <b>{m.sender_id === user.id ? 'You' : selectedFriend.name}:</b> {m.content}
                                    </div>
                                ))}
                            </div>
                            <form onSubmit={handleSend} className="d-flex">
                                <input value={content} onChange={e => setContent(e.target.value)} className="form-control me-2" placeholder="Type a message..." required />
                                <button className="btn btn-primary" type="submit">Send</button>
                            </form>
                        </>
                    ) : (
                        <div className="form-label">Select a friend to chat</div>
                    )}
                </div>
            </div>
            {message && <div style={{ color: 'green', marginTop: 10 }}>{message}</div>}
        </div>
    );
}

export default Messages;
