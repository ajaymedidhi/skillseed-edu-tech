import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqData = [
    {
        question: "What age group are SkillSeed programs for?",
        answer: "We currently cater to students from classes 6 to 10, tailoring content for each stage of growth and career discovery."
    },
    {
        question: "Are sessions online or offline?",
        answer: "We offer both formats depending on school partnership and student needs. Hybrid learning is our core model!"
    },
    {
        question: "How can schools collaborate?",
        answer: "Schools can reach out via the contact form. We'll schedule a discovery call to customize the program and curriculum."
    },
    {
        question: "Can individuals register directly?",
        answer: "Yes! Individual students and parents can register for our direct weekend bootcamps and AI exploration sprints."
    }
];

const ContactSection = () => {
    const [formStatus, setFormStatus] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [openIndex, setOpenIndex] = useState(0);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSending(true);
        setTimeout(() => {
            setFormStatus("Success! We'll orbit back to you shortly.");
            setIsSending(false);
            e.target.reset();
            setTimeout(() => setFormStatus(''), 5000);
        }, 1500);
    };

    return (
        <section className="py-16 md:py-20 lg:py-24 bg-void relative overflow-hidden z-10 border-t border-white/5" id="contact">
            {/* Background Glow */}
            <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-secondary/5 blur-[120px] -z-10"></div>
            
            <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-start">
                
                {/* FAQ Column */}
                <div className="space-y-12">
                    <div>
                        <h2 className="text-3xl md:text-5xl lg:text-5xl font-display font-bold text-white relative leading-tight mb-6">
                            Empowering students with <br className="hidden lg:block"/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Future-Ready Skills</span>
                        </h2>
                        <p className="text-slate-400 text-lg">Everything you need to know about starting your discovery journey.</p>
                    </div>

                    <div className="space-y-4">
                        {faqData.map((item, index) => (
                            <div 
                                key={index} 
                                className={`border ${openIndex === index ? 'border-secondary/30 bg-secondary/5' : 'border-white/5 bg-white/[0.02]'} rounded-2xl transition-all duration-300 overflow-hidden`}
                            >
                                <button 
                                    className="w-full px-6 py-5 text-left flex items-center justify-between group"
                                    onClick={() => setOpenIndex(index === openIndex ? -1 : index)}
                                >
                                    <span className={`font-semibold text-lg ${openIndex === index ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                                        {item.question}
                                    </span>
                                    <span className={`text-2xl transition-transform duration-300 ${openIndex === index ? 'rotate-45 text-secondary' : 'text-slate-500'}`}>+</span>
                                </button>
                                <AnimatePresence>
                                    {openIndex === index && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div className="px-6 pb-6 text-slate-400 leading-relaxed font-medium">
                                                {item.answer}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Column */}
                <div className="relative">
                    <div className="p-8 md:p-12 bg-white/5 border border-white/10 backdrop-blur rounded-2xl shadow-2xl relative z-10">
                        <h3 className="text-3xl font-display font-bold text-white mb-2">Get in Touch</h3>
                        <p className="text-slate-400 mb-8">Send us a message and we'll get back to you within 24 hours.</p>

                        <form onSubmit={handleSubmit} className="space-y-6 text-left">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-300 uppercase tracking-wider block">Your Name</label>
                                <input 
                                    type="text" 
                                    required 
                                    className="w-full bg-void/80 border border-white/20 rounded-2xl px-6 py-4 text-white focus:border-primary outline-none transition-all placeholder:text-slate-600"
                                    placeholder="Enter your name"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-300 uppercase tracking-wider block">Email Address</label>
                                <input 
                                    type="email" 
                                    required 
                                    className="w-full bg-void/80 border border-white/20 rounded-2xl px-6 py-4 text-white focus:border-primary outline-none transition-all placeholder:text-slate-600"
                                    placeholder="your@email.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-300 uppercase tracking-wider block">Message</label>
                                <textarea 
                                    rows="4" 
                                    required 
                                    className="w-full bg-void/80 border border-white/20 rounded-2xl px-6 py-4 text-white focus:border-primary outline-none transition-all resize-none placeholder:text-slate-600"
                                    placeholder="How can we help you?"
                                ></textarea>
                            </div>
                            
                            <motion.button 
                                className="w-full py-4 bg-primary text-void font-bold rounded-full shadow-lg hover:shadow-[0_0_20px_rgba(0,242,254,0.4)] transition-all text-lg hover:bg-white"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={isSending}
                            >
                                {isSending ? 'Sending Pulse...' : 'Send Message'}
                            </motion.button>
                            
                            {formStatus && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-center text-secondary font-bold"
                                >
                                    {formStatus}
                                </motion.div>
                            )}
                        </form>
                    </div>
                    {/* Floating Glow */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 blur-[60px] rounded-full -z-0"></div>
                </div>
            </div>
        </section>
    );
};

export default ContactSection;
