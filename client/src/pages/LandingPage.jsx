import { Link } from 'react-router-dom';
import { Activity, Shield, Zap, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white selection:bg-purple-500 selection:text-white">
      
      {/* --- HEADER --- */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          <Activity size={32} className="text-purple-500" />
          UptimePro
        </div>
        <div className="flex gap-4">
          <Link to="/login" className="px-6 py-2 rounded-full border border-purple-500/50 hover:bg-purple-500/10 transition">
            Login
          </Link>
          <Link to="/register" className="px-6 py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 transition font-medium shadow-lg shadow-purple-500/25">
            Get Started
          </Link>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <div className="flex flex-col items-center justify-center text-center mt-20 px-4">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
          Never let your site <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            go offline silently.
          </span>
        </h1>
        <p className="text-slate-400 text-xl max-w-2xl mb-10 leading-relaxed">
          The fastest, most reliable uptime monitoring solution. 
          Get instant alerts via Email & Dashboard when your website crashes. 
          100% Free for developers.
        </p>
        
        <Link to="/register" className="group flex items-center gap-2 px-8 py-4 rounded-full bg-white text-slate-900 font-bold text-lg hover:bg-slate-200 transition">
          Start Monitoring Free
          <ArrowRight className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* --- FEATURES (Glass Cards) --- */}
      <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto mt-32 px-6 pb-20">
        {/* Card 1 */}
        <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-lg hover:border-purple-500/50 transition duration-300">
          <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4 text-purple-400">
            <Zap size={24} />
          </div>
          <h3 className="text-xl font-bold mb-2">Real-Time Checks</h3>
          <p className="text-slate-400">We monitor your website every 60 seconds from our global servers to ensure maximum availability.</p>
        </div>

        {/* Card 2 */}
        <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-lg hover:border-pink-500/50 transition duration-300">
          <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mb-4 text-pink-400">
            <Activity size={24} />
          </div>
          <h3 className="text-xl font-bold mb-2">Incident History</h3>
          <p className="text-slate-400">Keep track of every downtime event. We log exactly when your site went down and when it came back.</p>
        </div>

        {/* Card 3 */}
        <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-lg hover:border-blue-500/50 transition duration-300">
          <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 text-blue-400">
            <Shield size={24} />
          </div>
          <h3 className="text-xl font-bold mb-2">Instant Alerts</h3>
          <p className="text-slate-400">Get notified via Email immediately. We allow you to sleep soundly knowing we are watching.</p>
        </div>
      </div>

    </div>
  );
}