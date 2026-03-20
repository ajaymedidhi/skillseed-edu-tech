import React, { useState, useEffect } from 'react';
import logoImg from '../../assets/images/logo.png';

const NavbarTailwind = () => {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
            isScrolled 
            ? 'bg-void/80 backdrop-blur-xl border-b border-white/10 py-4' 
            : 'bg-transparent py-6'
        }`}>
            <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
                
                {/* Logo & Brand */}
                <div className="flex items-center">
                    <div className="flex items-center gap-4 group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
                        <div className="relative flex items-center justify-center w-12 h-12 bg-white rounded-xl overflow-hidden shadow-lg border border-white/20">
                            <img 
                                src={logoImg} 
                                alt="SkillSeed Logo" 
                                className="h-[80%] w-auto object-contain transition-transform duration-500 group-hover:scale-110" 
                            />
                            <div className="absolute inset-0 bg-primary/20 blur-xl scale-0 group-hover:scale-150 transition-transform duration-700 -z-10"></div>
                        </div>
                        <span className="text-2xl font-display font-bold text-white tracking-tight">
                            SkillSeed
                        </span>
                    </div>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8 lg:gap-12">
                    {['Why Us', 'Programs', 'Methodology', 'Partners'].map((item) => (
                        <a 
                            key={item} 
                            href={`#${item.toLowerCase().replace(' ', '-')}`}
                            className="text-sm font-bold text-slate-400 hover:text-white transition-colors tracking-wide uppercase"
                        >
                            {item}
                        </a>
                    ))}
                </div>

                {/* CTA & Mobile Menu */}
                <div className="flex items-center gap-6">
                    <button className="hidden md:block px-6 py-2.5 rounded-full bg-white/10 text-white font-bold hover:bg-primary hover:text-void transition-all shadow-[0_0_15px_rgba(0,242,254,0.1)] border border-primary/20 backdrop-blur-sm">
                        Contact Us
                    </button>
                    
                    <button className="md:hidden text-white p-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default NavbarTailwind;
