import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { LineChart, Line, Tooltip, ResponsiveContainer, YAxis } from 'recharts';
import { Plus, Trash2, Activity, AlertTriangle, CheckCircle, User } from 'lucide-react';

export default function Dashboard() {
  const [monitors, setMonitors] = useState([]);
  const [newMonitor, setNewMonitor] = useState({ name: '', url: '' });
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/monitors')
      .then(res => setMonitors(res.data))
      .catch(() => {
        localStorage.removeItem('token'); 
        navigate('/login');
      });
  }, []);
  const addMonitor = async (e) => {
    e.preventDefault();
    const { data } = await api.post('/monitors', newMonitor);
    setMonitors([...monitors, { ...data, logs: [], incidents: [] }]); 
    setNewMonitor({ name: '', url: '' });
  };

  const deleteMonitor = async (id) => {
    if(!confirm('Are you sure?')) return;
    await api.delete(`/monitors/${id}`);
    setMonitors(monitors.filter(m => m.id !== id));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Now';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="min-h-screen p-8 bg-slate-900 text-white">
      <div className="max-w-6xl mx-auto mb-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Activity className="text-purple-500" size={32} />
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            Dashboard
          </h1>
        </div>
        
        <Link to="/profile" className="p-3 bg-slate-800 hover:bg-slate-700 rounded-full transition border border-slate-700 text-slate-300 hover:text-white shadow-lg group">
          <User size={24} className="group-hover:scale-110 transition" />
        </Link>
      </div>

      <div className="max-w-6xl mx-auto">
        <form onSubmit={addMonitor} className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-lg mb-10 flex gap-4 shadow-xl">
          <input 
            className="flex-1 bg-slate-800 border border-slate-700 p-3 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500" 
            placeholder="Site Name (e.g. My Portfolio)" 
            value={newMonitor.name}
            onChange={e => setNewMonitor({...newMonitor, name: e.target.value})}
            required
          />
          <input 
            className="flex-1 bg-slate-800 border border-slate-700 p-3 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500" 
            placeholder="URL (e.g. https://google.com)" 
            value={newMonitor.url}
            onChange={e => setNewMonitor({...newMonitor, url: e.target.value})}
            required
          />
          <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg flex items-center gap-2 hover:opacity-90 font-bold shadow-lg shadow-purple-500/20">
            <Plus size={20} /> Add
          </button>
        </form>

        <div className="grid gap-6">
          {monitors.map(monitor => (
            <div key={monitor.id} className="bg-slate-800/50 border border-white/5 p-6 rounded-2xl shadow-lg hover:border-purple-500/30 transition duration-300">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold flex items-center gap-3">
                    {monitor.name}
                    <a href={monitor.url} target="_blank" rel="noreferrer" className="text-slate-500 text-base font-normal hover:text-purple-400 transition">{monitor.url}</a>
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                      <span className={`relative flex h-3 w-3`}>
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${monitor.logs[0]?.statusCode === 200 ? 'bg-green-400' : 'bg-red-400'}`}></span>
                        <span className={`relative inline-block rounded-full h-3 w-3 ${monitor.logs[0]?.statusCode === 200 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      </span>
                      <span className={`text-sm font-medium ${monitor.logs[0]?.statusCode === 200 ? 'text-green-400' : 'text-red-400'}`}>
                        {monitor.logs[0]?.statusCode === 200 ? 'Operational' : 'Down'}
                      </span>
                  </div>
                </div>
                <button onClick={() => deleteMonitor(monitor.id)} className="text-slate-600 hover:text-red-400 p-2 rounded transition">
                  <Trash2 size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 h-40 bg-slate-900/50 rounded-xl border border-white/5 p-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monitor.logs.slice().reverse()}>
                            <Line type="step" dataKey="responseTime" stroke="#a855f7" strokeWidth={3} dot={false} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} 
                              itemStyle={{ color: '#a855f7' }}
                            />
                            <YAxis hide domain={['auto', 'auto']} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-slate-900/50 rounded-xl border border-white/5 p-4 overflow-y-auto h-40 scrollbar-thin scrollbar-thumb-slate-700">
                  <h4 className="font-bold text-slate-400 mb-3 text-xs uppercase tracking-wider">Recent Incidents</h4>
                  {monitor.incidents && monitor.incidents.length > 0 ? (
                    <ul className="space-y-3">
                      {monitor.incidents.map(incident => (
                        <li key={incident.id} className="text-sm flex items-start gap-3 pb-2 border-b border-white/5 last:border-0">
                          <AlertTriangle size={16} className="text-red-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="font-medium text-red-400">Service Down</p>
                            <p className="text-xs text-slate-500">
                              {formatDate(incident.startsAt)} - {incident.endsAt ? formatDate(incident.endsAt) : 'Ongoing...'}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-600">
                      <CheckCircle size={24} className="mb-2 text-green-500/50" />
                      <p className="text-xs">No incidents reported</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}