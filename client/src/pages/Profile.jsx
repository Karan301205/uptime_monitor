import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { Mail, ArrowLeft, CheckCircle, XCircle, LogOut } from 'lucide-react';

export default function Profile() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/auth/me')
      .then(res => setUser(res.data))
      .catch(() => {
        localStorage.removeItem('token');
        navigate('/login');
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  if (!user) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading Profile...</div>;

  const activeSites = user.monitors.filter(m => {
    const lastLog = m.logs?.[0];
    const isUp = lastLog ? lastLog.statusCode === 200 : false; 
    return isUp && m.isActive;
  });

  const downSites = user.monitors.filter(m => {
    const lastLog = m.logs?.[0];
    const isUp = lastLog ? lastLog.statusCode === 200 : false;
    return !isUp || !m.isActive;
  });

  const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center text-slate-400 hover:text-white mb-8 transition group">
          <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition" /> Back to Dashboard
        </Link>

        <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
          <div className="p-8 border-b border-slate-700 flex flex-col md:flex-row items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg shrink-0">
              {initials}
            </div>
            <div className="text-center md:text-left flex-1">
              <h1 className="text-2xl font-bold text-white mb-1">{user.name}</h1>
              <div className="flex items-center justify-center md:justify-start text-slate-400 text-sm gap-4">
                <span className="flex items-center gap-1"><Mail size={14} /> {user.email}</span>
                <span className="bg-slate-700/50 px-2 py-0.5 rounded text-xs border border-slate-600">Free Plan</span>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-sm font-medium transition border border-red-500/20 flex items-center gap-2"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>

          <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-700">
            <div className="p-6">
              <h3 className="text-green-400 font-bold mb-4 flex items-center gap-2">
                <CheckCircle size={18} /> Operational Sites ({activeSites.length})
              </h3>
              {activeSites.length > 0 ? (
                <ul className="space-y-3">
                  {activeSites.map(site => (
                    <li key={site.id} className="bg-green-500/5 border border-green-500/20 p-3 rounded-lg flex justify-between items-center">
                      <span className="font-medium text-slate-200">{site.name}</span>
                      <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded">UP</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-500 text-sm italic">No active sites.</p>
              )}
            </div>

            <div className="p-6 bg-slate-800/50">
              <h3 className="text-red-400 font-bold mb-4 flex items-center gap-2">
                <XCircle size={18} /> Issues / Inactive ({downSites.length})
              </h3>
              {downSites.length > 0 ? (
                <ul className="space-y-3">
                  {downSites.map(site => (
                    <li key={site.id} className="bg-red-500/5 border border-red-500/20 p-3 rounded-lg flex justify-between items-center">
                      <span className="font-medium text-slate-300">{site.name}</span>
                      <span className={`text-xs px-2 py-1 rounded ${!site.isActive ? 'text-slate-400 bg-slate-700' : 'text-red-400 bg-red-500/10'}`}>
                        {!site.isActive ? 'PAUSED' : 'DOWN'}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-500 text-sm italic">All systems operational.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}