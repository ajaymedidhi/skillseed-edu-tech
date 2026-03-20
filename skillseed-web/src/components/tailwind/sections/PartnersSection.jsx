import React from 'react';
import { motion } from 'framer-motion';

const partnersList = [
    "St. Xavier's High", "Delhi Public School", "Ryan International",
    "Tata CSR", "Infosys Foundation", "Reliance Foundation",
    "Teach For India", "Bhumi NGO", "Kendriya Vidyalaya",
    "Wipro Cares", "Army Public School", "U&I Trust"
];

const PartnersSection = () => {
    return (
        <section className="py-16 md:py-20 lg:py-24 bg-void relative overflow-hidden z-10 border-t border-white/5" id="partners">
            <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 mb-12 flex flex-col items-center text-center">
                <h2 className="max-w-3xl text-3xl md:text-5xl lg:text-5xl font-display font-bold text-white mb-6 leading-tight">
                    Trusted by Leading <span className="text-primary italic">Institutions</span>
                </h2>
                <p className="max-w-3xl text-lg text-slate-400 leading-relaxed mt-4">
                    Join 50+ schools and organizations shaping the future of early education.
                </p>
            </div>

            {/* Marquee */}
            <div className="relative flex overflow-x-hidden border-y border-white/5 bg-white/[0.02] py-12 mb-20 whitespace-nowrap">
                <motion.div 
                    className="flex gap-12 px-6"
                    animate={{ x: [0, -1000] }}
                    transition={{ 
                        duration: 30, 
                        repeat: Infinity, 
                        ease: "linear" 
                    }}
                >
                    {[...partnersList, ...partnersList].map((partner, index) => (
                        <div key={index} className="flex items-center gap-3 px-6 py-3 bg-card border border-white/5 rounded-xl shadow-xl">
                            <span className="text-primary text-xl">🏫</span>
                            <span className="text-white font-semibold text-lg">{partner}</span>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* CTA Box */}
            <div className="max-w-5xl mx-auto px-6 md:px-8 lg:px-12">
                <div className="relative p-8 md:p-12 bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-2xl overflow-hidden text-center group bg-white/[0.02] backdrop-blur">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] -z-10"></div>
                    
                    <h3 className="text-3xl md:text-4xl font-display font-bold text-white mb-6">
                        Ready to Transform Your School?
                    </h3>
                    <p className="text-lg text-slate-300 mb-10 max-w-xl mx-auto">
                        Integrate SkillSeed as a Value-Added Course today and give your students a head start.
                    </p>
                    <motion.button 
                        className="px-10 py-5 bg-white text-void font-bold rounded-full hover:bg-primary transition-colors text-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Partner With Us
                    </motion.button>
                </div>
            </div>
        </section>
    );
};

export default PartnersSection;
