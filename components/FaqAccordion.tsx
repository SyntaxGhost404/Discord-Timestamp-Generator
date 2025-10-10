import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface FaqAccordionProps {
    question: string;
    children: React.ReactNode;
}

export const FaqAccordion: React.FC<FaqAccordionProps> = ({ question, children }) => {
    const [isOpen, setIsOpen] = useState(false);

    // A single, consistent spring transition for all animations in this component.
    // This makes the interaction feel cohesive and handles interruptions gracefully.
    const transition = {
        type: "spring",
        stiffness: 400,
        damping: 40
    };

    return (
        <motion.div
            layout // Animates layout changes (e.g., size) when content appears/disappears
            transition={transition} // The layout animation will use our spring
            className="w-full border border-zinc-700/50 bg-zinc-800/60 rounded-2xl overflow-hidden"
        >
            <button
                className="w-full flex justify-between items-center p-5 text-left text-lg font-medium text-gray-100 hover:bg-zinc-700/50 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
            >
                <span>{question}</span>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={transition} // The chevron rotation will use our spring
                >
                    <ChevronDown className="h-6 w-6" />
                </motion.div>
            </button>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        key="content"
                        initial="collapsed"
                        animate="open"
                        exit="collapsed"
                        variants={{
                            open: { opacity: 1, height: 'auto' },
                            collapsed: { opacity: 0, height: 0 }
                        }}
                        transition={transition} // The content reveal will use our spring
                        className="overflow-hidden" // Keep overflow-hidden on the animating element
                    >
                        {/* Padding is moved to an inner div to allow height to collapse to 0 */}
                        <div className="px-5 pb-5 pt-2">
                            <div className="prose prose-invert prose-p:text-gray-400 prose-li:text-gray-400 prose-code:text-blue-400 prose-code:before:content-[''] prose-code:after:content-[''] prose-code:bg-zinc-900 prose-code:px-1 prose-code:py-0.5 prose-code:rounded-md">
                               {children}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
