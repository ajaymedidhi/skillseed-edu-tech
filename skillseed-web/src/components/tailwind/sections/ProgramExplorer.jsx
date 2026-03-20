import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const programs = [
    { 
        id: 'career', 
        name: 'Career Guidance', 
        icon: '🧭', 
        color: 'from-primary to-secondary',
        colorHex: '#00f2fe',
        stats: ['Self-Discovery', 'Path Mapping', 'AI Mentor'],
        desc: 'Understand your unique strengths and explore potential futures that align with your passions.'
    },
    { 
        id: 'communication', 
        name: 'Communication', 
        icon: '🗣️', 
        color: 'from-secondary to-accent',
        colorHex: '#4facfe',
        stats: ['Public Speaking', 'Debate', 'Storytelling'],
        desc: 'Master the art of expressing your ideas clearly and confidently in any situation.'
    },
    { 
        id: 'entrepreneurship', 
        name: 'Entrepreneurship', 
        icon: '💡', 
        color: 'from-accent to-primary',
        colorHex: '#10B981',
        stats: ['Ideation', 'Business Models', 'Pitching'],
        desc: 'Learn to identify problems, build solutions, and present your ideas to the world.'
    },
    { 
        id: 'tech_design', 
        name: 'Tech & Design', 
        icon: '💻', 
        color: 'from-primary to-accent',
        colorHex: '#00f2fe',
        stats: ['Coding', 'UI/UX Design', 'Digital Tools'],
        desc: 'Gain practical technical skills to build the tools and platforms of tomorrow.'
    }
];

const ProgramExplorer = () => {
    const [activeTab, setActiveTab] = useState('career');
    const currentProg = programs.find(p => p.id === activeTab);

    return (
        <section id="programs" className="py-16 md:py-20 lg:py-24 bg-void relative z-10 border-t border-white/5">
            <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 text-center flex flex-col items-center">
                <div className="max-w-3xl space-y-4 mb-10 flex flex-col items-center w-full">
                    <h2 className="max-w-3xl text-3xl md:text-5xl lg:text-5xl font-display font-bold text-white leading-tight">
                        Handpicked programs designed to turn curious students into future creators.
                    </h2>
                </div>

                <div className="flex flex-col items-center justify-center space-y-8 w-full">
                    {/* Tabs Centered */}
                    <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 scrollbar-hide py-2">
                        {programs.map(program => (
                            <button
                                key={program.id}
                                onClick={() => setActiveTab(program.id)}
                                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                                    activeTab === program.id
                                    ? `text-white border border-primary/30 shadow-[0_0_15px_rgba(0,242,254,0.15)]`
                                    : 'text-slate-400 hover:text-white border border-transparent hover:border-white/10 hover:bg-white/5'
                                }`}
                                style={{
                                    backgroundColor: activeTab === program.id ? `${program.colorHex}25` : undefined
                                }}
                            >
                                {program.name}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 min-h-[400px] mt-12 text-left">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="lg:col-span-12"
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 lg:p-12 overflow-hidden relative backdrop-blur">
                                <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-br ${currentProg.color} opacity-10 blur-[100px] -z-10`}></div>

                                <div className="space-y-8">
                                    <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${currentProg.color} flex items-center justify-center text-4xl shadow-xl`}>
                                        {currentProg.icon}
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-3xl font-display font-bold text-white">{currentProg.name}</h3>
                                        <p className="text-lg text-slate-400 leading-relaxed italic">"{currentProg.desc}"</p>
                                    </div>
                                    <div className="flex flex-wrap gap-4">
                                        {currentProg.stats.map((s, i) => (
                                            <div key={i} className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest bg-primary/10 px-4 py-2 rounded-lg border border-primary/20">
                                                <span>✓</span> {s}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-8">
                                    <button className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-void font-bold text-sm tracking-wide hover:bg-gray-200 transition-colors shadow-lg">
                                        Explore Curriculum
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                    </button>
                                </div>
                                </div>

                                <div className="hidden lg:flex justify-center relative">
                                    <div className="w-full aspect-video rounded-2xl bg-void border border-white/10 p-4 shadow-2xl relative overflow-hidden">
                                        {/* Mock dashboard content */}
                                        <div className="flex items-center gap-2 border-b border-white/5 pb-2 mb-4">
                                            <div className="w-2 h-2 rounded-full bg-red-400"></div>
                                            <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                                            <div className="w-2 h-2 rounded-full bg-green-400"></div>
                                            <div className="text-[10px] text-slate-500 font-mono ml-2">skillseed.app/learning-module-1</div>
                                        </div>
                                        <div className="space-y-3">
                                              {/* Video Placeholder */}
                                            <div className="h-48 md:h-64 rounded-2xl bg-void/50 border border-white/5 flex items-center justify-center">
                                                <div className="p-4 rounded-full bg-white/5 border border-white/10 text-primary group-hover:bg-primary group-hover:text-void transition-colors transition-duration-300">
                                                    <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 pt-2">
                                                <div className="h-8 w-full bg-primary/20 rounded-lg"></div>
                                                <div className="h-8 w-full bg-white/5 rounded-lg"></div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Floating accent */}
                                    <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/20 blur-3xl rounded-full animate-pulse"></div>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
};

export default ProgramExplorer;
