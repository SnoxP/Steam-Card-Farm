import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Users, ShieldAlert, ArrowLeft } from 'lucide-react';

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => {
        if (!res.ok) {
          if (res.status === 403) throw new Error('Acesso negado. Apenas o administrador (SnoxP718) pode ver esta página.');
          throw new Error('Erro ao carregar dados do administrador.');
        }
        return res.json();
      })
      .then(data => setStats(data))
      .catch(err => setError(err.message));
  }, []);

  return (
    <div className="min-h-screen bg-[#06090f] text-[#c9d1d9] font-sans flex flex-col items-center p-4 sm:p-8">
      <div className="w-full max-w-4xl space-y-6">
        <div className="flex items-center gap-4 border-b border-[#30363d] pb-4">
          <Link to="/" className="p-2 hover:bg-[#21262d] rounded-full transition-colors">
            <ArrowLeft size={20} className="text-[#8b949e]" />
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <ShieldAlert className="text-red-500" />
            Painel de Administração
          </h1>
        </div>

        {error ? (
          <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg text-red-400 text-sm flex flex-col items-center justify-center py-12">
            <ShieldAlert size={48} className="mb-4 opacity-50" />
            <p className="font-semibold text-lg">{error}</p>
          </div>
        ) : !stats ? (
          <div className="flex justify-center p-12">
            <Activity className="animate-spin text-[#8b949e]" size={32} />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-6 flex flex-col items-center justify-center">
                <div className="text-4xl font-bold text-blue-400 mb-2">{stats.totalCardsFarmed}</div>
                <div className="text-sm text-[#8b949e] font-mono uppercase">Total de Cartas Coletadas</div>
              </div>
              <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-6 flex flex-col items-center justify-center">
                <div className="text-4xl font-bold text-green-400 mb-2">{Object.keys(stats.users || {}).length}</div>
                <div className="text-sm text-[#8b949e] font-mono uppercase">Usuários Únicos</div>
              </div>
            </div>

            <div className="bg-[#0d1117] border border-[#30363d] rounded-lg overflow-hidden">
              <div className="bg-[#161b22] px-4 py-3 border-b border-[#30363d] font-semibold text-sm flex items-center gap-2">
                <Users size={16} className="text-[#8b949e]" />
                Histórico de Usuários
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-[#0d1117] border-b border-[#30363d] text-[#8b949e]">
                      <th className="px-4 py-3 font-semibold">Usuário</th>
                      <th className="px-4 py-3 font-semibold">SteamID</th>
                      <th className="px-4 py-3 font-semibold">Cartas Coletadas</th>
                      <th className="px-4 py-3 font-semibold">Última Atividade</th>
                      <th className="px-4 py-3 font-semibold text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(stats.users || {}).sort((a: any, b: any) => b.lastActive - a.lastActive).map((user: any) => (
                      <tr key={user.steamId} className={`border-b border-[#30363d] transition-colors ${user.isBanned ? 'bg-red-900/10' : 'hover:bg-[#161b22]/50'}`}>
                        <td className="px-4 py-3 flex items-center gap-3">
                          {user.avatar ? (
                            <img src={user.avatar} alt="Avatar" className={`w-8 h-8 rounded-full border border-[#30363d] ${user.isBanned ? 'grayscale opacity-50' : ''}`} />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-[#30363d]" />
                          )}
                          <span className={`font-semibold ${user.isAdmin ? 'text-blue-400' : ''} ${user.isBanned ? 'text-red-400 line-through' : ''}`}>
                            {user.username || 'Desconhecido'} {user.isAdmin ? '(Admin)' : ''}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-[#8b949e]">{user.steamId}</td>
                        <td className="px-4 py-3 font-mono text-blue-400 font-semibold">{user.cardsFarmed}</td>
                        <td className="px-4 py-3 text-[#8b949e] text-xs">
                          {new Date(user.lastActive).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button
                            onClick={() => {
                              fetch('/api/admin/update-user', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ steamId: user.steamId, isAdmin: !user.isAdmin })
                              }).then(() => window.location.reload());
                            }}
                            disabled={user.username === 'SnoxP718'}
                            className={`text-[10px] uppercase font-bold px-2 py-1 rounded transition-colors ${user.username === 'SnoxP718' ? 'opacity-30 cursor-not-allowed' : 'bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-blue-400'}`}
                          >
                            {user.isAdmin ? 'Remover Admin' : 'Dar Admin'}
                          </button>
                          <button
                            onClick={() => {
                              fetch('/api/admin/update-user', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ steamId: user.steamId, isBanned: !user.isBanned })
                              }).then(() => window.location.reload());
                            }}
                            disabled={user.username === 'SnoxP718'}
                            className={`text-[10px] uppercase font-bold px-2 py-1 rounded transition-colors ${user.username === 'SnoxP718' ? 'opacity-30 cursor-not-allowed' : user.isBanned ? 'bg-[#238636] hover:bg-[#2ea043] text-white' : 'bg-[#da3633] hover:bg-[#f85149] text-white'}`}
                          >
                            {user.isBanned ? 'Desbanir' : 'Banir'}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {Object.keys(stats.users || {}).length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-[#8b949e]">
                          Nenhum usuário registrado ainda.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
