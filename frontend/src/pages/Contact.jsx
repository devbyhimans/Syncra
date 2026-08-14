import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, MessageSquare, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call for form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setFormData({ name: '', email: '', message: '' });
      toast.success("Thanks for reaching out! We'll get back to you soon.");
    }, 1000);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors mb-8 font-medium">
          <ArrowLeft size={16} /> Back to Home
        </Link>
        
        <div className="grid md:grid-cols-2 gap-12 bg-white dark:bg-zinc-900 p-8 md:p-12 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800">
          
          {/* Left Column: Info */}
          <div>
            <h1 className="text-4xl font-extrabold mb-6 text-zinc-900 dark:text-white tracking-tight">Get in touch</h1>
            <p className="text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
              Have a question about Syncra? Want to request a feature, report a bug, or just say hi? We'd love to hear from you.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4 text-zinc-700 dark:text-zinc-300">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-full flex items-center justify-center">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="font-semibold">Email us</p>
                  <p className="text-sm text-zinc-500">hello@syncra.com</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-zinc-700 dark:text-zinc-300">
                <div className="w-12 h-12 bg-purple-50 dark:bg-purple-500/10 text-purple-600 rounded-full flex items-center justify-center">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <p className="font-semibold">Support</p>
                  <p className="text-sm text-zinc-500">support@syncra.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Name</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Message</label>
                <textarea 
                  id="message" 
                  name="message" 
                  required
                  rows="4"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white resize-none"
                  placeholder="How can we help?"
                ></textarea>
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending...' : (
                  <>Send Message <Send size={18} /></>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
