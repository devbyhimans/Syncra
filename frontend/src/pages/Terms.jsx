import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors mb-8 font-medium">
          <ArrowLeft size={16} /> Back to Home
        </Link>
        <div className="bg-white dark:bg-zinc-900 p-8 md:p-12 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800">
          <h1 className="text-4xl font-extrabold mb-8 text-zinc-900 dark:text-white tracking-tight">Terms of Service</h1>
          
          <div className="space-y-8 text-zinc-600 dark:text-zinc-400 leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200 mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing or using the Syncra service, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200 mb-4">2. Description of Service</h2>
              <p>
                Syncra is a project management and collaboration platform that provides tools for task tracking, team communication, and workspace organization. We reserve the right to modify or discontinue, temporarily or permanently, the service with or without notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200 mb-4">3. User Accounts</h2>
              <p>
                When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200 mb-4">4. Acceptable Use</h2>
              <p>
                You agree not to use the service for any unlawful purpose or in any way that could damage, disable, overburden, or impair our servers or networks. You are solely responsible for all content you post or transmit via the service.
              </p>
            </section>
            
            <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800 text-sm">
              <p>Last updated: August 2026</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
