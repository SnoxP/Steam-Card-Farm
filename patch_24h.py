import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

old_func = """  const formatStartTime = (timestamp: number) => {
    const d = new Date(timestamp);
    let h = d.getHours();
    const m = d.getMinutes().toString().padStart(2, '0');
    const ampm = h >= 12 ? 'pm' : 'am';
    h = h % 12;
    h = h ? h : 12;
    const hStr = h.toString().padStart(2, '0');
    
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    
    return `${hStr}:${m}${ampm} (${day}/${month})`;
  };"""

new_func = """  const formatStartTime = (timestamp: number) => {
    const d = new Date(timestamp);
    const hStr = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    
    return `${hStr}:${m} (${day}/${month})`;
  };"""

content = content.replace(old_func, new_func)

with open('src/App.tsx', 'w') as f:
    f.write(content)

