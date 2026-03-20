import React from 'react';
import { motion } from 'framer-motion';

const ParentDashboardPreview = () => {
    return (
        <section className="py-16 md:py-20 lg:py-24 bg-[#0B0F1A] border-t border-white/5" id="dashboard">
            <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 text-center space-y-12">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center justify-center text-center space-y-6"
                >
                    <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
                        For Decision Makers
                    </div>
                    <h2 className="max-w-3xl mx-auto text-3xl md:text-5xl lg:text-5xl font-display font-bold text-white leading-tight mt-4">
                        Trust is built on <span className="text-primary italic">Transparency.</span>
                    </h2>
                    <p className="max-w-3xl mx-auto text-lg text-slate-400 leading-relaxed mt-4">
                        We know you want the best for your child. Our Parent Dashboard provides deep insights into their evolving interests, skill maturity, and future readiness—without the pressure of grades.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative group text-left max-w-2xl mx-auto lg:mx-0"
                    >
                        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl relative z-10 text-left h-full">
                            <div className="flex justify-between items-center mb-8">
                                <h4 className="text-white font-bold text-sm">Real-time Insights</h4>
                                <span className="text-[10px] text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-widest font-bold border border-primary/20">Active Analysis</span>
                            </div>
                            
                            <div className="space-y-8">
                                <div className="grid grid-cols-3 gap-4">
                                    {[
                                        { label: 'XP Earned', val: '12,450', color: 'text-primary' },
                                        { label: 'Skill Score', val: '88%', color: 'text-emerald-400' },
                                        { label: 'Modules', val: '24', color: 'text-secondary' }
                                    ].map((stat, i) => (
                                        <div key={i} className="p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                                            <div className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider font-bold">{stat.label}</div>
                                            <div className={`text-xl font-display font-bold ${stat.color}`}>{stat.val}</div>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        <span>AI Literacy & Logic</span>
                                        <span className="text-primary">Mastery Level</span>
                                    </div>
                                    <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden p-[1px]">
                                        <div className="h-full w-[85%] bg-gradient-to-r from-primary to-secondary rounded-full shadow-[0_0_15px_rgba(0,242,254,0.4)]"></div>
                                    </div>
                                </div>

                                <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 space-y-3 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-2xl rounded-full"></div>
                                    <div className="text-xs font-bold text-primary flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                                        Aura AI Insight
                                    </div>
                                    <p className="text-sm text-slate-400 leading-relaxed italic">"Aarav shows a strong aptitude for logical systems. We suggest exploring the 'UX Design' sprint next."</p>
                                </div>
                            </div>
                        </div>
                        <div className="absolute inset-0 bg-primary/5 blur-[100px] -z-0 rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-1000"></div>
                    </motion.div>

                    <div className="space-y-10 text-left lg:pl-8">
                        <ul className="grid grid-cols-1 gap-4">
                            {[
                                'Interest Cluster Reports',
                                'Skill Maturity Scoring',
                                'Career Time Machine Previews',
                                'Weekly Growth Digests'
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-4 text-slate-300 p-4 rounded-2xl bg-white/5 backdrop-blur border border-white/10 hover:border-primary/20 transition-colors group">
                                    <span className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] text-primary group-hover:bg-primary group-hover:text-void transition-all">✓</span>

                                    <span className="font-medium">{item}</span>
                                </li>
                            ))}
                        </ul>
                        
                        <button className="w-full sm:w-auto px-10 py-5 bg-primary text-void font-bold rounded-2xl shadow-xl shadow-primary/20 hover:bg-white hover:scale-[1.02] transition-all transform active:scale-95">
                            Claim Parent Pass &rarr;
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ParentDashboardPreview;
