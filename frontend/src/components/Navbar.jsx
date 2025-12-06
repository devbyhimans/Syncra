import { SearchIcon, PanelLeft, MoonIcon, SunIcon } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { toggleTheme } from '../features/themeSlice'
import { UserButton } from '@clerk/clerk-react'
import { useState } from 'react'

const Navbar = ({ setIsSidebarOpen }) => {

    const dispatch = useDispatch();
    const { theme } = useSelector(state => state.theme);
    
    // Derived state for the neon logic
    const isDarkMode = theme === 'dark';

    // Local state for search input animations
    const [searchTerm, setSearchTerm] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    //  Neon CSS
    const neonStyles = `
        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .neon-border-wrapper {
            position: relative;
            padding: 2px;
            overflow: hidden;
            /* RECTANGULAR SHAPE: Matching the rounded-md class (6px) */
            border-radius: 6px;
            /* Adaptive Background */
            background: ${isDarkMode ? '#18181b' : '#ffffff'}; 
            transition: box-shadow 0.3s ease-in-out, background 0.3s ease;
            /* Adaptive Glow Intensity */
            box-shadow: ${isDarkMode ? '0 0 5px rgba(180, 0, 255, 0.2)' : '0 0 10px rgba(0, 0, 0, 0.05)'}; 
        }
        
        .neon-border-wrapper:focus-within {
            box-shadow: ${isDarkMode ? '0 0 20px rgba(180, 0, 255, 0.5)' : '0 0 15px rgba(59, 130, 246, 0.3)'};
        }

        .neon-border-wrapper::before {
            content: '';
            position: absolute;
            top: -500%; left: -500%; right: -500%; bottom: -500%;
            z-index: 0; 
            /* The Spinning Gradient */
            background: conic-gradient(
                from 0deg,
                rgba(255, 0, 150, 1) 0%,   
                rgba(150, 50, 255, 1) 25%, 
                rgba(0, 200, 255, 1) 50%,  
                rgba(150, 50, 255, 1) 75%, 
                rgba(255, 0, 150, 1) 100%
            );
            animation: spin 3s linear infinite;
            opacity: ${isDarkMode ? '1' : '0.7'}; 
        }

        .neon-input-mask {
            position: relative;
            z-index: 10;
            width: 100%;
            /* Inner Input Background must match parent */
            background-color: ${isDarkMode ? '#18181b' : '#ffffff'};
            color: ${isDarkMode ? '#e9d5ff' : '#1e293b'};
            border: none;
            transition: background-color 0.3s ease, color 0.3s ease;
        }
        
        .neon-input-mask::placeholder {
            color: ${isDarkMode ? '#a855f7' : '#94a3b8'};
            opacity: 0.7;
        }
        
        .neon-input-mask:focus {
            outline: none;
        }
    `;

    return (
        <div className="w-full bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 px-6 xl:px-16 py-3 flex-shrink-0 transition-colors duration-300">
            {/* Inject Custom Styles */}
            <style>{neonStyles}</style>

            <div className="flex items-center justify-between max-w-6xl mx-auto">
                {/* Left section */}
                <div className="flex items-center gap-4 min-w-0 flex-1">
                    {/* Sidebar Trigger */}
                    <button onClick={() => setIsSidebarOpen((prev) => !prev)} className="sm:hidden p-2 rounded-lg transition-colors text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800" >
                        <PanelLeft size={20} />
                    </button>

                    {/* ---  SEARCH BAR --- */}
                    {/* Rectangular container (rounded-md) */}
                    <div className="relative flex-1 max-w-sm neon-border-wrapper rounded-md">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            placeholder="Search projects, tasks..."
                            className="pl-6 pr-4 py-2 rounded-md text-sm neon-input-mask"
                        />
                        {/* Search Icon (Visible when not focused/empty ) */}
                        {!isFocused && !searchTerm && (
                            <SearchIcon className={`absolute right-4 top-1/2 -translate-y-1/2 size-4 z-20 pointer-events-none transition-colors ${isDarkMode ? 'text-purple-400' : 'text-slate-400'}`} />
                        )}
                    </div>
                </div>

                {/* Right section */}
                <div className="flex items-center gap-3">

                    {/* Theme Toggle */}
                    <button onClick={() => dispatch(toggleTheme())} className="size-8 flex items-center justify-center bg-white dark:bg-zinc-800 shadow rounded-lg transition hover:scale-105 active:scale-95 border border-gray-100 dark:border-zinc-700">
                        {
                            theme === "light"
                                ? (<MoonIcon className="size-4 text-gray-800 dark:text-gray-200" />)
                                : (<SunIcon className="size-4 text-yellow-400" />)
                        }
                    </button>

                    {/* User Button */}
                    <UserButton/>
                </div>
            </div>
        </div>
    )
}

export default Navbar