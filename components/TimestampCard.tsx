
import React from 'react';
import { motion } from 'framer-motion';
import { Clipboard, Check } from 'lucide-react';
import { TimestampSuggestion } from '../types';
import { generateTimestampCode, generatePreview } from '../utils/time';

interface TimestampCardProps {
    id: string;
    suggestion: TimestampSuggestion;
    isSelected: boolean;
    isCopied: boolean;
    onCopy: () => void;
    onMouseEnter: () => void;
}

export const TimestampCard: React.FC<TimestampCardProps> = ({ id, suggestion, isSelected, isCopied, onCopy, onMouseEnter }) => {
    const { date, format } = suggestion;
    const code = generateTimestampCode(date, format.char);
    const preview = generatePreview(date, format.char);

    const cardVariants = {
        hidden: { opacity: 0, y: 20, scale: 0.98 },
        visible: { opacity: 1, y: 0, scale: 1 },
    };

    return (
        <motion.div
            id={id}
            variants={cardVariants}
            className={`relative w-full p-4 rounded-2xl cursor-pointer transition-all duration-200 ease-in-out transform-gpu ${isSelected ? 'bg-zinc-700/80 ring-2 ring-blue-500/80 shadow-2xl' : 'bg-zinc-800/90'}`}
            onClick={onCopy}
            onMouseEnter={onMouseEnter}
            whileHover={{ y: -4, scale: 1.02, shadow: '0 10px 20px rgba(0,0,0,0.3)' }}
            whileTap={{ scale: 0.98, y: 0 }}
            style={{ perspective: '1000px' }}
        >
            <div className="flex justify-between items-center gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-3">
                        <p className="font-bold text-gray-100 text-lg">{format.name}</p>
                        <p className="text-gray-400 truncate text-sm">{preview}</p>
                    </div>
                    <p className="font-mono text-blue-400 text-sm mt-1 truncate">{code}</p>
                </div>
                <div className="flex-shrink-0">
                     <motion.div
                        className="p-2 rounded-full"
                        animate={{ background: isCopied ? 'rgba(74, 222, 128, 0.2)' : 'rgba(255, 255, 255, 0)' }}
                     >
                        {isCopied ? (
                            <Check className="text-green-400 h-6 w-6" />
                        ) : (
                            <Clipboard className={`h-6 w-6 ${isSelected ? 'text-blue-400' : 'text-gray-500'}`} />
                        )}
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};
