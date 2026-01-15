import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { Shield } from 'lucide-react';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', form);
      alert('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      alert('Error registering user');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600/30 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-pink-600/30 rounded-full blur-[100px]"></div>

      <form onSubmit={handleSubmit} className="w-96 p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl z-10">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-white/10 rounded-full text-purple-400">
            <Shield size={32} />
          </div>
        </div>
        
        <h2 className="text-3xl font-bold mb-2 text-center text-white">Create Account</h2>
        <p className="text-slate-400 text-center mb-8 text-sm">Start monitoring in seconds</p>

        <div className="space-y-4">
          <input 
            className="w-full p-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition" 
            placeholder="Full Name" 
            onChange={e => setForm({...form, name: e.target.value})} 
          />
          <input 
            className="w-full p-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition" 
            placeholder="Email Address" 
            type="email"
            onChange={e => setForm({...form, email: e.target.value})} 
          />
          <input 
            className="w-full p-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition" 
            placeholder="Password" 
            type="password"
            onChange={e => setForm({...form, password: e.target.value})} 
          />
        </div>

        <button className="w-full mt-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold p-3 rounded-lg hover:opacity-90 transition shadow-lg shadow-purple-500/25">
          Register
        </button>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account? <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium">Login</Link>
        </p>
      </form>
    </div>
  );
}