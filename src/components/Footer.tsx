import { Link } from 'react-router-dom';
import { Wordmark } from './Navbar';
import { ArrowUpRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative z-10 border-t hairline bg-[#080807]">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-14 grid gap-12 md:grid-cols-12">
        <div className="md:col-span-4 flex flex-col gap-4">
          <Wordmark compact />
          <p className="text-mute text-sm leading-relaxed max-w-xs">
            The interview intelligence platform — engineered answers, measured delivery, compounding confidence.
          </p>
          <div className="flex items-center gap-3 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
            <span className="num text-[0.68rem] text-mute tracking-widest uppercase">All scoring systems operational</span>
          </div>
        </div>
        <div className="md:col-span-2">
          <div className="eyebrow mb-3">Product</div>
          <ul className="flex flex-col gap-2 text-sm text-mute">
            <li><Link to="/practice" className="hover:text-champagne">Practice</Link></li>
            <li><Link to="/analytics" className="hover:text-champagne">Dashboard</Link></li>
            <li><Link to="/compare" className="hover:text-champagne">Compare</Link></li>
            <li><Link to="/report" className="hover:text-champagne">Reports</Link></li>
          </ul>
        </div>
        <div className="md:col-span-3">
          <div className="eyebrow mb-3">Platform</div>
          <ul className="flex flex-col gap-2 text-sm text-mute">
            <li>Speech-to-text engine v4.2</li>
            <li>Relevance &amp; keyword NLP</li>
            <li>Delivery analytics · fillers · pace</li>
            <li>PostgreSQL · IndexedDB sync</li>
          </ul>
        </div>
        <div className="md:col-span-3">
          <div className="eyebrow mb-3">Intelligence Brief</div>
          <p className="text-sm text-mute mb-3">One sharp email on interview performance. Monthly.</p>
          <form
            className="flex rounded-full overflow-hidden border hairline focus-within:border-gold-400/50 transition-colors"
            onSubmit={(e) => {
              e.preventDefault();
              const input = e.currentTarget.querySelector('input');
              if (input && input.value.includes('@')) {
                input.value = '';
                (e.currentTarget.querySelector('button') as HTMLButtonElement).innerText = 'Subscribed';
              }
            }}
          >
            <input type="email" required placeholder="you@company.com" className="bg-transparent px-4 py-2.5 text-sm outline-none flex-1 min-w-0 placeholder:text-mute/60" />
            <button type="submit" className="bg-gold-500/90 text-ink px-4 text-sm font-bold hover:bg-gold-400 transition-colors"><ArrowUpRight size={16} /></button>
          </form>
        </div>
      </div>
      <div className="border-t hairline">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 h-12 flex items-center justify-between text-[0.68rem] text-mute/80">
          <span>© 2026 SpeakScore AI, Inc. All rights reserved.</span>
          <div className="flex items-center gap-5">
            <span className="hidden sm:inline">Privacy</span>
            <span className="hidden sm:inline">Terms</span>
            <span className="num tracking-widest text-gold-500">SPKS · SERIES B</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
