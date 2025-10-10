import React from 'react';
import { FaqAccordion } from './FaqAccordion';

type Mode = 'natural' | 'manual' | 'reverse';

interface FaqProps {
    mode: Mode;
}

const NaturalAnswer = () => (
    <>
        <p>
            Type any time or date into the input box. You can use natural language, and the generator will instantly provide Discord-compatible timestamps for you to copy.
        </p>
        <p>Examples of what you can type:</p>
        <ul>
            <li><code>“July 1st”</code> - July 1st of the current year.</li>
            <li><code>“now”</code> - The current date and time.</li>
            <li><code>“1pm”</code> - 1:00 PM today.</li>
            <li><code>“Tuesday”</code> - The upcoming Tuesday.</li>
            <li><code>“in 1h”</code> - The time an hour from now.</li>
            <li><code>“1pm cst”</code> - 1:00 PM, in Central Standard Time.</li>
        </ul>
        <p>
            You can navigate the suggestions with your arrow keys and press Enter to copy, all without leaving your keyboard.
        </p>
    </>
);

const ManualAnswer = () => (
     <>
        <p>
            Use the interactive calendar and time inputs to pick a specific date and time.
        </p>
        <p>
            First, click on a day in the calendar to select it. You can navigate between months and years using the arrow buttons. Then, adjust the hour, minute, and second in the time input fields.
        </p>
        <p>
            Once you have set the desired date and time, the corresponding Discord timestamps will be generated below for you to copy. You can also click "Set to Current Time" to quickly reset to now.
        </p>
    </>
);

const ReverseAnswer = () => (
    <>
        <p>
            Copy a Discord timestamp from any message (e.g. <code>&lt;t:1672531200:F&gt;</code>), paste it into the input field, and the human-readable date and time will appear instantly.
        </p>
        <h3>Examples</h3>
        <ul>
            <li><code>&lt;t:1672531200:F&gt;</code> - Full date/time format</li>
            <li><code>&lt;t:1672531200:R&gt;</code> - Relative time format</li>
            <li><code>&lt;t:1672531200&gt;</code> - Default format (same as :f)</li>
        </ul>
    </>
);


const allFaqData = [
    {
        question: {
            natural: "How do I use the natural timestamp generator?",
            manual: "How do I use the manual timestamp generator?",
            reverse: "How do I use the reverse timestamp generator?",
        },
        answer: {
            natural: <NaturalAnswer />,
            manual: <ManualAnswer />,
            reverse: <ReverseAnswer />,
        },
        modes: ['natural', 'manual', 'reverse']
    },
    {
        question: "Why should I use Discord timestamps?",
        answer: (
            <p>
                Discord Timestamps are timezone-agnostic. When you send one in chat, it automatically displays the correct time for every user, regardless of their local timezone. This eliminates confusion and makes scheduling events or referencing times in international communities effortless.
            </p>
        ),
        modes: ['natural', 'manual', 'reverse']
    },
    {
        question: "How accurate are the relative time previews?",
        answer: (
            <>
                <p>
                    This generator aims for maximum accuracy by replicating the logic Discord uses to display relative times (e.g., "in 2 hours"). As of 2025, Discord appears to use a customized version of the Moment.js library.
                </p>
                <p>
                    We've matched the specific "thresholds" Discord uses for switching between units (e.g., from "seconds" to "a minute"), so the preview you see here should be identical to what appears in chat.
                </p>
            </>
        ),
        modes: ['natural', 'manual', 'reverse']
    },
    {
        question: "Why does “now” show as “1 seconds ago”?",
        answer: (
             <p>
                This is a known quirk in how Discord handles timestamps. It never displays "now" or "0 seconds ago". The minimum relative time it shows is "1 seconds ago". This tool replicates that behavior to provide an accurate preview of what will be seen in Discord.
            </p>
        ),
        modes: ['natural']
    },
];


export const Faq: React.FC<FaqProps> = ({ mode }) => {
    
    const faqItemsToRender = allFaqData
        .filter(item => item.modes.includes(mode))
        .map(item => {
            const answerContent = (typeof item.answer === 'object' && !React.isValidElement(item.answer))
                ? item.answer[mode]
                : item.answer;

            const questionContent = (typeof item.question === 'object')
                ? item.question[mode]
                : item.question;
            
            // A stable key is needed for React's reconciliation.
            // If the question is an object, we use a stable property from it (e.g., the 'natural' version).
            // If it's a string, we just use the string. This ensures the key is always a unique string.
            const key = typeof item.question === 'string' ? item.question : item.question.natural;

            return {
                key,
                question: questionContent,
                answer: answerContent,
            };
        });

    return (
        <div className="w-full mt-16 flex flex-col items-center gap-8">
            <header className="text-center">
                 <h2 className="text-3xl font-bold text-gray-100 tracking-tight">
                    Frequently Asked Questions
                </h2>
                 <p className="mt-3 text-lg text-gray-400 max-w-2xl">
                    Everything you need to know about Discord timestamps.
                </p>
            </header>

            <div className="w-full flex flex-col gap-3">
                {faqItemsToRender.map((item) => (
                    <FaqAccordion key={item.key} question={item.question}>
                        {item.answer}
                    </FaqAccordion>
                ))}
            </div>
        </div>
    );
};