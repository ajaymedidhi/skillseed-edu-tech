import React from 'react';
import { motion } from 'framer-motion';

const methods = [
    { icon: "🎭", title: "Storytelling", desc: "Learning through relatable stories and cinematic narratives.", color: "from-amber-400 to-orange-500" },
    { icon: "🌍", title: "Real-World", desc: "Connecting concepts to actual life situations, not just theory.", color: "from-green-400 to-emerald-500" },
    { icon: "🛠️", title: "DIY Projects", desc: "Hands-on projects, digital builds, and interactive workshops.", color: "from-blue-400 to-primary" },
    { icon: "🧩", title: "Game Theory", desc: "Multiplayer challenges that build critical logic and strategy.", color: "from-purple-400 to-pink-500" },
    { icon: "🎥", title: "Visual Sprints", desc: "Micro-learning videos designed for the modern attention span.", color: "from-cyan-400 to-blue-500" },
    { icon: "💡", title: "AI Mentorship", desc: "Personalized guidance through our proprietary Aura AI model.", color: "from-primary to-secondary" }
];

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0 }
};

const MethodologySection = () => {
    return (
        <section className="py-16 md:py-20 lg:py-24 bg-void relative overflow-hidden z-10 border-t border-white/5" id="methodology">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 blur-[150px] rounded-full -z-10"></div>
            
            <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 text-center mb-12 flex flex-col items-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center w-full"
                >
                    <h2 className="max-w-3xl text-3xl md:text-5xl lg:text-5xl font-display font-bold text-white mb-6 leading-tight">
                        Modern Teaching <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Methods</span>
                    </h2>
                    <p className="max-w-3xl text-lg text-slate-400 leading-relaxed mt-4">
                        Ditch the textbooks. We use a combination of storytelling, gamification, and AI to make learning feel like playing.
                    </p>
                </motion.div>
            </div>

            <motion.div
                className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
            >
                {methods.map((method, index) => (
                    <motion.div 
                        key={index} 
                        variants={item}
                        whileHover={{ y: -5, transition: { duration: 0.3 } }}
                        className="p-6 bg-white/5 backdrop-blur border border-white/10 rounded-2xl relative overflow-hidden group h-full flex flex-col items-start text-left hover:bg-white/10 transition-colors"
                    >
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${method.color} opacity-[0.03] group-hover:opacity-10 transition-opacity rounded-bl-full`}></div>
                        
                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-4xl mb-8 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                            {method.icon}
                        </div>
                        <h3 className="text-3xl font-display font-medium text-white mb-4 leading-tight">{method.title}</h3>
                        <p className="text-slate-400 leading-relaxed font-medium text-lg">{method.desc}</p>
                    </motion.div>
                ))}
            </motion.div>
        </section>
    );
};

export default MethodologySection;
