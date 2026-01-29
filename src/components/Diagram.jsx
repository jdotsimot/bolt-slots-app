import React from 'react';

const Diagram = () => {
    return (
        <div className="diagram-container">
            <svg width="400" height="200" viewBox="0 0 400 200">
                {/* Parallel Outline */}
                <rect x="50" y="50" width="300" height="100" fill="none" stroke="#8b949e" strokeWidth="2" />

                {/* Slot Outline (Right side) */}
                <path d="M 350 85 L 280 85 A 15 15 0 0 0 280 115 L 350 115" fill="none" stroke="#00e5ff" strokeWidth="2" />

                {/* Dimension Line for Slot Length */}
                <line x1="350" y1="30" x2="280" y2="30" stroke="#00e5ff" strokeWidth="1" />
                <line x1="350" y1="25" x2="350" y2="35" stroke="#00e5ff" strokeWidth="1" />
                <line x1="280" y1="25" x2="280" y2="35" stroke="#00e5ff" strokeWidth="1" />

                {/* Arrowheads */}
                <path d="M 350 30 L 345 27 M 350 30 L 345 33" stroke="#00e5ff" strokeWidth="1" fill="none" />
                <path d="M 280 30 L 285 27 M 280 30 L 285 33" stroke="#00e5ff" strokeWidth="1" fill="none" />

                <text x="315" y="20" fill="#00e5ff" fontSize="12" textAnchor="middle">Slot Length</text>
                <text x="200" y="170" fill="#8b949e" fontSize="12" textAnchor="middle">Measurement: Rail edge to flat end (excluding radius)</text>

                {/* X Axis Centerline */}
                <line x1="200" y1="40" x2="200" y2="160" stroke="#8b949e" strokeWidth="1" strokeDasharray="5,5" />
                <text x="200" y="185" fill="#8b949e" fontSize="10" textAnchor="middle">WCS X0 (Center)</text>
            </svg>
        </div>
    );
};

export default Diagram;
