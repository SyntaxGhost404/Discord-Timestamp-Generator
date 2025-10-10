
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input: React.FC<InputProps> = (props) => {
    return (
        <input
            type="text"
            placeholder="Give a date or time..."
            className="w-full px-6 py-4 bg-zinc-800 border-2 border-zinc-700 rounded-2xl text-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 shadow-lg"
            autoFocus
            {...props}
        />
    );
};
