
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';
import { TIMESTAMP_FORMATS } from '../constants';
import { TimestampCard } from './TimestampCard';
import { TimeApiResponse, TimestampSuggestion } from '../types';
import { generateTimestampCode } from '../utils/time';
import { useDebounce } from '../hooks/useDebounce';
import { RotateCw, ChevronLeft, ChevronRight, Loader2, AlertTriangle, ArrowRightLeft } from 'lucide-react';

const TIME_API_BASE = 'https://timeapi.io/api';

const TimezoneInput: React.FC<{
    id: string;
    value: string;
    onChange: (value: string) => void;
    timezones: string[];
    label: string;
}> = ({ id, value, onChange, timezones, label }) => (
    <div className="w-full">
        <label htmlFor={id} className="text-sm font-medium text-gray-400 mb-2 block">{label}</label>
        <input
            id={id}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            list={`${id}-list`}
            className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/80 focus:border-blue-500 transition-all duration-200"
            placeholder="Search timezone..."
        />
        <datalist id={`${id}-list`}>
            {timezones.map(tz => <option key={tz} value={tz} />)}
        </datalist>
    </div>
);

export const TimezoneGenerator: React.FC = () => {
    const [selectedDate, setSelectedDate] = useState(() => new Date());
    const [viewDate, setViewDate] = useState(() => new Date());
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const [hour, setHour] = useState(() => String(selectedDate.getHours()).padStart(2, '0'));
    const [minute, setMinute] = useState(() => String(selectedDate.getMinutes()).padStart(2, '0'));
    const [second, setSecond] = useState(() => String(selectedDate.getSeconds()).padStart(2, '0'));

    const [timezones, setTimezones] = useState<string[]>([]);
    const [fromTimezone, setFromTimezone] = useState('');
    const [toTimezone, setToTimezone] = useState('UTC');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [conversionResult, setConversionResult] = useState<TimeApiResponse | null>(null);

    const debouncedDate = useDebounce(selectedDate, 500);
    const debouncedFromTz = useDebounce(fromTimezone, 500);
    const debouncedToTz = useDebounce(toTimezone, 500);

    useEffect(() => {
        const fetchTimezones = async () => {
            try {
                const res = await fetch(`${TIME_API_BASE}/timezone/availabletimezones`);
                if (!res.ok) throw new Error('Failed to fetch timezones');
                const data: string[] = await res.json();
                setTimezones(data);
                const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
                if (data.includes(userTz)) {
                    setFromTimezone(userTz);
                } else {
                    setFromTimezone('UTC');
                }
            } catch (err) {
                setError('Could not load timezone list.');
            }
        };
        fetchTimezones();
    }, []);

    useEffect(() => {
        const performConversion = async () => {
            if (!debouncedFromTz || !debouncedToTz || !timezones.includes(debouncedFromTz) || !timezones.includes(debouncedToTz)) {
                setConversionResult(null);
                return;
            }
            setLoading(true);
            setError(null);
            try {
                const formattedDateTime = moment(debouncedDate).format('YYYY-MM-DD HH:mm:ss');
                const res = await fetch(`${TIME_API_BASE}/conversion/converttimezone`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        fromTimeZone: debouncedFromTz,
                        toTimeZone: debouncedToTz,
                        dateTime: formattedDateTime,
                        dstAmbiguity: "",
                    }),
                });
                if (!res.ok) {
                     const errorText = await res.text();
                     throw new Error(errorText || 'Conversion request failed');
                }
                const data: TimeApiResponse = await res.json();
                setConversionResult(data);
            } catch (err: any) {
                setError(err.message || 'An unknown error occurred.');
                setConversionResult(null);
            } finally {
                setLoading(false);
            }
        };

        if(fromTimezone && toTimezone && timezones.length > 0) {
           performConversion();
        }
    }, [debouncedDate, debouncedFromTz, debouncedToTz, timezones]);

    useEffect(() => {
        const newDate = new Date(selectedDate);
        let updated = false;
        
        const h = parseInt(hour, 10);
        if (!isNaN(h) && newDate.getHours() !== h) { newDate.setHours(h); updated = true; }

        const m = parseInt(minute, 10);
        if (!isNaN(m) && newDate.getMinutes() !== m) { newDate.setMinutes(m); updated = true; }

        const s = parseInt(second, 10);
        if (!isNaN(s) && newDate.getSeconds() !== s) { newDate.setSeconds(s); updated = true; }

        if (updated) setSelectedDate(newDate);
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
        if (value === '' || (/^\d+$/.test(value) && parseInt(value, 10) >= 0 && parseInt(value, 10) <= max)) setter(value);
    };
    
    const handleTimeBlur = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
        if (value !== '') setter(String(value).padStart(2, '0'));
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
        return {
            monthName: m.format('MMMM'),
            year: m.year(),
            days: Array.from({ length: m.clone().startOf('month').day() }, () => null)
                       .concat(Array.from({ length: m.daysInMonth() }, (_, i) => i + 1)),
        };
    }, [viewDate]);
    
    const changeMonth = (amount: number) => setViewDate(moment(viewDate).add(amount, 'months').toDate());
    const changeYear = (amount: number) => setViewDate(moment(viewDate).add(amount, 'years').toDate());

    const suggestions: TimestampSuggestion[] = useMemo(() => {
        if (!conversionResult) return [];
        const convertedDate = new Date(conversionResult.conversionResult.dateTime);
        return TIMESTAMP_FORMATS.map(format => ({ date: convertedDate, format }));
    }, [conversionResult]);

    const handleCopy = useCallback((index: number) => {
        if (index < 0 || index >= suggestions.length) return;
        const suggestion = suggestions[index];
        const code = generateTimestampCode(suggestion.date, suggestion.format.char);
        navigator.clipboard.writeText(code);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 1500);
    }, [suggestions]);

    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };

    const renderCalendar = () => (
        <div className="p-4 bg-zinc-800 rounded-2xl w-full">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-1">
                    <button onClick={() => changeYear(-1)} className="p-2 rounded-full hover:bg-zinc-700 transition-colors flex items-center" aria-label="Previous year"><ChevronLeft size={16} /><ChevronLeft size={16} className="-ml-3" /></button>
                    <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-zinc-700 transition-colors" aria-label="Previous month"><ChevronLeft size={20} /></button>
                </div>
                <div className="text-center"><p className="font-bold text-lg text-gray-100">{calendarData.monthName} {calendarData.year}</p></div>
                <div className="flex items-center gap-1">
                    <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-zinc-700 transition-colors" aria-label="Next month"><ChevronRight size={20} /></button>
                    <button onClick={() => changeYear(1)} className="p-2 rounded-full hover:bg-zinc-700 transition-colors flex items-center" aria-label="Next year"><ChevronRight size={16} className="-mr-3" /><ChevronRight size={16} /></button>
                </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-2">{moment.weekdaysMin().map((day, i) => <div key={i} aria-hidden="true">{day}</div>)}</div>
            <div className="grid grid-cols-7 gap-1">
                {calendarData.days.map((day, i) => {
                    if (!day) return <div key={`empty-${i}`} />;
                    const dayMoment = moment(viewDate).date(day);
                    const isToday = moment().isSame(dayMoment, 'day');
                    const isSelected = moment(selectedDate).isSame(dayMoment, 'day');
                    return <button key={day} onClick={() => handleDateSelect(day)} className={`w-full aspect-square rounded-full text-sm transition-all duration-200 ${isSelected ? 'bg-blue-500 text-white font-bold ring-2 ring-blue-400 shadow-lg' : ''} ${!isSelected && isToday ? 'ring-2 ring-blue-500/50' : ''} ${!isSelected ? 'hover:bg-zinc-700' : ''}`}>{day}</button>
                })}
            </div>
        </div>
    );
    
    return (
         <motion.div className="w-full flex flex-col items-center gap-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            <div className="w-full flex flex-col md:flex-row gap-6 items-start">
                <div className="w-full md:w-1/2 flex flex-col gap-4">
                    {renderCalendar()}
                </div>
                <div className="w-full md:w-1/2 flex flex-col gap-4">
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
                    <div className="p-4 bg-zinc-800 rounded-2xl flex flex-col gap-4">
                         <TimezoneInput id="from-tz" label="From Timezone" value={fromTimezone} onChange={setFromTimezone} timezones={timezones} />
                         <button onClick={() => { setFromTimezone(toTimezone); setToTimezone(fromTimezone); }} className="p-2 self-center rounded-full hover:bg-zinc-700 transition-colors" aria-label="Swap timezones"><ArrowRightLeft size={18} /></button>
                         <TimezoneInput id="to-tz" label="To Timezone" value={toTimezone} onChange={setToTimezone} timezones={timezones} />
                    </div>
                    <button onClick={setToCurrentTime} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-zinc-700 hover:bg-zinc-600 rounded-xl text-lg text-gray-100 transition-colors duration-200"><RotateCw size={18} /> Set to Current Time</button>
                </div>
            </div>

            <div className="w-full">
                <AnimatePresence mode="wait">
                    {loading && <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center items-center gap-3 p-6 bg-zinc-800 rounded-2xl"><Loader2 className="animate-spin" /> <span className="text-gray-300">Converting...</span></motion.div>}
                    {error && <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center items-center gap-3 p-6 bg-red-900/50 text-red-300 rounded-2xl"><AlertTriangle /> <span>{error}</span></motion.div>}
                    {conversionResult && !loading && !error && (
                        <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full flex flex-col gap-4">
                            <div className="p-4 bg-zinc-800 rounded-2xl">
                                <h3 className="text-lg font-bold text-gray-100 text-center mb-4">Conversion Result</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                                    <div>
                                        <p className="text-sm text-gray-400 font-medium">Source Time</p>
                                        <p className="text-2xl font-mono text-gray-100">{moment(selectedDate).format('HH:mm:ss')}</p>
                                        <p className="text-sm text-gray-300">{moment(selectedDate).format('D MMM YYYY')}</p>
                                        <p className="text-xs text-gray-500 truncate">{fromTimezone}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400 font-medium">Target Time</p>
                                        <p className="text-2xl font-mono text-blue-400">{conversionResult.conversionResult.time}</p>
                                        <p className="text-sm text-gray-300">{moment(new Date(conversionResult.conversionResult.dateTime)).format('D MMM YYYY')}</p>
                                        <p className="text-xs text-gray-500 truncate">{toTimezone}</p>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-zinc-700 text-center">
                                     <p className="text-sm text-gray-400 font-medium">Unix Timestamp</p>
                                     <p className="text-lg font-mono text-gray-100">{Math.floor(new Date(conversionResult.conversionResult.dateTime).getTime() / 1000)}</p>
                                </div>
                            </div>
                             <motion.div className="w-full grid grid-cols-1 gap-3" variants={containerVariants} initial="hidden" animate="visible" exit="hidden">
                                {suggestions.map((suggestion, index) => (
                                    <TimestampCard key={`${suggestion.format.char}-${suggestion.date.getTime()}`} id={`tz-suggestion-${index}`} suggestion={suggestion} isSelected={false} isCopied={copiedIndex === index} onCopy={() => handleCopy(index)} onMouseEnter={() => {}} />
                                ))}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};
