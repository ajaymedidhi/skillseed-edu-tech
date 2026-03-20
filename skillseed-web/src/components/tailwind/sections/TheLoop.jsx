import React from 'react';
import { motion } from 'framer-motion';

const steps = [
    { 
        id: 'discover', 
        title: 'Discover', 
        icon: '🔭', 
        desc: 'AI-guided assessment for interest and personality analysis.',
        color: 'from-blue-500/20 to-cyan-500/20'
    },
    { 
        id: 'learn', 
        title: 'Learn', 
        icon: '📚', 
        desc: 'Bite-sized Skill Sprints tailored to your discovery path.',
        color: 'from-cyan-500/20 to-emerald-500/20'
    },
    { 
        id: 'practice', 
        title: 'Practice', 
        icon: '🛠️', 
        desc: 'Simulated real-world tasks and micro-labs.',
        color: 'from-emerald-500/20 to-teal-500/20'
    },
    { 
        id: 'build', 
        title: 'Build', 
        icon: '🚀', 
        desc: 'Complete Capstone Missions and grow your global portfolio.',
        color: 'from-teal-500/20 to-primary/20'
    }
];

const TheLoop = () => {
    return (
        <section className="py-16 md:py-20 lg:py-24 bg-void/50 relative z-10 border-t border-white/5">
            <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 text-center flex flex-col items-center">
                <div className="space-y-4 max-w-3xl flex flex-col items-center w-full">
                    <h2 className="max-w-3xl text-3xl md:text-5xl lg:text-5xl font-display font-bold text-white leading-tight">The Career Discovery Cycle</h2>
                    <p className="max-w-3xl text-lg text-slate-400 leading-relaxed mt-4">A continuous loop of growth, designed specifically for school students to explore their future at their own pace.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mt-12 w-full">
                    {steps.map((step, index) => (
                        <motion.div
                            key={step.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="relative group lg:mt-0 mt-8"
                        >
                            {/* Connector line for desktop */}
                            {index < steps.length - 1 && (
                                <div className="hidden lg:block absolute top-[15%] left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-primary/20 to-transparent z-0"></div>
                            )}

                            <div className="relative z-10 w-full p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 transition-all duration-500 backdrop-blur hover:bg-white/10 overflow-hidden text-left h-full flex flex-col">
                                {/* Gradient Bg */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-100 transition-opacity duration-700`}></div>
                                
                                <div className="space-y-4 relative z-10 flex-grow">
                                    <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                                        {step.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-white">{step.title}</h3>
                                    <p className="text-sm text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                                        {step.desc}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TheLoop;
