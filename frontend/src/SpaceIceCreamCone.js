import React from "react";

// SVG: Space Ice Cream Cone (with pastel scoops and a star)
export default function SpaceIceCreamCone() {
    return (
        <div className="space-icecream-cone">
            <svg width="90" height="140" viewBox="0 0 90 140" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Cone */}
                <polygon points="45,120 20,60 70,60" fill="#f7c08a" className="icecream-cone" stroke="#e6a96b" strokeWidth="2" />
                {/* Waffle lines */}
                <line x1="32" y1="80" x2="58" y2="110" stroke="#e6a96b" strokeWidth="2" />
                <line x1="58" y1="80" x2="32" y2="110" stroke="#e6a96b" strokeWidth="2" />
                {/* Scoops */}
                <ellipse cx="45" cy="60" rx="25" ry="18" fill="#ffe0ec" className="icecream-pink" />
                <ellipse cx="45" cy="45" rx="22" ry="15" fill="#b3e0ff" className="icecream-blue" />
                <ellipse cx="45" cy="32" rx="18" ry="12" fill="#baffd9" className="icecream-mint" />
                {/* Sprinkles */}
                <circle cx="35" cy="55" r="2" fill="#b3e0ff" />
                <circle cx="55" cy="65" r="2" fill="#baffd9" />
                <circle cx="50" cy="40" r="1.5" fill="#ffe0ec" />
                <circle cx="40" cy="38" r="1.5" fill="#ffe0ec" />
                {/* Space star */}
                <polygon points="45,18 47,25 54,25 48.5,29 50.5,36 45,32 39.5,36 41.5,29 36,25 43,25" fill="#fff7b3" stroke="#ffe0ec" strokeWidth="0.7" />
            </svg>
        </div>
    );
}
