
import React from 'react';
import { motion } from 'framer-motion';

type Mode = 'natural' | 'reverse' | 'manual';

interface ModeToggleProps {
    mode: Mode;
    onModeChange: (mode: Mode) => void;
}

export const ModeToggle: React.FC<ModeToggleProps> = ({ mode, onModeChange }) => {
    const modes: { id: Mode, label: string }[] = [
        { id: 'natural', label: 'Natural' },
        { id: 'manual', label: 'Manual' },
        { id: 'reverse', label: 'Reverse' },
    ];

    return (
        <div className="flex p-1 bg-zinc-800 rounded-full border border-zinc-700/50">
            {modes.map((m) => (
                <button
                    key={m.id}
                    onClick={() => onModeChange(m.id)}
                    className={`relative px-6 py-2 text-sm font-medium rounded-full transition-colors ${
                        mode === m.id ? 'text-gray-100' : 'text-gray-400 hover:text-gray-200'
                    }`}
                >
                    {mode === m.id && (
                        <motion.div
                            layoutId="active-mode-pill"
                            className="absolute inset-0 bg-zinc-700 rounded-full"
                            style={{ borderRadius: 9999 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                    )}
                    <span className="relative z-10">{m.label}</span>
                </button>
            ))}
        </div>
    );
};
