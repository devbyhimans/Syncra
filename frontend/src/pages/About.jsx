import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Users, Target, Shield } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors mb-8 font-medium">
          <ArrowLeft size={16} /> Back to Home
        </Link>
        
        <div className="bg-white dark:bg-zinc-900 p-8 md:p-16 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800 text-center mb-8">
          <h1 className="text-5xl font-extrabold mb-6 text-zinc-900 dark:text-white tracking-tight">About Syncra</h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            We are building the next generation of project management tools. Designed for speed, clarity, and premium user experience.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 text-center">
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-500/10 text-blue-600 mx-auto rounded-2xl flex items-center justify-center mb-6">
              <Target size={28} />
            </div>
            <h3 className="text-xl font-bold mb-3">Our Mission</h3>
            <p className="text-zinc-600 dark:text-zinc-400">To eliminate chaos from team workflows and make project execution seamless and predictable.</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 text-center">
            <div className="w-14 h-14 bg-purple-100 dark:bg-purple-500/10 text-purple-600 mx-auto rounded-2xl flex items-center justify-center mb-6">
              <Users size={28} />
            </div>
            <h3 className="text-xl font-bold mb-3">Built for Teams</h3>
            <p className="text-zinc-600 dark:text-zinc-400">Whether you're a startup or a seasoned enterprise, Syncra adapts to how your team works.</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 text-center">
            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 mx-auto rounded-2xl flex items-center justify-center mb-6">
              <Shield size={28} />
            </div>
            <h3 className="text-xl font-bold mb-3">Secure by Design</h3>
            <p className="text-zinc-600 dark:text-zinc-400">Your data privacy and security are our top priorities, powered by industry-leading infrastructure.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default About;
