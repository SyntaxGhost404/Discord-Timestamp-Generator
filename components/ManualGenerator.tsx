
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';
import { TIMESTAMP_FORMATS } from '../constants';
import { TimestampCard } from './TimestampCard';
import { TimestampSuggestion } from '../types';
import { generateTimestampCode } from '../utils/time';
import { RotateCw, ChevronLeft, ChevronRight } from 'lucide-react';

export const ManualGenerator: React.FC = () => {
    const [selectedDate, setSelectedDate] = useState(() => new Date());
    const [viewDate, setViewDate] = useState(() => new Date());
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const [hour, setHour] = useState(() => String(selectedDate.getHours()).padStart(2, '0'));
    const [minute, setMinute] = useState(() => String(selectedDate.getMinutes()).padStart(2, '0'));
    const [second, setSecond] = useState(() => String(selectedDate.getSeconds()).padStart(2, '0'));

    useEffect(() => {
        const newDate = new Date(selectedDate);
        let updated = false;
        
        const h = parseInt(hour, 10);
        if (!isNaN(h) && newDate.getHours() !== h) {
            newDate.setHours(h);
            updated = true;
        }

        const m = parseInt(minute, 10);
        if (!isNaN(m) && newDate.getMinutes() !== m) {
            newDate.setMinutes(m);
            updated = true;
        }

        const s = parseInt(second, 10);
        if (!isNaN(s) && newDate.getSeconds() !== s) {
            newDate.setSeconds(s);
            updated = true;
        }

        if (updated) {
            setSelectedDate(newDate);
        }
    }, [hour, minute, second, selectedDate]);

    const handleDateSelect = (day: number) => {
        const newDate = new Date(viewDate);
        newDate.setDate(day);
        newDate.setHours(parseInt(hour, 10) || 0);
        newDate.setMinutes(parseInt(minute, 10) || 0);
        newDate.setSeconds(parseInt(second, 10) || 0);
        setSelectedDate(newDate);
        setViewDate(newDate);
    };

    const handleTimeChange = (setter: React.Dispatch<React.SetStateAction<string>>, max: number, value: string) => {
        if (value === '' || (/^\d+$/.test(value) && parseInt(value, 10) >= 0 && parseInt(value, 10) <= max)) {
            setter(value);
        }
    };
    
    const handleTimeBlur = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
        if (value !== '') {
            setter(String(value).padStart(2, '0'));
        }
    };

    const setToCurrentTime = useCallback(() => {
        const now = new Date();
        setSelectedDate(now);
        setViewDate(now);
        setHour(String(now.getHours()).padStart(2, '0'));
        setMinute(String(now.getMinutes()).padStart(2, '0'));
        setSecond(String(now.getSeconds()).padStart(2, '0'));
    }, []);

    const calendarData = useMemo(() => {
        const m = moment(viewDate);
        const firstDayOfMonth = m.clone().startOf('month').day();
        const daysInMonth = m.daysInMonth();
        
        const days = [];
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(null);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i);
        }
        return {
            monthName: m.format('MMMM'),
            year: m.year(),
            days,
        };
    }, [viewDate]);
    
    const changeMonth = (amount: number) => {
        setViewDate(moment(viewDate).add(amount, 'months').toDate());
    };

    const changeYear = (amount: number) => {
        setViewDate(moment(viewDate).add(amount, 'years').toDate());
    };

    const suggestions: TimestampSuggestion[] = useMemo(() => 
        TIMESTAMP_FORMATS.map(format => ({
            date: selectedDate,
            format,
        })), [selectedDate]);

    const handleCopy = useCallback((index: number) => {
        if (index < 0 || index >= suggestions.length) return;
        const suggestion = suggestions[index];
        const code = generateTimestampCode(suggestion.date, suggestion.format.char);
        navigator.clipboard.writeText(code);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 1500);
    }, [suggestions]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
            },
        },
    };

    const renderCalendar = () => (
        <div className="p-4 bg-zinc-800 rounded-2xl w-full">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-1">
                    <button onClick={() => changeYear(-1)} className="p-2 rounded-full hover:bg-zinc-700 transition-colors flex items-center" aria-label="Previous year">
                        <ChevronLeft size={16} />
                        <ChevronLeft size={16} className="-ml-3" />
                    </button>
                    <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-zinc-700 transition-colors" aria-label="Previous month"><ChevronLeft size={20} /></button>
                </div>
                <div className="text-center">
                    <p className="font-bold text-lg text-gray-100">{calendarData.monthName} {calendarData.year}</p>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-zinc-700 transition-colors" aria-label="Next month"><ChevronRight size={20} /></button>
                     <button onClick={() => changeYear(1)} className="p-2 rounded-full hover:bg-zinc-700 transition-colors flex items-center" aria-label="Next year">
                        <ChevronRight size={16} className="-mr-3" />
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-2">
                {moment.weekdaysMin().map((day, i) => <div key={i} aria-hidden="true">{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {calendarData.days.map((day, i) => {
                    if (!day) return <div key={`empty-${i}`} />;
                    
                    const dayMoment = moment(viewDate).date(day);
                    const isToday = moment().isSame(dayMoment, 'day');
                    const isSelected = moment(selectedDate).isSame(dayMoment, 'day');

                    return (
                        <button 
                            key={day} 
                            onClick={() => handleDateSelect(day)}
                            className={`
                                w-full aspect-square rounded-full text-sm transition-all duration-200
                                ${isSelected ? 'bg-blue-500 text-white font-bold ring-2 ring-blue-400 shadow-lg' : ''}
                                ${!isSelected && isToday ? 'ring-2 ring-blue-500/50' : ''}
                                ${!isSelected ? 'hover:bg-zinc-700' : ''}
                            `}
                        >
                            {day}
                        </button>
                    )
                })}
            </div>
        </div>
    );
    
    return (
         <motion.div
            className="w-full flex flex-col items-center gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <div className="w-full flex flex-col md:flex-row gap-6 items-start">
                <div className="w-full md:w-[55%] lg:w-1/2">
                    {renderCalendar()}
                </div>
                <div className="w-full md:w-[45%] lg:w-1/2 flex flex-col gap-4">
                    <div className="p-4 bg-zinc-800 rounded-2xl">
                        <label htmlFor="hour-input" className="text-sm font-medium text-gray-400 mb-2 block">Time (24h)</label>
                        <div className="flex items-center gap-2">
                            <input id="hour-input" aria-label="Hour" type="text" value={hour} onChange={e => handleTimeChange(setHour, 23, e.target.value)} onBlur={e => handleTimeBlur(setHour, e.target.value)} className="w-full p-3 bg-zinc-700 rounded-lg text-center font-mono text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" />
                            <span className="font-bold text-lg text-gray-500" aria-hidden="true">:</span>
                            <input aria-label="Minute" type="text" value={minute} onChange={e => handleTimeChange(setMinute, 59, e.target.value)} onBlur={e => handleTimeBlur(setMinute, e.target.value)} className="w-full p-3 bg-zinc-700 rounded-lg text-center font-mono text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" />
                            <span className="font-bold text-lg text-gray-500" aria-hidden="true">:</span>
                            <input aria-label="Second" type="text" value={second} onChange={e => handleTimeChange(setSecond, 59, e.target.value)} onBlur={e => handleTimeBlur(setSecond, e.target.value)} className="w-full p-3 bg-zinc-700 rounded-lg text-center font-mono text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" />
                        </div>
                    </div>
                    <button 
                        onClick={setToCurrentTime}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-zinc-700 hover:bg-zinc-600 rounded-xl text-lg text-gray-100 transition-colors duration-200"
                    >
                        <RotateCw size={18} /> Set to Current Time
                    </button>
                </div>
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
                                id={`manual-suggestion-${index}`}
                                suggestion={suggestion}
                                isSelected={false}
                                isCopied={copiedIndex === index}
                                onCopy={() => handleCopy(index)}
                                onMouseEnter={() => {}}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
