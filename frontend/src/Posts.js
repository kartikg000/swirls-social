import React, { useState, useEffect } from 'react';

function Posts({ user }) {
    const [posts, setPosts] = useState([]);
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [friends, setFriends] = useState([]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (user) {
            fetch(`/posts/${user.id}`)
                .then(res => res.json())
                .then(setPosts);
            fetch(`/friends/${user.id}`)
                .then(res => res.json())
                .then(setFriends);
        }
    }, [user]);

    const handleSubmit = async e => {
        e.preventDefault();
        setMessage('Posting...');
        const formData = new FormData();
        formData.append('user_id', user.id);
        formData.append('content', content);
        if (image) formData.append('image', image);
        try {
            const res = await fetch('/posts', { method: 'POST', body: formData });
            console.log('POST /posts response:', res);
            if (res.ok) {
                setContent('');
                setImage(null);
                setMessage('Posted!');
                fetch(`/posts/${user.id}`)
                    .then(res => res.json())
                    .then(setPosts);
            } else {
                let errText = await res.text();
                setMessage('Failed to post: ' + errText);
                console.error('Failed to post:', errText);
            }
        } catch (err) {
            setMessage('Network error: ' + err);
            console.error('Network error:', err);
        }
    };

    return (
        <div className="container page-glass-transition" style={{ padding: 40, textAlign: 'center' }}>
            <h2 className="form-title">Posts</h2>
            <form onSubmit={handleSubmit} className="mb-3">
                <textarea value={content} onChange={e => setContent(e.target.value)} className="form-control mb-2" placeholder="What's on your mind?" required />
                <input type="file" accept="image/*" className="form-control mb-2" onChange={e => setImage(e.target.files[0])} />
                <button className="btn btn-primary" type="submit">Post</button>
            </form>
            {message && <div style={{ color: 'green' }}>{message}</div>}
            <h4 className="mt-4 form-step">Your & Friends' Posts</h4>
            <ul className="list-group">
                {posts.map(post => (
                    <li key={post.id} className="list-group-item">
                        <b>{post.user_name || 'User'}:</b> {post.content}
                        {post.image_path && (
                            <div style={{ marginTop: 10 }}>
                                <img src={`/${post.image_path}`} alt="post" style={{ maxWidth: 200, borderRadius: 10, boxShadow: '0 2px 8px #eecbfa' }} />
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Posts;
