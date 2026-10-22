import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ArrowUpRight } from 'lucide-react';

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5 group">
      <svg width={compact ? 30 : 34} height={compact ? 30 : 34} viewBox="0 0 64 64" className="shrink-0">
        <rect width="64" height="64" rx="14" fill="#0d0d0c" />
        <rect width="64" height="64" rx="14" fill="none" stroke="#c39a3f" strokeOpacity="0.4" />
        <rect x="27.5" y="13" width="9" height="16" rx="4.5" fill="#ddb45c" />
        <path d="M22 30a10 10 0 0 0 20 0" stroke="#ecd394" strokeWidth="3.2" fill="none" strokeLinecap="round" />
        <line x1="32" y1="40.5" x2="32" y2="48" stroke="#ecd394" strokeWidth="3.2" strokeLinecap="round" />
        <circle cx="32" cy="51" r="1.6" fill="#f6e7b8" />
      </svg>
      <span className="font-display text-[1.18rem] font-semibold tracking-tight text-cream group-hover:text-champagne transition-colors">
        SpeakScore<span className="gold-text"> AI</span>
      </span>
    </Link>
  );
}

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/practice', label: 'Practice' },
  { to: '/analytics', label: 'Dashboard' },
  { to: '/compare', label: 'Compare' },
  { to: '/report', label: 'Report' },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => { setOpen(false); window.scrollTo(0, 0); }, [pathname]);

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? 'bg-[#060606]/85 backdrop-blur-xl border-b hairline' : 'bg-transparent border-b border-transparent'}`}>
      <div className="mx-auto max-w-7xl px-5 sm:px-8 h-[68px] flex items-center justify-between">
        <Wordmark compact />
        <nav className="hidden md:flex items-center gap-8">
          {LINKS.slice(1).map((l) => {
            const active = pathname === l.to;
            return (
              <Link key={l.to} to={l.to} className={`text-[0.82rem] font-medium tracking-wide transition-colors relative ${active ? 'text-gold-300' : 'text-mute hover:text-cream'}`}>
                {l.label}
                {active && <span className="absolute -bottom-[22px] left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold-400 to-transparent" />}
              </Link>
            );
          })}
        </nav>
        <button onClick={() => navigate('/practice')} className="hidden md:inline-flex btn-gold text-[0.8rem] px-5 py-2.5">
          Start Practice <ArrowUpRight size={15} strokeWidth={2.5} />
        </button>
        <button className="md:hidden text-cream p-2" onClick={() => setOpen((v) => !v)} aria-label="Menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {open && (
        <div className="md:hidden bg-[#0b0b0a]/97 backdrop-blur-2xl border-t hairline px-6 py-6 flex flex-col gap-4">
          {LINKS.map((l) => (
            <Link key={l.to} to={l.to} className="text-lg font-display text-cream py-1.5 border-b border-white/5">{l.label}</Link>
          ))}
          <button onClick={() => navigate('/practice')} className="btn-gold justify-center py-3.5 mt-2">Start Practice <ArrowUpRight size={16} /></button>
        </div>
      )}
    </header>
  );
}
