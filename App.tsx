
import React, { useState, useEffect, useCallback } from 'react';
import * as chrono from 'chrono-node';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useDebounce } from './hooks/useDebounce';
import { TIMESTAMP_FORMATS } from './constants';
import { TimestampSuggestion } from './types';
import { generateTimestampCode } from './utils/time';
import { Input } from './components/Input';
import { TimestampCard } from './components/TimestampCard';
import { Faq } from './components/Faq';
import { Footer } from './components/Footer';
import { ModeToggle } from './components/ModeToggle';
import { ReverseGenerator } from './components/ReverseGenerator';
import { ManualGenerator } from './components/ManualGenerator';
import { TimezoneGenerator } from './components/TimezoneGenerator';

type Mode = 'natural' | 'reverse' | 'manual' | 'timezone';

const App: React.FC = () => {
    const [input, setInput] = useState('');
    const [suggestions, setSuggestions] = useState<TimestampSuggestion[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const debouncedInput = useDebounce(input, 200);

    const [mode, setMode] = useState<Mode>('natural');

    useEffect(() => {
        // Reset state when mode changes
        setInput('');
        setSuggestions([]);
        setSelectedIndex(0);
        setCopiedIndex(null);
    }, [mode]);

    useEffect(() => {
        if (mode !== 'natural' || debouncedInput.trim() === '') {
            if (mode === 'natural') setSuggestions([]);
            return;
        }

        const results = chrono.parse(debouncedInput);
        if (results.length > 0) {
            const newSuggestions: TimestampSuggestion[] = [];
            const primaryResult = results[0];
            
            TIMESTAMP_FORMATS.forEach(format => {
                newSuggestions.push({
                    date: primaryResult.start.date(),
                    format: format,
                });
            });
            setSuggestions(newSuggestions);
        } else {
            setSuggestions([]);
        }
        setSelectedIndex(0);
    }, [debouncedInput, mode]);

    const handleCopy = useCallback((index: number) => {
        if (mode !== 'natural' || index < 0 || index >= suggestions.length) return;
        
        const suggestion = suggestions[index];
        const code = generateTimestampCode(suggestion.date, suggestion.format.char);
        navigator.clipboard.writeText(code);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 1500);
    }, [suggestions, mode]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (mode !== 'natural' || suggestions.length === 0) return;

        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
                break;
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
                break;
            case 'Enter':
                e.preventDefault();
                handleCopy(selectedIndex);
                break;
            default:
                break;
        }
    }, [suggestions.length, selectedIndex, handleCopy, mode]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);
    
    useEffect(() => {
        if (mode !== 'natural') return;
        const selectedElement = document.getElementById(`suggestion-${selectedIndex}`);
        if (selectedElement) {
            selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }, [selectedIndex, mode]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
            },
        },
    };

    const naturalGenerator = (
        <motion.div
            key="natural-generator"
            className="w-full flex flex-col items-center gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <div className="w-full relative">
                <Input value={input} onChange={(e) => setInput(e.target.value)} />
            </div>
            
            <AnimatePresence>
                {suggestions.length > 0 && (
                    <motion.div
                        className="w-full grid grid-cols-1 gap-3"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                    >
                        {suggestions.map((suggestion, index) => (
                            <TimestampCard
                                key={`${suggestion.format.char}-${suggestion.date.getTime()}`}
                                id={`suggestion-${index}`}
                                suggestion={suggestion}
                                isSelected={selectedIndex === index}
                                isCopied={copiedIndex === index}
                                onCopy={() => handleCopy(index)}
                                onMouseEnter={() => setSelectedIndex(index)}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );

    return (
        <div className="min-h-screen w-full flex flex-col items-center p-4 sm:p-6 lg:p-8 overflow-y-auto scroll-smooth">
            <main className="w-full max-w-2xl mx-auto flex flex-col items-center gap-6">
                <header className="text-center mt-12 mb-6">
                    <h1 className="text-4xl sm:text-5xl font-bold text-gray-100 tracking-tighter">
                        Discord Timestamp Generator
                    </h1>
                    <p className="mt-4 text-lg text-gray-400 max-w-xl">
                        A quick tool for creating and reversing Discord timestamps.
                    </p>
                </header>

                <LayoutGroup>
                    <ModeToggle mode={mode} onModeChange={setMode} />
                </LayoutGroup>

                <AnimatePresence mode="wait">
                    {mode === 'natural' ? naturalGenerator
                        : mode === 'manual' ? <ManualGenerator key="manual-generator" />
                        : mode === 'timezone' ? <TimezoneGenerator key="timezone-generator" />
                        : <ReverseGenerator key="reverse-generator" />}
                </AnimatePresence>
                
                <Faq mode={mode} />
            </main>
            <Footer />
        </div>
    );
};

export default App;
