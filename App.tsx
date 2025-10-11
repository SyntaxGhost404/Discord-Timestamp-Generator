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

    const preprocessInput = (text: string): string => {
        let processedText = text.trim();
    
        // 1. Shorthands (case-insensitive)
        const lowerCaseText = processedText.toLowerCase();
        if (lowerCaseText === 'tom') {
            return 'tomorrow';
        }
        
        // 2. Dates with dots -> dates with slashes
        // Full date: 10.20.2025 -> 10/20/2025
        processedText = processedText.replace(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})$/, '$1/$2/$3');
        // Short date: 10.20 -> 10/20
        processedText = processedText.replace(/^(\d{1,2})\.(\d{1,2})$/, '$1/$2');
    
        // 3. Lone numbers as hours
        // Just a number: "10" -> "10:00"
        if (/^\d{1,2}$/.test(processedText)) {
            return `${processedText}:00`;
        }
    
        // Ends with space and number: "10/20 1" -> "10/20 1:00"
        // Avoids changing durations like "in 1 hour"
        const match = processedText.match(/^(.*\s)(\d{1,2})$/);
        if (match) {
            const preceding = match[1].trim().toLowerCase();
            const durationKeywords = ['in', 'ago', 'hour', 'hours', 'minute', 'minutes', 'day', 'days', 'week', 'weeks', 'month', 'months', 'year', 'years', 'hr', 'min', 'sec'];
            if (!durationKeywords.some(kw => preceding.endsWith(kw))) {
                return `${match[1]}${match[2]}:00`;
            }
        }
    
        return processedText;
    };

    useEffect(() => {
        if (mode !== 'natural' || debouncedInput.trim() === '') {
            if (mode === 'natural') setSuggestions([]);
            return;
        }

        const processedInput = preprocessInput(debouncedInput);
        const results = chrono.parse(processedInput);
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
                        Create, convert, and reverse Discord timestamps using natural language, a manual picker, or timezone conversion.
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
