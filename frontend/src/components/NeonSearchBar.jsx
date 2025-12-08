import { useState } from "react";
import { useSelector } from "react-redux";
import { Search } from "lucide-react";

const NeonSearchBar = ({ value, onChange, placeholder, className = "" }) => {
    
    // Theme Logic and Focus State (Internalized)
    const { theme } = useSelector((state) => state.theme || { theme: "light" });
    const isDarkMode = theme === 'dark';

    const [isFocused, setIsFocused] = useState(false);

    const neonStyles = `
        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .neon-border-wrapper {
            position: relative;
            padding: 2px;
            overflow: hidden;
            border-radius: 8px;
            background: ${isDarkMode ? '#18181b' : '#ffffff'}; 
            transition: box-shadow 0.3s ease-in-out, background 0.3s ease;
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
        <div className={`relative w-full neon-border-wrapper ${className}`}>
            <style>{neonStyles}</style>
            
            {/* Search Icon */}
            <Search 
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 z-20 pointer-events-none transition-colors 
                ${isFocused 
                    ? (isDarkMode ? 'text-purple-400' : 'text-blue-500') 
                    : 'text-gray-400 dark:text-zinc-500'
                }`} 
            />
            
            {/* Input Field */}
            <input 
                type="text"
                value={value} 
                onChange={onChange} 
                placeholder={placeholder}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="w-full pl-10 text-sm pr-4 py-2 rounded-lg neon-input-mask" 
            />
        </div>
    );
};

export default NeonSearchBar;