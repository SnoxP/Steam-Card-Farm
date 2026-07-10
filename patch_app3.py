import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

old_pill = '<span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20 flex items-center gap-1.5 font-bold uppercase">\n                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>'
new_pill = '<span className="text-[10px] font-mono text-green-400 bg-green-500/10 px-2.5 py-0.5 rounded border border-green-500/20 flex items-center gap-1.5 font-bold uppercase">\n                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>'

content = content.replace(old_pill, new_pill)

with open('src/App.tsx', 'w') as f:
    f.write(content)
