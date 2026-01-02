import React from 'react';
import { ArrowRight, CheckCircle, Layers, Layout } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useUser } from "@clerk/clerk-react";

const LandingPage = () => {
  const { isSignedIn, isLoaded } = useUser();

  // 1. If user is already logged in, redirect to Dashboard immediately
  if (isLoaded && isSignedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans selection:bg-blue-100">
      
      {/* Navbar */}
      <nav className="w-full px-8 md:px-20 py-6 flex justify-between items-center border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          {/* Logo Icon */}
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">S</div>
          <span className="text-2xl font-bold tracking-tight text-gray-900">Syncra</span>
        </div>
        
        <div className="flex gap-4">
          <Link to="/sign-in">
            <button className="px-5 py-2 text-gray-600 font-medium hover:text-blue-600 transition-colors">
              Log In
            </button>
          </Link>
          <Link to="/dashboard">
            <button className="px-5 py-2 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 transition-all">
              Get Started
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="w-full px-8 md:px-20 py-20 lg:py-32 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 space-y-8">
            <div className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 font-semibold rounded-full text-sm">
              🚀 Version 2.0 is live
            </div>
            <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight text-gray-900">
              Manage Projects Effortlessly with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Syncra</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-xl leading-relaxed">
              Syncra helps teams collaborate, organize workflows, manage tasks, and track progress—all in one clean and powerful dashboard.
            </p>
            
            {/* 2. Link "Get Started" to the Dashboard route */}
            <div className="flex gap-4 pt-4">
              <Link to="/dashboard">
                <button className="px-8 py-4 bg-blue-600 text-white rounded-xl text-lg font-semibold shadow-lg shadow-blue-600/20 hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-2">
                  Get Started <ArrowRight size={20} />
                </button>
              </Link>
              <Link to="/demo"> 
                 {/* Optional secondary action */}
                <button className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-all">
                  View Demo
                </button>
              </Link>
            </div>
          </div>

          <div className="flex-1 w-full">
            {/* CSS-only Mock Dashboard (No images required) */}
            <div className="relative rounded-2xl shadow-2xl border border-gray-200 bg-white p-2 md:p-4 rotate-1 hover:rotate-0 transition-transform duration-500">
              <div className="aspect-video bg-gray-50 rounded-xl overflow-hidden flex flex-col border">
                 <div className="h-12 border-b bg-white flex items-center px-4 gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                 </div>
                 <div className="flex-1 flex">
                    <div className="w-16 md:w-48 border-r bg-gray-50/50 p-4 space-y-3 hidden md:block">
                       <div className="h-2 w-20 bg-gray-200 rounded"></div>
                       <div className="h-2 w-16 bg-gray-200 rounded"></div>
                       <div className="h-2 w-24 bg-gray-200 rounded"></div>
                    </div>
                    <div className="flex-1 p-6 space-y-4">
                       <div className="flex justify-between">
                          <div className="h-8 w-32 bg-gray-200 rounded"></div>
                          <div className="h-8 w-8 bg-blue-100 rounded-full"></div>
                       </div>
                       <div className="grid grid-cols-3 gap-4">
                          <div className="h-24 bg-blue-50 rounded-lg border border-blue-100"></div>
                          <div className="h-24 bg-purple-50 rounded-lg border border-purple-100"></div>
                          <div className="h-24 bg-orange-50 rounded-lg border border-orange-100"></div>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full px-8 md:px-20 py-24 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
             <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">How Syncra Works</h2>
             <p className="text-xl text-gray-500 max-w-2xl mx-auto">Simplify your workflow in three easy steps. Designed for speed and efficiency.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 group">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Layers size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">1. Create Workspaces</h3>
              <p className="text-gray-600 leading-relaxed">
                Group your projects inside dedicated workspaces. Keep your personal and professional work completely separate.
              </p>
            </div>

            <div className="p-8 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 group">
              <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Layout size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">2. Add Projects</h3>
              <p className="text-gray-600 leading-relaxed">
                Define goals, set timelines, and start planning your workflow instantly with our intuitive project templates.
              </p>
            </div>

            <div className="p-8 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 group">
              <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <CheckCircle size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">3. Manage Tasks</h3>
              <p className="text-gray-600 leading-relaxed">
                Assign tasks to team members, track real-time progress, and never miss a deadline with automated reminders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Step-by-step guide */}
      <section className="w-full px-8 md:px-20 py-24 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">Get Started in Minutes</h2>

          <div className="space-y-6">
            {[
              { title: "Create an account", desc: "Join or create your workspace securely." },
              { title: "Start a Project", desc: "Click the New Project button to set up your workflow." },
              { title: "Assign & Track", desc: "Add tasks, assign members, and set deadlines." },
              { title: "Analyze Progress", desc: "Use dashboards to track overdue tasks and activity." }
            ].map((step, index) => (
              <div key={index} className="flex gap-6 items-start p-6 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-blue-200 transition-colors">
                <span className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white text-xl font-bold rounded-full flex items-center justify-center shadow-lg shadow-blue-600/20">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-1">{step.title}</h4>
                  <p className="text-gray-600">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-12 bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">S</div>
            <span className="text-xl font-bold text-gray-900">Syncra</span>
          </div>
          <p className="text-gray-500 text-sm">© 2025 Syncra. All rights reserved.</p>
          <div className="flex gap-6 text-gray-500">
             <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
             <a href="#" className="hover:text-blue-600 transition-colors">Terms</a>
             <a href="#" className="hover:text-blue-600 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;