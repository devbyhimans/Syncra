import { PanelLeft, MoonIcon, SunIcon } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { toggleTheme } from '../features/themeSlice'
import { UserButton } from '@clerk/clerk-react'

// CSS for both the Avatar Spin and the Text Flow
const styles = `
    /* 1. Avatar Spin Animation */
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    
    .neon-avatar-wrapper {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 3px; 
        border-radius: 50%; 
        overflow: hidden;
    }

    /* The spinning gradient ring for Avatar */
    .neon-avatar-wrapper::before {
        content: '';
        position: absolute;
        top: -50%; left: -50%; right: -50%; bottom: -50%;
        background: conic-gradient(
            from 0deg,
            rgba(255, 0, 150, 1) 0%,   
            rgba(150, 50, 255, 1) 25%, 
            rgba(0, 200, 255, 1) 50%,  
            rgba(150, 50, 255, 1) 75%, 
            rgba(255, 0, 150, 1) 100%
        );
        animation: spin 3s linear infinite;
        z-index: 0;
    }

    .neon-avatar-inner {
        position: relative;
        z-index: 10;
        border-radius: 50%;
        background: #18181b; 
        display: flex;
    }

    /* 2. Text Flow Animation */
    @keyframes shine {
        to { background-position: 200% center; }
    }

    .neon-text-branding {
        /* Same neon colors as the avatar, laid out horizontally */
        background: linear-gradient(
            to right, 
            #ff0096 0%,   
            #9632ff 25%, 
            #00c8ff 50%,  
            #9632ff 75%, 
            #ff0096 100%
        );
        background-size: 200% auto;
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        animation: shine 3s linear infinite;
    }
`;

const Navbar = ({ setIsSidebarOpen }) => {

    const dispatch = useDispatch();
    const { theme } = useSelector(state => state.theme);

    return (
        <div className="w-full bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 px-6 xl:px-16 py-3 flex-shrink-0 transition-colors duration-300">
            
            <style>{styles}</style>

            <div className="flex items-center justify-between max-w-6xl mx-auto">
                
                {/* Left section */}
                <div className="flex items-center gap-4">
                    
                    {/* Sidebar Trigger  */}
                    <button 
                        onClick={() => setIsSidebarOpen((prev) => !prev)} 
                        className="sm:hidden p-2 rounded-lg transition-colors text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800"
                    >
                        <PanelLeft size={20} />
                    </button>

                    {/* BRANDING SECTION */}
                    <div className="flex items-end gap-3 select-none">
                        
                        <h1 className="text-4xl font-extrabold tracking-tight leading-none neon-text-branding pb-1">
                            Syncra
                        </h1>
                        
                        {/* Tagline: Simple gray text to not compete with the logo */}
                        <span className="hidden sm:block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 tracking-wide">
                            Where Teams Move in Sync.
                        </span>
                    </div>
                </div>

                {/* Right section */}
                <div className="flex items-center gap-4">

                    {/* Theme Toggle (Restored original styling) */}
                    <button 
                        onClick={() => dispatch(toggleTheme())} 
                        className="size-9 flex items-center justify-center bg-white dark:bg-zinc-800 shadow rounded-lg transition hover:scale-105 active:scale-95 border border-gray-100 dark:border-zinc-700"
                    >
                        {
                            theme === "light"
                                ? (<MoonIcon className="size-5 text-gray-800 dark:text-gray-200" />)
                                : (<SunIcon className="size-5 text-yellow-400" />)
                        }
                    </button>

                    {/* User Avatar with Spinning Neon Ring */}
                    <div className="neon-avatar-wrapper">
                        <div className="neon-avatar-inner">
                            <UserButton />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Navbar