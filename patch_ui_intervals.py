import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add helpers inside the file
helpers = """
const parseTimeStringToMs = (str: string) => {
  if (!str || str.trim() === '') return 15 * 60 * 1000;
  const parts = str.split(':');
  if (parts.length !== 3) return 15 * 60 * 1000;
  const h = parseInt(parts[0]) || 0;
  const m = parseInt(parts[1]) || 0;
  const s = parseInt(parts[2]) || 0;
  return (h * 3600 + m * 60 + s) * 1000;
};

const formatMsToTimeString = (ms: number) => {
  if (!ms) return '00:15:00';
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};
"""
content = content.replace("const formatTime = (ms: number) => {", helpers + "\nconst formatTime = (ms: number) => {")

# Add handleUpdateCheckInterval inside AppContent
handlers = """
  const handleUpdateCheckInterval = async (val: string) => {
    const ms = parseTimeStringToMs(val);
    try {
      await apiFetch('/api/set-check-interval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intervalMs: ms })
      });
      fetchStatus();
    } catch(e) {
      console.error(e);
    }
  };
"""
content = content.replace("const handleStopSingleApp = async (appId: number) => {", handlers + "\n  const handleStopSingleApp = async (appId: number) => {")

# Modify the AUTOMATIC badge block
old_badge = """                              <div className={`px-2.5 py-1 border text-[9px] font-bold uppercase rounded flex items-center gap-1.5 ${!status?.farmingStartTime ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : status?.isManualPaused ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' : 'bg-green-500/10 border-green-500/20 text-green-400'}`}>
                                <Activity size={10} />
                                {!status?.farmingStartTime ? 'PAUSADO' : status?.isManualPaused ? 'MANUAL' : 'AUTOMÁTICO'}
                              </div>"""

new_badge = """                              <div className="flex flex-col items-end gap-1.5">
                                <div className={`px-2.5 py-1 border text-[9px] font-bold uppercase rounded flex items-center gap-1.5 ${!status?.farmingStartTime ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : status?.isManualPaused ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' : 'bg-green-500/10 border-green-500/20 text-green-400'}`}>
                                  <Activity size={10} />
                                  {!status?.farmingStartTime ? 'PAUSADO' : status?.isManualPaused ? 'MANUAL' : 'AUTOMÁTICO'}
                                </div>
                                {!status?.isManualPaused && status?.farmingStartTime && (
                                  <input
                                    type="text"
                                    placeholder="00:15:00"
                                    title="Tempo de checagem (hh:mm:ss)"
                                    defaultValue={formatMsToTimeString(status?.checkInterval)}
                                    onBlur={(e) => handleUpdateCheckInterval(e.target.value)}
                                    className="w-[60px] bg-[#0b1016] border border-[#1d2630] rounded px-1 py-0.5 text-[9px] text-center text-[#8b949e] focus:border-[#22c55e] focus:text-white outline-none placeholder-[#30363d] transition-colors"
                                  />
                                )}
                              </div>"""
content = content.replace(old_badge, new_badge)

with open('src/App.tsx', 'w') as f:
    f.write(content)
