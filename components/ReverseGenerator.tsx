
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from './Input';
import { parseTimestampCode } from '../utils/time';
import moment from 'moment';

export const ReverseGenerator: React.FC = () => {
    const [input, setInput] = useState('');
    
    const { resultDate, error } = useMemo(() => {
        if (input.trim() === '') {
            return { resultDate: null, error: null };
        }
        const date = parseTimestampCode(input);
        if (date) {
            return { resultDate: date, error: null };
        } else {
            return { resultDate: null, error: 'Invalid Discord timestamp format.' };
        }
    }, [input]);

    const displayFormats = useMemo(() => {
        if (!resultDate) return [];
        const m = moment(resultDate);
        return [
            { label: 'Local Time', value: m.format('dddd, D MMMM YYYY [at] HH:mm:ss') },
            { label: 'UTC Time', value: m.utc().format('dddd, D MMMM YYYY [at] HH:mm:ss [UTC]') },
            { label: 'Relative', value: m.fromNow() },
        ];
    }, [resultDate]);


    return (
        <motion.div 
            className="w-full flex flex-col items-center gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <div className="w-full relative">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="e.g. <t:1672531200:F>"
                />
            </div>

            <AnimatePresence>
                {(resultDate || (error && input.length > 0)) && (
                     <motion.div
                        className="w-full p-6 bg-zinc-800 rounded-2xl"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                     >
                        {error && input.length > 0 ? (
                            <p className="text-red-400 text-center">{error}</p>
                        ) : (
                            resultDate && (
                                <div className="flex flex-col gap-3">
                                    <h3 className="text-lg font-bold text-gray-100 text-center mb-2">Converted Timestamp</h3>
                                    {displayFormats.map(format => (
                                        <div key={format.label} className="flex justify-between items-baseline p-3 bg-zinc-700/50 rounded-lg">
                                            <span className="text-sm font-medium text-gray-400">{format.label}</span>
                                            <span className="text-base text-gray-100 text-right font-mono">{format.value}</span>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}
                     </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
