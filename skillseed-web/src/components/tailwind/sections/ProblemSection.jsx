import React from 'react';
import { motion } from 'framer-motion';

const ProblemSection = () => {
    return (
        <section className="py-16 md:py-20 lg:py-24 bg-void relative z-10 border-t border-white/5" id="why-us">
            <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 text-center flex flex-col items-center">
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="space-y-8 w-full flex flex-col items-center"
                >
                    <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
                        The Reality Loop
                    </div>
                    <h2 className="max-w-3xl text-3xl md:text-5xl lg:text-5xl font-display font-bold text-white leading-tight mt-4">
                        School teaches you <span className="italic">what</span> to think, but not <span className="italic">who</span> to be.
                    </h2>
                    <p className="max-w-3xl text-lg text-slate-400 leading-relaxed mt-4">
                        In a world moving at the speed of AI, traditional education leaves students with degrees but without direction. 
                        SkillSeed bridges this gap by helping students discover their intrinsic interests and build the skills that actually matter in the 2030 economy.
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6 w-full max-w-5xl">
                        {[
                            { title: 'The Confusion', desc: "85% of students are unsure about their career paths in Class 10." },
                            { title: 'The Skills Gap', desc: "Technical skills represent only 30% of what modern employers seek." }
                        ].map((stat, i) => (
                            <div key={i} className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur hover:bg-white/10 transition-colors text-left group">
                                <h4 className="text-white font-bold mb-3 text-lg group-hover:text-primary transition-colors">{stat.title}</h4>
                                <p className="text-sm text-slate-500 leading-relaxed group-hover:text-slate-400 transition-colors uppercase font-bold tracking-widest">{stat.desc}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="mt-16 md:mt-20 relative max-w-3xl mx-auto w-full px-4 md:px-0"
                >
                    <div className="min-h-[350px] md:min-h-0 md:aspect-[21/9] rounded-2xl bg-white/5 border border-white/10 p-8 md:p-12 flex items-center justify-center relative overflow-hidden group backdrop-blur">
                        {/* Decorative elements */}
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent opacity-50"></div>
                        
                        <div className="relative z-10 text-center space-y-4 md:space-y-6 max-w-lg">
                            <div className="w-16 h-16 md:w-20 md:h-20 mx-auto rounded-2xl md:rounded-3xl bg-void border border-white/10 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                                <span className="text-3xl md:text-4xl animate-bounce">🤔</span>
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold font-display text-white">Feeling Lost?</h3>
                            <p className="text-slate-400 text-sm md:text-base leading-relaxed">Most students spend 15 years in education before discovering what they truly love. We change that.</p>
                            <button className="text-primary font-bold text-sm underline underline-offset-8 decoration-primary/30 hover:decoration-primary transition-all">See the Solution &rarr;</button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default ProblemSection;
