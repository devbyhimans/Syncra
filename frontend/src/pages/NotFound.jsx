import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center px-4 text-center">
      <div className="flex flex-col items-center">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-500/10 text-red-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg">
          <AlertCircle size={40} />
        </div>
        <h1 className="text-6xl md:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 mb-4 tracking-tight">
          404
        </h1>
        <h2 className="text-2xl md:text-3xl font-bold text-zinc-800 dark:text-zinc-200 mb-4">
          Page Not Found
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 max-w-md mx-auto mb-10 text-lg leading-relaxed">
          Oops! It seems you've wandered into unknown territory. The page you are looking for doesn't exist or has been moved.
        </p>
        <Link 
          to="/"
          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-base font-bold shadow-xl shadow-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/40 hover:-translate-y-1 transition-all flex items-center gap-2"
        >
          <Home size={20} />
          Return Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
