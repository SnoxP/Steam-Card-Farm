import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

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

function AppContent() {"""

content = content.replace("function AppContent() {", helpers)

with open('src/App.tsx', 'w') as f:
    f.write(content)
