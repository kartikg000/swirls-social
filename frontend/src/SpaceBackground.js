import React, { useRef, useEffect } from "react";

// Simple UFO SVG
const UFO = () => (
    <svg width="60" height="30" viewBox="0 0 60 30">
        <ellipse cx="30" cy="20" rx="20" ry="8" fill="#b3e0ff" opacity="0.7" />
        <ellipse cx="30" cy="15" rx="12" ry="6" fill="#fff" opacity="0.8" />
        <ellipse cx="30" cy="13" rx="6" ry="2.5" fill="#b3e0ff" opacity="0.9" />
        <circle cx="30" cy="15" r="2" fill="#fff" />
        <rect x="27" y="22" width="6" height="3" rx="1.5" fill="#b3e0ff" opacity="0.7" />
    </svg>
);

export default function SpaceBackground({ theme = 'dark' }) {
    const canvasRef = useRef(null);
    const ufoRef = useRef({ x: 0, y: 60, dx: 1.2 });

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        let animationFrameId;
        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener('resize', resize);
        // Increase number of stars for a denser starfield
        const stars = Array.from({ length: 300 }, () => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            r: Math.random() * 1.2 + 0.3,
            speed: Math.random() * 0.3 + 0.1,
        }));

        function drawStars() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.globalAlpha = 0.8;
            for (const star of stars) {
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.r, 0, 2 * Math.PI);
                ctx.fillStyle = theme === 'light' ? '#111' : '#fff';
                ctx.shadowColor = theme === 'light' ? '#000' : '#b3e0ff';
                ctx.shadowBlur = 8;
                ctx.fill();
                ctx.shadowBlur = 0;
                // Move star
                star.x += star.speed;
                if (star.x > canvas.width) star.x = 0;
            }
            ctx.restore();
        }

        function animate() {
            drawStars();
            animationFrameId = requestAnimationFrame(animate);
        }
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [theme]);

    // UFO stays pastel for both themes
    return (
        <>
            <canvas ref={canvasRef} style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 0,
                pointerEvents: 'none',
                background: theme === 'light'
                    ? 'radial-gradient(ellipse at 60% 40%, #fff 70%, #eaf6ff 100%)'
                    : 'radial-gradient(ellipse at 60% 40%, #0a183d 70%, #000 100%)',
                transition: 'background 0.5s',
            }} />
            <div style={{
                position: 'fixed',
                left: '50%',
                top: 80,
                transform: 'translateX(-50%)',
                zIndex: 1,
                pointerEvents: 'none',
            }}>
                <UFO />
            </div>
        </>
    );
}
