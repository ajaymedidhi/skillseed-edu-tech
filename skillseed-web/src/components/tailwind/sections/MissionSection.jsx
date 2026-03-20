import React from 'react';
import { motion } from 'framer-motion';

const MissionSection = () => {
    return (
        <section className="relative py-16 md:py-20 lg:py-24 bg-void/50 overflow-hidden z-10 border-t border-white/5">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[100px] -z-10"></div>
            
            <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 text-center flex flex-col items-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="space-y-8 w-full flex flex-col items-center"
                >
                    <div className="inline-block px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-primary text-xs font-bold uppercase tracking-widest leading-none">
                        Our Mission
                    </div>
                    
                    <h2 className="max-w-4xl text-3xl md:text-5xl lg:text-5xl font-display font-bold text-white relative leading-tight mt-4">
                        Empowering the next generation with <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent italic">Future-Ready Skills</span>
                    </h2>
                    
                    <p className="max-w-2xl text-lg md:text-xl text-slate-400 font-medium leading-relaxed italic mt-4">
                        "To empower every student with career clarity, life confidence, and the practical skills to thrive in the 2030 economy."
                    </p>
                    
                    <motion.div 
                        className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl mt-10 backdrop-blur"
                        whileHover={{ scale: 1.05 }}
                    >
                        <span className="text-2xl">🇮🇳</span>
                        <div className="text-left">
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Vision Alignment</div>
                            <div className="text-sm text-white font-bold">Aligned with NEP 2020</div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

export default MissionSection;
