import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors mb-8 font-medium">
          <ArrowLeft size={16} /> Back to Home
        </Link>
        <div className="bg-white dark:bg-zinc-900 p-8 md:p-12 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800">
          <h1 className="text-4xl font-extrabold mb-8 text-zinc-900 dark:text-white tracking-tight">Privacy Policy</h1>
          
          <div className="space-y-8 text-zinc-600 dark:text-zinc-400 leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200 mb-4">1. Information We Collect</h2>
              <p>
                When you use Syncra, we may collect information that you provide directly to us, such as when you create an account, update your profile, use the interactive features of our services, or communicate with us. This includes your name, email address, and profile information provided via our authentication provider (Clerk).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200 mb-4">2. How We Use Your Information</h2>
              <p>
                We use the information we collect to provide, maintain, and improve our services, to process transactions, to send you related information including confirmations and invoices, and to send you technical notices, updates, security alerts, and support and administrative messages.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200 mb-4">3. Data Security</h2>
              <p>
                We take reasonable measures to help protect information about you from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction. However, no security system is impenetrable, and we cannot guarantee the absolute security of our databases.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200 mb-4">4. Third-Party Services</h2>
              <p>
                Syncra uses third-party services like Clerk for authentication. These services may collect information as dictated by their own privacy policies. We encourage you to review their privacy policies to learn more about their practices.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200 mb-4">5. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at privacy@syncra.com.
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

export default Privacy;
