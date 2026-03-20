import React from 'react';
import { motion } from 'framer-motion';
import logoImg from '../../assets/images/logo.png';

const skills = [
    { name: 'Career Guidance', icon: '🧭', orbit: 1, duration: 25, delay: 0 },
    { name: 'Communication', icon: '🗣️', orbit: 2, duration: 45, delay: 5 },
    { name: 'Entrepreneurship', icon: '💡', orbit: 1, duration: 35, delay: 18 },
    { name: 'AI Literacy', icon: '🤖', orbit: 3, duration: 60, delay: 12 },
    { name: 'Problem Solving', icon: '🧩', orbit: 2, duration: 52, delay: 28 },
    { name: 'Leadership', icon: '👑', orbit: 3, duration: 55, delay: 35 },
];

const HeroTailwind = () => {
    return (
        <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 lg:pb-24 overflow-hidden min-h-screen flex flex-col justify-center bg-void">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full bg-universe -z-10 opacity-60"></div>
            
            {/* Center glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center relative z-10 w-full">
                
                {/* Left Content (Text) */}
                <div className="flex flex-col space-y-6 text-center lg:text-left max-w-xl mx-auto lg:mx-0 mb-16 lg:mb-0 shrink-0">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium mx-auto lg:mx-0 backdrop-blur-sm w-fit mb-4"
                    >
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                        <span className="text-slate-300">Empowering Students in 50+ Leading Schools</span>
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-5xl md:text-6xl xl:text-7xl font-display font-bold text-white leading-[1.1] tracking-tight relative"
                    >
                        Your Future, <br className="hidden md:block lg:hidden" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary relative flex-inline">
                            Now in Orbit.
                        </span>
                    </motion.h1>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-lg md:text-xl text-slate-400 leading-relaxed font-medium"
                    >
                        Don't just pick a career—build one. SkillSeed helps students in Classes 6-10 discover their genius through AI-guided exploration and real-world projects.
                    </motion.p>
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-4"
                    >
                        <button className="px-8 py-4 rounded-full bg-primary text-void font-bold hover:bg-white transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(0,242,254,0.4)]">
                            Start Your Discovery (Free)
                        </button>
                        <button className="flex items-center gap-3 px-6 py-4 rounded-full bg-white/5 hover:bg-white/10 text-white font-medium border border-white/10 transition-colors group">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-primary group-hover:text-void transition-colors">
                                <svg className="w-3 h-3 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                            </div>
                            Watch Video
                        </button>
                    </motion.div>
                </div>

                {/* Right Visual - Orbital Solar System */}
                <div className="relative w-full aspect-square max-w-[500px] lg:max-w-[650px] mx-auto flex items-center justify-center">
                    
                    {/* Sun: SkillSeed Logo */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                        <motion.div 
                            animate={{ 
                                scale: [1, 1.05, 1],
                                filter: [
                                    "drop-shadow(0 0 20px rgba(0, 242, 254, 0.3))", 
                                    "drop-shadow(0 0 40px rgba(0, 242, 254, 0.6))", 
                                    "drop-shadow(0 0 20px rgba(0, 242, 254, 0.3))"
                                ]
                            }}
                            transition={{ duration: 4, repeat: Infinity }}
                        >
                            <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-full border-4 border-primary/30 flex items-center justify-center relative overflow-hidden shadow-[0_0_30px_rgba(0,242,254,0.4)]">
                                <img src={logoImg} alt="SkillSeed" className="w-[70%] h-auto object-contain relative z-10" />
                                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent"></div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Orbital Rings */}
                    {[1, 2, 3].map((r) => (
                        <div 
                            key={r} 
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-white/10 rounded-full"
                            style={{ 
                                width: `${r * 33.3}%`, 
                                height: `${r * 33.3}%`,
                                maxWidth: `${r * 180}px`,
                                maxHeight: `${r * 180}px`
                            }}
                        />
                    ))}

                    {/* Planets: Skills */}
                    {skills.map((skill, index) => (
                        <div
                            key={index}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                            style={{ 
                                width: `${skill.orbit * 33.3}%`,
                                height: `${skill.orbit * 33.3}%`,
                                maxWidth: `${skill.orbit * 180}px`,
                                maxHeight: `${skill.orbit * 180}px`,
                            }}
                        >
                            <motion.div
                                className="w-full h-full pointer-events-auto"
                                animate={{ rotate: 360 }}
                                transition={{ 
                                    duration: skill.duration, 
                                    repeat: Infinity, 
                                    ease: "linear",
                                    delay: -skill.delay 
                                }}
                            >
                                <motion.div 
                                    className={`absolute bg-void/80 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full flex items-center gap-2 shadow-lg cursor-pointer hover:border-primary transition-colors hover:z-30`}
                                    style={{ 
                                        top: index % 2 === 0 ? '0' : 'auto',
                                        bottom: index % 2 === 0 ? 'auto' : '0',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        transformOrigin: 'center'
                                    }}
                                    animate={{ rotate: -360 }}
                                    transition={{ 
                                        duration: skill.duration, 
                                        repeat: Infinity, 
                                        ease: "linear",
                                        delay: -skill.delay
                                    }}
                                >
                                    <span className="text-xl">{skill.icon}</span>
                                    <span className="text-xs font-bold text-white whitespace-nowrap">{skill.name}</span>
                                 </motion.div>
                            </motion.div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Floating feature Highlights */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden lg:flex gap-8 px-6">
                {['Personalized Discovery', 'Skill Sprints', 'Future Roadmaps'].map((feature) => (
                    <div key={feature} className="flex items-center gap-3 text-slate-500 text-sm font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/50 shadow-[0_0_10px_rgba(0,242,254,0.5)]"></span>
                        {feature}
                    </div>
                ))}
            </div>
        </section>
    );
};

export default HeroTailwind;
