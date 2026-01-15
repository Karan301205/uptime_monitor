import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import api from '../api';
import { Zap } from 'lucide-react';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('token', token);
      navigate('/dashboard');
    }
  }, [searchParams, navigate]);

  const handleGoogleLogin = () => {
    // 👇 NEW LIVE BACKEND URL
    window.location.href = 'https://uptime-monitor-xipl.onrender.com/api/auth/google';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', form);
      localStorage.setItem('token', data.token);
      navigate('/dashboard');
    } catch (error) {
      alert('Invalid Credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-purple-600/30 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-blue-600/30 rounded-full blur-[100px]"></div>

      <div className="w-96 p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl z-10">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-white/10 rounded-full text-yellow-400">
            <Zap size={32} />
          </div>
        </div>

        <h2 className="text-3xl font-bold mb-2 text-center text-white">Welcome Back</h2>
        <p className="text-slate-400 text-center mb-8 text-sm">Login to your dashboard</p>
        
        {/* Google Button */}
        <button 
          onClick={handleGoogleLogin}
          className="w-full bg-white text-slate-900 p-3 rounded-lg mb-6 hover:bg-slate-200 font-bold transition flex items-center justify-center gap-2"
        >
          <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="G" />
          Login with Google
        </button>
        
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-900/50 px-2 text-slate-500">Or continue with</span></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            className="w-full p-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition" 
            placeholder="Email" 
            type="email"
            value={form.email}
            onChange={e => setForm({...form, email: e.target.value})} 
            required
          />
          <input 
            className="w-full p-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition" 
            placeholder="Password" 
            type="password"
            value={form.password}
            onChange={e => setForm({...form, password: e.target.value})} 
            required
          />
          <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold p-3 rounded-lg hover:opacity-90 transition shadow-lg shadow-purple-500/25">
            Login
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          No account? <Link to="/register" className="text-purple-400 hover:text-purple-300 font-medium">Register</Link>
        </p>
      </div>
    </div>
  );
}