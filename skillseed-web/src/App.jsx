import React from 'react';
import NavbarTailwind from './components/tailwind/NavbarTailwind';
import HeroTailwind from './components/tailwind/HeroTailwind';
import MissionSection from './components/tailwind/sections/MissionSection';
import ProblemSection from './components/tailwind/sections/ProblemSection';
import TheLoop from './components/tailwind/sections/TheLoop';
import ProgramExplorer from './components/tailwind/sections/ProgramExplorer';
import MethodologySection from './components/tailwind/sections/MethodologySection';
import ParentDashboardPreview from './components/tailwind/sections/ParentDashboardPreview';
import PartnersSection from './components/tailwind/sections/PartnersSection';
import ContactSection from './components/tailwind/sections/ContactSection';

const App = () => {
    return (
        <div className="bg-void min-h-screen font-sans text-slate-300 overflow-x-hidden selection:bg-primary selection:text-void">
            <NavbarTailwind />
            <main>
                <HeroTailwind />
                <MissionSection />
                <ProblemSection />
                <TheLoop />
                <ProgramExplorer />
                <MethodologySection />
                <ParentDashboardPreview />
                <PartnersSection />
                <ContactSection />
            </main>
            <footer className="bg-void border-t border-white/5 py-16 md:py-20 lg:py-24 relative overflow-hidden">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full bg-primary/5 blur-[120px] -z-10"></div>
                
                <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8 items-start">
                    
                    {/* Brand Column */}
                    <div className="col-span-1 md:col-span-6 lg:col-span-6 space-y-6 md:pr-12">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl font-display font-bold italic tracking-tighter text-white">SkillSeed</span>
                        </div>
                        <p className="text-slate-400 max-w-sm font-medium leading-relaxed">
                            Planting skills early to grow future careers. Empowering students in Classes 6-10 with crucial real-world skills.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="col-span-1 md:col-span-3 lg:col-span-3 flex flex-col md:items-start lg:items-center">
                        <div className="space-y-6">
                            <h4 className="text-white font-bold tracking-wide uppercase text-sm">Quick Links</h4>
                            <ul className="space-y-4 text-sm font-medium">
                                <li><a href="#hero" className="text-slate-400 hover:text-primary transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary/30"></span>Orbit</a></li>
                                <li><a href="#programs" className="text-slate-400 hover:text-primary transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary/30"></span>Programs</a></li>
                                <li><a href="#methodology" className="text-slate-400 hover:text-primary transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary/30"></span>Methodology</a></li>
                                <li><a href="#partners" className="text-slate-400 hover:text-primary transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary/30"></span>Partners</a></li>
                            </ul>
                        </div>
                    </div>

                    {/* Connect */}
                    <div className="col-span-1 md:col-span-3 lg:col-span-3 flex flex-col md:items-start lg:items-center">
                        <div className="space-y-6">
                            <h4 className="text-white font-bold tracking-wide uppercase text-sm">Connect</h4>
                            <ul className="space-y-4 text-sm font-medium">
                                <li><a href="#" className="text-slate-400 hover:text-primary transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary/30"></span>Instagram</a></li>
                                <li><a href="#" className="text-slate-400 hover:text-primary transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary/30"></span>LinkedIn</a></li>
                                <li><a href="#contact" className="text-slate-400 hover:text-primary transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary/30"></span>Contact Us</a></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Copyright Line */}
                <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        © 2026 SkillSeed. All rights reserved. 
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-primary/70">
                        Built for the creators of 2035.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default App;
