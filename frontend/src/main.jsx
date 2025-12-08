import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { store } from './app/store.js'
import { Provider, useSelector } from 'react-redux'
import { ClerkProvider } from '@clerk/clerk-react'
import { dark } from '@clerk/themes'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key')
}

// 1. Create a wrapper component that can access Redux state
const ClerkWithTheme = ({ children }) => {
    // Access the theme string ("light" or "dark") from your slice
    const theme = useSelector((state) => state.theme.theme);

    return (
        <ClerkProvider 
            publishableKey={PUBLISHABLE_KEY} 
            appearance={{
                // If theme is 'dark', use the dark theme, otherwise use default (light)
                baseTheme: theme === 'dark' ? dark : undefined
            }}
        >
            {children}
        </ClerkProvider>
    )
}

createRoot(document.getElementById('root')).render(
    
    <Provider store={store}>
        <BrowserRouter>
            <ClerkWithTheme>
                <App />
            </ClerkWithTheme>
        </BrowserRouter>
    </Provider>,
)