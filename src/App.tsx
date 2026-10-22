import { HashRouter, Routes, Route } from 'react-router-dom';
import { SessionProvider } from './lib/session';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import VoiceCopilot from './components/VoiceCopilot';
import Home from './pages/Home';
import Practice from './pages/Practice';
import Analytics from './pages/Analytics';
import Compare from './pages/Compare';
import Report from './pages/Report';

export default function App() {
  return (
    <SessionProvider>
      <HashRouter>
        <div className="grain relative min-h-screen bg-ink text-cream font-sans">
          {/* ambient gold fields */}
          <div className="ambient w-[52rem] h-[52rem] -top-64 -left-64 bg-[radial-gradient(circle,rgba(221,180,92,0.10),transparent_65%)]" />
          <div className="ambient w-[46rem] h-[46rem] top-[30%] -right-72 bg-[radial-gradient(circle,rgba(221,180,92,0.07),transparent_65%)]" />
          <div className="ambient w-[60rem] h-[60rem] bottom-[-20rem] left-[20%] bg-[radial-gradient(circle,rgba(150,110,40,0.06),transparent_65%)]" />

          <Navbar />
          <main className="relative z-[1]">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/practice" element={<Practice />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/compare" element={<Compare />} />
              <Route path="/report" element={<Report />} />
              <Route path="/report/:id" element={<Report />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </main>
          <Footer />
          <VoiceCopilot />
        </div>
      </HashRouter>
    </SessionProvider>
  );
}
