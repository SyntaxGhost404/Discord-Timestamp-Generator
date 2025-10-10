import React from 'react';

const DiscordIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg fill="currentColor" viewBox="0 0 16 16" {...props}>
        <path d="M13.545 2.907a13.2 13.2 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.2 12.2 0 0 0-3.658 0 8 8 0 0 0-.412-.833.05.05 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.04.04 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032q.003.022.021.037a13.3 13.3 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019q.463-.63.818-1.329a.05.05 0 0 0-.01-.059l-.018-.011a9 9 0 0 1-1.248-.595.05.05 0 0 1-.02-.066l.015-.019q.127-.095.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.05.05 0 0 1 .053.007q.121.1.248.195a.05.05 0 0 1-.004.085 8 8 0 0 1-1.249.594.05.05 0 0 0-.03.03.05.05 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.2 13.2 0 0 0 4.001-2.02.05.05 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.03.03 0 0 0-.02-.019m-8.198 7.307c-.789 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612m5.316 0c-.788 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612"/>
    </svg>
);

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg fill="currentColor" viewBox="0 0 16 16" {...props}>
    <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z"/>
  </svg>
);

export const Footer: React.FC = () => {
    return (
        <footer className="w-full max-w-2xl mx-auto text-center py-12 mt-8 border-t border-zinc-800">
            <div className="flex flex-col items-center gap-4">
                 <p className="text-gray-500 text-sm">
                    Created by <a href="https://youtu.be/dQw4w9WgXcQ" target="_blank" rel="noopener noreferrer" className="font-medium text-gray-400 hover:text-white transition-colors underline">Moin Uddin</a> in collaboration with <a href="https://x.com/itzsimonsmith?t=tkUyIzJRir_McvmapNWpOA&s=09" target="_blank" rel="noopener noreferrer" className="font-medium text-gray-400 hover:text-white transition-colors underline">Oli Ullah</a>. Heavily inspired by the excellent timestamp generator at <a href="https://timestamp.dabric.xyz" target="_blank" rel="noopener noreferrer" className="font-medium text-gray-400 hover:text-white transition-colors underline">dabric.xyz</a>.
                 </p>
                 <p className="text-gray-500 text-sm">
                    Suggestions, comments, or questions? Reach out on social media.
                 </p>
                 <div className="flex items-center gap-4">
                    <a href="https://discord.com/users/794482283993235478" target="_blank" rel="noopener noreferrer" aria-label="Discord Profile" className="text-gray-500 hover:text-white transition-colors">
                        <DiscordIcon className="h-6 w-6" />
                    </a>
                     <a href="https://x.com/MOINUDDIN8003?t=j7v3xugr20a8tq0P0qu7gA&s=09" target="_blank" rel="noopener noreferrer" aria-label="X/Twitter Profile" className="text-gray-500 hover:text-white transition-colors">
                        <XIcon className="h-5 w-5" />
                    </a>
                 </div>
                 <p className="text-xs text-gray-600 mt-4">
                    Not affiliated with Discord Inc. © 2025
                 </p>
            </div>
        </footer>
    );
};