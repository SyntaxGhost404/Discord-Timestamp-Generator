import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { FileText, Type, Gauge, Save, Pilcrow, Copy, Check, CaseUpper, CaseLower, Trash2, X, CheckCircle2, ArrowUpRight, Undo2, Redo2, HelpCircle, ChevronDown, Smartphone, Zap } from 'lucide-react';
import { Footer } from './components/Footer';
import { SavedEntry } from './types';

// --- DATABASE UTILITY ---
// Simple IndexedDB wrapper with LocalStorage fallback.
const DB_NAME = 'WordCounterDB';
const STORE_NAME = 'entries';
const DB_VERSION = 2;

let dbPromise: Promise<IDBDatabase> | null = null;
const isIDBAvailable = typeof window !== 'undefined' && !!window.indexedDB;

const initDB = (): Promise<IDBDatabase> => {
    if (!isIDBAvailable) {
        return Promise.reject('IndexedDB not available');
    }
    if (dbPromise) {
        return dbPromise;
    }
    dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains('history_meta')) {
                db.createObjectStore('history_meta', { keyPath: 'id' });
            }
        };
    });
    return dbPromise;
};

const storage = {
    async saveEntry(entry: Omit<SavedEntry, 'id'>): Promise<void> {
        if (isIDBAvailable) {
            const db = await initDB();
            const tx = db.transaction(STORE_NAME, 'readwrite');
            tx.objectStore(STORE_NAME).add(entry);
            await new Promise(resolve => tx.oncomplete = resolve);
        } else {
            const entries = await this.getEntries();
            const newEntry = { ...entry, id: Date.now() };
            localStorage.setItem(STORE_NAME, JSON.stringify([...entries, newEntry]));
        }
    },
    async getEntries(): Promise<SavedEntry[]> {
        if (isIDBAvailable) {
            try {
                const db = await initDB();
                const tx = db.transaction(STORE_NAME, 'readonly');
                const store = tx.objectStore(STORE_NAME);
                const entries: SavedEntry[] = await new Promise((resolve, reject) => {
                    const req = store.getAll();
                    req.onsuccess = () => resolve(req.result);
                    req.onerror = () => reject(req.error);
                });
                return entries.sort((a, b) => b.savedAt - a.savedAt);
            } catch (error) {
                 console.error("Failed to get entries from IndexedDB:", error);
                 return [];
            }
        } else {
            const entriesJSON = localStorage.getItem(STORE_NAME);
            return entriesJSON ? JSON.parse(entriesJSON).sort((a, b) => b.savedAt - a.savedAt) : [];
        }
    },
    async deleteEntry(id: number): Promise<void> {
        if (isIDBAvailable) {
            const db = await initDB();
            const tx = db.transaction(STORE_NAME, 'readwrite');
            tx.objectStore(STORE_NAME).delete(id);
            await new Promise(resolve => tx.oncomplete = resolve);
        } else {
            const entriesJSON = localStorage.getItem(STORE_NAME);
            if (entriesJSON) {
                const entries: SavedEntry[] = JSON.parse(entriesJSON);
                const newEntries = entries.filter(entry => entry.id !== id);
                localStorage.setItem(STORE_NAME, JSON.stringify(newEntries));
            }
        }
    },
    async updateEntry(entry: SavedEntry): Promise<void> {
        if (isIDBAvailable) {
            const db = await initDB();
            const tx = db.transaction(STORE_NAME, 'readwrite');
            tx.objectStore(STORE_NAME).put(entry);
            await new Promise(resolve => tx.oncomplete = resolve);
        } else {
            const entries = await this.getEntries();
            const newEntries = entries.map(e => e.id === entry.id ? entry : e);
            localStorage.setItem(STORE_NAME, JSON.stringify(newEntries));
        }
    },
};

// --- HELPER FUNCTIONS ---
const useBodyScrollLock = (isLocked: boolean) => {
    useEffect(() => {
        if (isLocked) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isLocked]);
};
const countWords = (text: string) => text.trim() ? text.trim().split(/\s+/).length : 0;
const countSentences = (text: string) => text.trim() ? (text.match(/[.!?]+(?:\s|$)/g) || []).length : 0;
const countParagraphs = (text: string) => text.trim() ? text.split(/\n\s*\n/).filter(Boolean).length : 0;

// --- UI COMPONENTS (Defined within App for simplicity) ---
const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: number | string }> = ({ icon, label, value }) => (
    <motion.div layout className="bg-[#1A1A1A] p-4 rounded-xl flex items-center gap-4 border border-[#333333]">
        <div className="text-2xl">{icon}</div>
        <motion.div layout="position">
            <p className="text-xs font-medium text-[#999999] uppercase">{label}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </motion.div>
    </motion.div>
);

const TabToggle: React.FC<{ activeTab: string; onTabChange: (tab: 'counter' | 'saved' | 'help') => void; }> = ({ activeTab, onTabChange }) => {
    const tabs = [
        { id: 'counter', label: 'Counter' },
        { id: 'saved', label: 'Saved Entries' },
        { id: 'help', label: <HelpCircle size={18} />, isIcon: true }
    ];
    return (
        <div className="flex p-1 bg-[#1A1A1A] rounded-full border border-[#444444]">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id as 'counter' | 'saved' | 'help')}
                    className={`relative px-4 sm:px-6 py-2 text-sm sm:text-base font-medium rounded-full transition-colors focus:outline-none flex items-center justify-center ${tab.isIcon ? 'px-3 sm:px-4' : ''}`}
                    aria-label={tab.id === 'help' ? 'Help & FAQ' : undefined}
                >
                    {activeTab === tab.id && (
                        <motion.div
                            layoutId="active-tab-pill"
                            className="absolute inset-0 bg-[#333333] rounded-full"
                            style={{ borderRadius: 9999 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                    )}
                    <span className={`relative z-10 transition-colors flex items-center justify-center ${activeTab === tab.id ? 'text-white' : 'text-[#999999] hover:text-[#BBBBBB]'}`}>{tab.label}</span>
                </button>
            ))}
        </div>
    );
};

const ConfirmationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}> = ({ isOpen, onClose, onConfirm }) => {
    useBodyScrollLock(isOpen);
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 30 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        className="relative bg-[#1A1A1A] w-full max-w-md m-4 p-6 rounded-2xl border border-[#333333] shadow-2xl"
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                    >
                         <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full text-[#999999] hover:bg-[#222222] transition-colors" aria-label="Close modal">
                            <X size={20} />
                        </button>
                        <h2 className="text-2xl font-bold text-white">Confirm Deletion</h2>
                        <p className="mt-3 text-[#CCCCCC]">
                            Are you sure you want to permanently delete this saved entry? This action cannot be undone.
                        </p>
                        <div className="mt-6 flex justify-end gap-4">
                            <button
                                onClick={onClose}
                                className="px-5 py-2.5 rounded-lg bg-[#222222] border border-[#444444] text-[#CCCCCC] font-medium hover:bg-[#333333] transition-colors focus:outline-none"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onConfirm}
                                className="px-5 py-2.5 rounded-lg bg-red-900/50 border border-red-800 text-red-200 font-medium hover:bg-red-900/80 transition-colors focus:outline-none"
                            >
                                Delete
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const SuccessModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
}> = ({ isOpen, onClose, title, message }) => {
    useBodyScrollLock(isOpen);
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 30 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        className="relative bg-[#1A1A1A] w-full max-w-md m-4 p-6 rounded-2xl border border-[#333333] shadow-2xl text-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-center mb-4">
                             <CheckCircle2 size={48} className="text-[#CCCCCC]" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">{title}</h2>
                        <p className="mt-3 text-[#CCCCCC]">
                            {message}
                        </p>
                        <div className="mt-6 flex justify-center">
                            <button
                                onClick={onClose}
                                className="px-8 py-2.5 rounded-lg bg-gradient-to-r from-[#444444] to-[#4A4A4A] border border-[#555555] text-white font-medium hover:from-[#4A4A4A] hover:to-[#555555] transition-colors focus:outline-none shadow-sm"
                            >
                                Got it!
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};


const LoadModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}> = ({ isOpen, onClose, onConfirm }) => {
    useBodyScrollLock(isOpen);
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 30 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        className="relative bg-[#1A1A1A] w-full max-w-md m-4 p-6 rounded-2xl border border-[#333333] shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                         <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full text-[#999999] hover:bg-[#222222] transition-colors" aria-label="Close modal">
                            <X size={20} />
                        </button>
                        <h2 className="text-2xl font-bold text-white">Confirm Overwrite</h2>
                        <p className="mt-3 text-[#CCCCCC]">
                            Your current text will be replaced by this saved entry. Are you sure you want to proceed?
                        </p>
                        <div className="mt-6 flex justify-end gap-4">
                            <button
                                onClick={onClose}
                                className="px-5 py-2.5 rounded-lg bg-[#222222] border border-[#444444] text-[#CCCCCC] font-medium hover:bg-[#333333] transition-colors focus:outline-none"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onConfirm}
                                className="px-5 py-2.5 rounded-lg bg-blue-900/50 border border-blue-800 text-blue-200 font-medium hover:bg-blue-900/80 transition-colors focus:outline-none"
                            >
                                Load Entry
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const SaveConfirmationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSaveOriginal: () => void;
    onSaveNew: () => void;
}> = ({ isOpen, onClose, onSaveOriginal, onSaveNew }) => {
    useBodyScrollLock(isOpen);
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 30 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        className="relative bg-[#1A1A1A] w-full max-w-md m-4 p-6 rounded-2xl border border-[#333333] shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                         <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full text-[#999999] hover:bg-[#222222] transition-colors" aria-label="Close modal">
                            <X size={20} />
                        </button>
                        <h2 className="text-2xl font-bold text-white">Save Entry</h2>
                        <p className="mt-3 text-[#CCCCCC]">
                            You are editing a previously saved entry. Would you like to overwrite the original entry or save this as a new copy?
                        </p>
                        <div className="mt-6 flex justify-end gap-4">
                            <button
                                onClick={onSaveNew}
                                className="px-5 py-2.5 rounded-lg bg-[#222222] border border-[#444444] text-[#CCCCCC] font-medium hover:bg-[#333333] transition-colors focus:outline-none"
                            >
                                Save as New
                            </button>
                            <button
                                onClick={onSaveOriginal}
                                className="px-5 py-2.5 rounded-lg bg-blue-900/50 border border-blue-800 text-blue-200 font-medium hover:bg-blue-900/80 transition-colors focus:outline-none"
                            >
                                Save to Original
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// --- MAIN APP COMPONENT ---
const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'counter' | 'saved' | 'help'>('counter');
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [text, setText] = useState('');
    const [wpm, setWpm] = useState(0);
    const [savedEntries, setSavedEntries] = useState<SavedEntry[]>([]);
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [paginationDirection, setPaginationDirection] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [entryToDelete, setEntryToDelete] = useState<number | null>(null);
    const [entryToLoad, setEntryToLoad] = useState<SavedEntry | null>(null);
    const [loadedEntryId, setLoadedEntryId] = useState<number | null>(null);
    const ENTRIES_PER_PAGE = 5;

    const [history, setHistory] = useState<string[]>(['']);
    const [historyIndex, setHistoryIndex] = useState<number>(0);
    const lastSavedTextRef = useRef<string>('');
    const latestTextRef = useRef<string>('');
    const historyIndexRef = useRef<number>(0);

    const typingHistoryRef = useRef<{ timestamp: number; wpmWords: number }[]>([]);
    const isPastingRef = useRef(false);
    const pastedCharsCountRef = useRef(0);
    const prevTextRef = useRef('');
    const topOfListRef = useRef<HTMLDivElement>(null);
    const isInitialSavedLoad = useRef(true);

    // Sync latestTextRef
    useEffect(() => {
        latestTextRef.current = text;
    }, [text]);

    // Clear history on mount
    useEffect(() => {
        const clearDB = async () => {
            if (isIDBAvailable) {
                try {
                    const db = await initDB();
                    if (db.objectStoreNames.contains('history_meta')) {
                        const tx = db.transaction('history_meta', 'readwrite');
                        tx.objectStore('history_meta').clear();
                    }
                } catch (e) {
                    console.error("Failed to clear history DB", e);
                }
            }
        };
        clearDB();
    }, []);

    // Cache every 0.75 seconds continuously
    useEffect(() => {
        const interval = setInterval(() => {
            const currentText = latestTextRef.current;
            if (currentText !== lastSavedTextRef.current) {
                setHistory(prev => {
                    const currentIndex = historyIndexRef.current;
                    const newHistory = prev.slice(0, currentIndex + 1);
                    newHistory.push(currentText);
                    
                    // Cache to IDB asynchronously (non-blocking)
                    if (isIDBAvailable) {
                        initDB().then(db => {
                            const tx = db.transaction('history_meta', 'readwrite');
                            tx.objectStore('history_meta').put({ id: 'session', history: newHistory, currentIndex: newHistory.length - 1 });
                        }).catch(e => console.error("Failed to cache history", e));
                    }
                    
                    return newHistory;
                });
                
                const newIndex = historyIndexRef.current + 1;
                historyIndexRef.current = newIndex;
                setHistoryIndex(newIndex);
                lastSavedTextRef.current = currentText;
            }
        }, 750);
        return () => clearInterval(interval);
    }, []);

    const handleUndo = () => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            historyIndexRef.current = newIndex;
            setText(history[newIndex]);
            lastSavedTextRef.current = history[newIndex];
        }
    };

    const handleRedo = () => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            historyIndexRef.current = newIndex;
            setText(history[newIndex]);
            lastSavedTextRef.current = history[newIndex];
        }
    };

    const handleClear = () => {
        setText('');
    };

    useEffect(() => {
        prevTextRef.current = text;
    }, [text]);

    const stats = {
        words: countWords(text),
        characters: text.length,
        sentences: countSentences(text),
        paragraphs: countParagraphs(text),
    };

    const getWpmFeedback = () => {
        if (wpm > 100) return "Exceptional!";
        if (wpm > 80) return "Productive";
        if (wpm > 60) return "Above Average";
        if (wpm > 40) return "Average";
        if (wpm > 0) return "Snail's Pace";
        return "Idle";
    };
    
    // WPM Calculation Effect
    useEffect(() => {
        const calculateWpm = () => {
            const now = Date.now();
            const sixtySecondsAgo = now - 60000;
            const history = typingHistoryRef.current;

            const lastEntry = history.length > 0 ? history[history.length - 1] : null;

            // If idle for 60 seconds, reset everything
            if (lastEntry && lastEntry.timestamp < sixtySecondsAgo) {
                setWpm(0);
                typingHistoryRef.current = [];
                return;
            }
            
            // Find the entry to use as a baseline (the last one from before our 60s window)
            const baselineEntry = [...history].reverse().find(e => e.timestamp < sixtySecondsAgo);
            const baselineWords = baselineEntry ? baselineEntry.wpmWords : 0;
            
            const latestWords = lastEntry ? lastEntry.wpmWords : 0;
            const wordsTypedInWindow = latestWords - baselineWords;

            setWpm(Math.round(wordsTypedInWindow < 0 ? 0 : wordsTypedInWindow));

            // Prune history to keep it manageable
            const firstRelevantIndex = history.findIndex(e => e.timestamp >= sixtySecondsAgo);
            if (firstRelevantIndex > 0) {
                typingHistoryRef.current = history.slice(firstRelevantIndex - 1);
            }
        };

        const timerId = setInterval(calculateWpm, 1000); // Update WPM every second
        return () => clearInterval(timerId);
    }, []);

    const handlePasteOrDrop = () => {
        isPastingRef.current = true;
        setTimeout(() => {
            isPastingRef.current = false;
        }, 0);
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newText = e.target.value;
        const oldText = prevTextRef.current;
    
        if (isPastingRef.current) {
            // This block executes right after a paste or drop event.
            const pastedLength = newText.length - oldText.length;
            if (pastedLength > 0) {
                pastedCharsCountRef.current += pastedLength;
            }
            // Only update text, do not trigger WPM calculation for this change.
            setText(newText);
        } else {
            // This block executes for manual typing or deletion.
            const delta = newText.length - oldText.length;
    
            if (delta < 0) { // A deletion occurred.
                const deletedCount = -delta;
                // To prevent manipulation, this heuristic assumes deletions apply to typed characters first.
                // Only once the number of typed characters is exhausted will pasted characters be removed.
                const typedCharsBefore = oldText.length - pastedCharsCountRef.current;
                const typedCharsDeleted = Math.min(typedCharsBefore, deletedCount);
                const pastedCharsDeleted = deletedCount - typedCharsDeleted;
                pastedCharsCountRef.current -= pastedCharsDeleted;
            }
            
            // After any potential adjustment, ensure the count is valid.
            pastedCharsCountRef.current = Math.max(0, Math.min(pastedCharsCountRef.current, newText.length));
    
            setText(newText);
            
            // Calculate WPM based on "clean" character count.
            const typedChars = newText.length - pastedCharsCountRef.current;
            const currentWpmWordCount = typedChars / 5;
            
            typingHistoryRef.current.push({ timestamp: Date.now(), wpmWords: currentWpmWordCount });
        }
    
        // Update previous text ref for the next change event.
        prevTextRef.current = newText;
    };


    useEffect(() => {
        if (activeTab === 'saved') {
            storage.getEntries().then(setSavedEntries);
            setCurrentPage(1);
            isInitialSavedLoad.current = true;
        }
    }, [activeTab]);
    
    // Effect to handle scrolling on pagination
    useEffect(() => {
        if (activeTab === 'saved') {
            if (isInitialSavedLoad.current) {
                // This is the first render after switching to the tab. Don't scroll.
                // Subsequent currentPage changes will scroll.
                isInitialSavedLoad.current = false;
            } else {
                // This is a pagination click. Scroll after the state has updated.
                topOfListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }, [currentPage]);


    const handleSave = async () => {
        if (!text.trim()) return;
        if (loadedEntryId !== null) {
            setIsSaveModalOpen(true);
        } else {
            await saveAsNew();
        }
    };

    const saveAsNew = async () => {
        const newEntry = {
            content: text,
            wordCount: stats.words,
            savedAt: Date.now(),
        };
        await storage.saveEntry(newEntry);
        setText('');
        setLoadedEntryId(null);
        pastedCharsCountRef.current = 0;
        typingHistoryRef.current = [];
        setWpm(0);
        setIsSaveModalOpen(false);
        setIsSuccessModalOpen(true);
    };

    const saveToOriginal = async () => {
        if (loadedEntryId === null) return;
        const updatedEntry = {
            id: loadedEntryId,
            content: text,
            wordCount: stats.words,
            savedAt: Date.now(),
        };
        await storage.updateEntry(updatedEntry);
        setText('');
        setLoadedEntryId(null);
        pastedCharsCountRef.current = 0;
        typingHistoryRef.current = [];
        setWpm(0);
        setIsSaveModalOpen(false);
        setIsSuccessModalOpen(true);
    };
    
    const handleCopy = (id: number, content: string) => {
        navigator.clipboard.writeText(content);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 1500);
    };

    const requestDelete = (id: number) => {
        setEntryToDelete(id);
        setIsModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (entryToDelete === null) return;

        await storage.deleteEntry(entryToDelete);
        setSavedEntries(prevEntries => {
            const updatedEntries = prevEntries.filter(entry => entry.id !== entryToDelete);
            const newTotalPages = Math.ceil(updatedEntries.length / ENTRIES_PER_PAGE);
            if (currentPage > newTotalPages) {
                setCurrentPage(Math.max(newTotalPages, 1));
            }
            return updatedEntries;
        });

        setIsModalOpen(false);
        setEntryToDelete(null);
    };

    const handleLoad = (entry: SavedEntry) => {
        if (text.trim().length > 0) {
            setEntryToLoad(entry);
            setIsLoadModalOpen(true);
        } else {
            executeLoad(entry);
        }
    };

    const handleConfirmLoad = () => {
        if (entryToLoad !== null) {
            executeLoad(entryToLoad);
        }
        setIsLoadModalOpen(false);
        setEntryToLoad(null);
    };

    const executeLoad = (entry: SavedEntry) => {
        setText(entry.content);
        setLoadedEntryId(entry.id);
        pastedCharsCountRef.current = entry.content.length; // Treat loaded text as pasted so it doesn't count towards WPM
        typingHistoryRef.current = [];
        setWpm(0);
        
        // Reset history stack
        setHistory(['', entry.content]);
        setHistoryIndex(1);
        historyIndexRef.current = 1;
        lastSavedTextRef.current = entry.content;

        setActiveTab('counter');
    };

    const maxDigits = Math.max(
        stats.words.toString().length,
        stats.characters.toString().length,
        stats.sentences.toString().length,
        stats.paragraphs.toString().length
    );

    let gridClass = "grid-cols-2 md:grid-cols-4";
    if (maxDigits > 9) {
        gridClass = "grid-cols-1 md:grid-cols-1";
    } else if (maxDigits > 5) {
        gridClass = "grid-cols-1 md:grid-cols-2";
    }

    const loadedEntry = savedEntries.find(e => e.id === loadedEntryId);

    const counterView = (
        <motion.div key="counter" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full flex flex-col gap-5">
            <div className="w-full flex flex-col">
                <AnimatePresence>
                    {loadedEntryId && loadedEntry && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="w-full overflow-hidden"
                        >
                            <div className="bg-[#1A1A1A] p-3 sm:p-4 rounded-xl border border-[#333333] flex items-center justify-between">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="p-2 bg-[#222222] rounded-lg border border-[#444444] hidden sm:block">
                                        <FileText size={18} className="text-[#CCCCCC]" />
                                    </div>
                                    <div className="flex flex-col truncate">
                                        <span className="text-xs font-semibold text-[#AAAAAA] uppercase tracking-wider mb-0.5">Active Editing</span>
                                        <span className="text-sm text-[#CCCCCC] truncate">
                                            Saved on {new Date(loadedEntry.savedAt).toLocaleDateString()} at {new Date(loadedEntry.savedAt).toLocaleTimeString()}
                                        </span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setLoadedEntryId(null)}
                                    className="p-2 rounded-lg hover:bg-[#222222] transition-colors text-[#999999] hover:text-[#CCCCCC] flex-shrink-0"
                                    aria-label="Break editorial link"
                                >
                                    <X size={16} className="sm:w-5 sm:h-5 flex-shrink-0" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <textarea
                    value={text}
                    onChange={handleTextChange}
                    onPaste={handlePasteOrDrop}
                    onDrop={handlePasteOrDrop}
                    placeholder="Start typing here to see the magic happen..."
                    className="w-full h-64 p-4 bg-[#222222] border border-[#444444] rounded-xl text-lg text-[#CCCCCC] placeholder-[#888888] focus:outline-none focus:ring-1 focus:ring-[#666666] transition-all duration-300 resize-none shadow-inner"
                    aria-label="Text input area"
                />
            </div>

            <div className="flex flex-col gap-3 w-full">
                {/* Row 1 */}
                <div className="flex gap-2 sm:gap-3 w-full">
                    <button onClick={handleClear} disabled={!text} className="flex-1 bg-gradient-to-r from-[#444444] to-[#4A4A4A] hover:from-[#4A4A4A] hover:to-[#555555] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-1 sm:px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2 shadow-sm border border-[#555555] text-xs sm:text-base">
                        <X size={16} className="sm:w-5 sm:h-5 flex-shrink-0" /> <span className="truncate">Clear</span>
                    </button>
                    <button onClick={() => setText(text.toUpperCase())} disabled={!text || text === text.toUpperCase()} className="flex-1 bg-gradient-to-r from-[#444444] to-[#4A4A4A] hover:from-[#4A4A4A] hover:to-[#555555] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-1 sm:px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2 shadow-sm border border-[#555555] text-xs sm:text-base">
                        <CaseUpper size={16} className="sm:w-5 sm:h-5 flex-shrink-0" /> <span className="truncate">UPPERCASE</span>
                    </button>
                    <button onClick={() => setText(text.toLowerCase())} disabled={!text || text === text.toLowerCase()} className="flex-1 bg-gradient-to-r from-[#444444] to-[#4A4A4A] hover:from-[#4A4A4A] hover:to-[#555555] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-1 sm:px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2 shadow-sm border border-[#555555] text-xs sm:text-base">
                        <CaseLower size={16} className="sm:w-5 sm:h-5 flex-shrink-0" /> <span className="truncate">lowercase</span>
                    </button>
                </div>
                {/* Row 2 */}
                <div className="flex gap-2 sm:gap-3 w-full">
                    <button onClick={handleUndo} disabled={historyIndex <= 0} className="flex-1 bg-gradient-to-r from-[#444444] to-[#4A4A4A] hover:from-[#4A4A4A] hover:to-[#555555] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-1 sm:px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2 shadow-sm border border-[#555555] text-xs sm:text-base">
                        <Undo2 size={16} className="sm:w-5 sm:h-5 flex-shrink-0" /> <span className="truncate">Undo</span>
                    </button>
                    <button onClick={handleRedo} disabled={historyIndex >= history.length - 1} className="flex-1 bg-gradient-to-r from-[#444444] to-[#4A4A4A] hover:from-[#4A4A4A] hover:to-[#555555] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-1 sm:px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2 shadow-sm border border-[#555555] text-xs sm:text-base">
                        <Redo2 size={16} className="sm:w-5 sm:h-5 flex-shrink-0" /> <span className="truncate">Redo</span>
                    </button>
                    <button onClick={handleSave} disabled={!text.trim()} className="flex-1 bg-gradient-to-r from-[#444444] to-[#4A4A4A] hover:from-[#4A4A4A] hover:to-[#555555] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-1 sm:px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2 shadow-sm border border-[#555555] text-xs sm:text-base">
                        <Save size={16} className="sm:w-5 sm:h-5 flex-shrink-0" /> <span className="truncate">Save</span>
                    </button>
                </div>
            </div>

            <motion.div layout className={`grid gap-4 ${gridClass}`}>
                <StatCard icon={<FileText className="text-[#CCCCCC]" />} label="Words" value={stats.words} />
                <StatCard icon={<Type className="text-[#CCCCCC]" />} label="Characters" value={stats.characters} />
                <StatCard icon={<span className="text-[#CCCCCC] font-bold">Σ</span>} label="Sentences" value={stats.sentences} />
                <StatCard icon={<Pilcrow className="text-[#CCCCCC]" />} label="Paragraphs" value={stats.paragraphs} />
            </motion.div>

            <div className="bg-[#1A1A1A] p-4 rounded-xl border border-[#333333]">
                <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-3">
                        <Gauge className="text-[#999999]" />
                        <span className="text-2xl font-bold text-white">{wpm}</span>
                        <span className="text-xs font-medium text-[#999999] uppercase">WPM</span>
                    </div>
                    <span className="text-sm font-medium text-[#BBBBBB]">{getWpmFeedback()}</span>
                </div>
                <div className="w-full bg-[#222222] rounded-full h-2.5 border border-[#333333]">
                    <div className="bg-[#666666] h-2.5 rounded-full" style={{ width: `${Math.min(wpm / 120, 1) * 100}%`, transition: 'width 0.5s ease' }}></div>
                </div>
            </div>
        </motion.div>
    );

    const totalPages = Math.ceil(savedEntries.length / ENTRIES_PER_PAGE);
    const startIndex = (currentPage - 1) * ENTRIES_PER_PAGE;
    const paginatedEntries = savedEntries.slice(startIndex, startIndex + ENTRIES_PER_PAGE);

    const handlePageChange = (newPage: number) => {
        const boundedPage = Math.max(1, Math.min(newPage, totalPages));
        if (boundedPage === currentPage) return;
        
        setPaginationDirection(boundedPage > currentPage ? 1 : -1);
        setCurrentPage(boundedPage);
    };
    
    const paginationVariants = {
        initial: (direction: number) => ({
            opacity: 0,
            x: direction > 0 ? 30 : -30,
        }),
        animate: {
            opacity: 1,
            x: 0,
            transition: { type: 'spring', stiffness: 300, damping: 30 }
        },
        exit: (direction: number) => ({
            opacity: 0,
            x: direction > 0 ? -30 : 30,
            transition: { type: 'spring', stiffness: 300, damping: 30 }
        })
    };

    const savedEntriesView = (
        <motion.div key="saved" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full flex flex-col gap-4">
            {savedEntries.length > 0 ? (
                <>
                    <AnimatePresence mode="wait" custom={paginationDirection}>
                        <motion.div
                            key={currentPage}
                            custom={paginationDirection}
                            variants={paginationVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="flex flex-col gap-4"
                        >
                            {paginatedEntries.map(entry => (
                                <div key={entry.id} className="bg-[#1A1A1A] p-4 rounded-xl border border-[#333333]">
                                    <div className="flex justify-between items-start gap-4">
                                        <div>
                                            <h3 className="text-sm font-medium text-[#AAAAAA] uppercase">Saved on {new Date(entry.savedAt).toLocaleDateString()}</h3>
                                            <p className="text-xs text-[#999999] mt-1 flex items-center gap-1">
                                                {new Date(entry.savedAt).toLocaleTimeString()} <span className="text-[#444444]">&bull;</span> {entry.wordCount} words
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => handleLoad(entry)} className="p-2 rounded-full hover:bg-[#222222] transition-colors border border-transparent hover:border-[#444444]" aria-label="Load text into counter">
                                                <ArrowUpRight size={18} className="text-[#999999] hover:text-[#CCCCCC]" />
                                            </button>
                                            <button onClick={() => handleCopy(entry.id, entry.content)} className="p-2 rounded-full hover:bg-[#222222] transition-colors border border-transparent hover:border-[#444444]" aria-label="Copy text">
                                                {copiedId === entry.id ? <Check className="text-[#CCCCCC]" size={18}/> : <Copy size={18} className="text-[#999999] hover:text-[#CCCCCC]"/>}
                                            </button>
                                            <button onClick={() => requestDelete(entry.id)} className="p-2 rounded-full hover:bg-[#222222] transition-colors border border-transparent hover:border-[#444444]" aria-label="Delete entry">
                                                <Trash2 size={18} className="text-[#999999] hover:text-[#CCCCCC]" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="mt-3 text-[#CCCCCC] bg-[#222222] p-3 rounded-lg max-h-24 overflow-y-auto text-sm leading-relaxed border border-[#333333] shadow-inner">
                                        {entry.content}
                                    </p>
                                </div>
                            ))}
                        </motion.div>
                    </AnimatePresence>
                     {totalPages > 1 && (
                        <div className="flex justify-between items-center">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-4 py-2 bg-[#222222] border border-[#444444] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#333333] text-[#CCCCCC] transition-colors text-sm"
                            >
                                Previous
                            </button>
                            <span className="text-sm text-[#999999]">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 bg-[#222222] border border-[#444444] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#333333] text-[#CCCCCC] transition-colors text-sm"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <p className="text-center text-[#888888] py-10">You have no saved entries.</p>
            )}
        </motion.div>
    );

    const faqs = [
        { question: "How do I overwrite a previously saved entry?", answer: "Go to the 'Saved Entries' tab and load an entry. An 'Active Editing' banner will appear above the editor. When you click 'Save', you will be prompted to either overwrite the original entry or save your edits as a brand new copy." },
        { question: "What does the 'X' on the Active Editing banner do?", answer: "Clicking the 'X' breaks the connection to the original file, but it does not delete your text. If you click 'Save' afterward, it will automatically save as a new entry instead of asking to overwrite." },
        { question: "What happens if I click 'Clear' while editing?", answer: "The 'Clear' button only empties the text box so you can start fresh. It does not delete your saved file or break the 'Active Editing' connection, allowing you to completely rewrite an entry before overwriting it." },
        { question: "How do I install this tool on my device?", answer: "Look for the 'Install' icon in your browser's address bar (on desktop) or select 'Add to Home Screen' from your mobile browser's menu to install it as a standalone app." },
        { question: "What happens if I clear my browser cache?", answer: "Since all saved entries and revision history are stored locally in your browser's database, clearing your site data or cache will permanently delete your saved texts." },
        { question: "Is there a character limit for the text editor?", answer: "There is no hardcoded character limit. However, extremely large documents (e.g., hundreds of pages) might cause browser sluggishness due to real-time DOM updates." }
    ];

    const helpView = (
        <motion.div key="help" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
                <div className="bg-[#1A1A1A] p-5 rounded-xl border border-[#333333]">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-[#222222] rounded-lg border border-[#444444]"><FileText size={18} className="text-white" /></div>
                        <h3 className="font-semibold text-white">Real-time Statistics</h3>
                    </div>
                    <p className="text-sm text-[#AAAAAA] leading-relaxed">Instantly track words, characters, sentences, and paragraphs as you type.</p>
                </div>
                <div className="bg-[#1A1A1A] p-5 rounded-xl border border-[#333333]">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-[#222222] rounded-lg border border-[#444444]"><Gauge size={18} className="text-white" /></div>
                        <h3 className="font-semibold text-white">Intelligent WPM</h3>
                    </div>
                    <p className="text-sm text-[#AAAAAA] leading-relaxed">Accurately measure your typing speed. Our meter ignores pasted text for true WPM.</p>
                </div>
                <div className="bg-[#1A1A1A] p-5 rounded-xl border border-[#333333]">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-[#222222] rounded-lg border border-[#444444]"><Save size={18} className="text-white" /></div>
                        <h3 className="font-semibold text-white">Advanced Editing</h3>
                    </div>
                    <p className="text-sm text-[#AAAAAA] leading-relaxed">Load past entries, track your active editing session, and choose to overwrite or save as new.</p>
                </div>
                <div className="bg-[#1A1A1A] p-5 rounded-xl border border-[#333333]">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-[#222222] rounded-lg border border-[#444444]"><Undo2 size={18} className="text-white" /></div>
                        <h3 className="font-semibold text-white">Revision History</h3>
                    </div>
                    <p className="text-sm text-[#AAAAAA] leading-relaxed">Make mistakes without fear. Use undo and redo to navigate your recent edits.</p>
                </div>
                <div className="hidden sm:block bg-[#1A1A1A] p-5 rounded-xl border border-[#333333]">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-[#222222] rounded-lg border border-[#444444]"><Smartphone size={18} className="text-white" /></div>
                        <h3 className="font-semibold text-white">Offline & Installable</h3>
                    </div>
                    <p className="text-sm text-[#AAAAAA] leading-relaxed">Works completely offline. Install it as a Progressive Web App (PWA) on your desktop or mobile device.</p>
                </div>
                <div className="hidden sm:block bg-[#1A1A1A] p-5 rounded-xl border border-[#333333]">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-[#222222] rounded-lg border border-[#444444]"><Zap size={18} className="text-white" /></div>
                        <h3 className="font-semibold text-white">Quick Actions</h3>
                    </div>
                    <p className="text-sm text-[#AAAAAA] leading-relaxed">Format text instantly with one-click uppercase, lowercase, and clear actions.</p>
                </div>
            </div>

            <div className="bg-[#1A1A1A] p-6 rounded-xl border border-[#333333]">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <HelpCircle className="text-[#999999]" /> Frequently Asked Questions
                </h2>
                <div className="flex flex-col gap-3">
                    {faqs.map((faq, index) => (
                        <div key={index} className="border border-[#333333] rounded-lg overflow-hidden bg-[#222222]">
                            <button
                                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                className="w-full flex justify-between items-center p-4 text-left hover:bg-[#2A2A2A] transition-colors focus:outline-none"
                            >
                                <span className="font-medium text-[#EEEEEE]">{faq.question}</span>
                                <motion.div
                                    animate={{ rotate: openFaq === index ? 180 : 0 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                >
                                    <ChevronDown size={18} className="text-[#999999]" />
                                </motion.div>
                            </button>
                            <AnimatePresence initial={false}>
                                {openFaq === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                    >
                                        <div className="p-4 text-[#AAAAAA] text-sm leading-relaxed border-t border-[#333333]">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );

    return (
        <div className="min-h-screen w-full flex flex-col items-center p-4 sm:p-6 lg:p-8 overflow-y-auto">
            <ConfirmationModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmDelete}
            />
            <LoadModal 
                isOpen={isLoadModalOpen}
                onClose={() => setIsLoadModalOpen(false)}
                onConfirm={handleConfirmLoad}
            />
            <SuccessModal 
                isOpen={isSuccessModalOpen}
                onClose={() => setIsSuccessModalOpen(false)}
                title="Success!"
                message="Your text has been saved successfully."
            />
            <SaveConfirmationModal
                isOpen={isSaveModalOpen}
                onClose={() => setIsSaveModalOpen(false)}
                onSaveOriginal={saveToOriginal}
                onSaveNew={saveAsNew}
            />

            <main className="w-full max-w-2xl mx-auto flex flex-col items-center gap-8 relative">
                <header className="text-center mt-8 mb-4">
                    <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight font-pixel">
                        Word Counter<span className="hidden sm:inline"> Tool</span>
                    </h1>
                </header>
                
                <div ref={topOfListRef}>
                    <LayoutGroup>
                        <TabToggle activeTab={activeTab} onTabChange={setActiveTab} />
                    </LayoutGroup>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'counter' ? counterView : activeTab === 'saved' ? savedEntriesView : helpView}
                </AnimatePresence>
            </main>
            <Footer />
        </div>
    );
};

export default App;