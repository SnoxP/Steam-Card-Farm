import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

old_div = '<div key={id} className="flex flex-col items-center gap-1.5 p-2 bg-[#0d1117] border border-[#30363d] rounded shrink-0 relative">'
new_div = '<div key={id} className={`flex flex-col items-center gap-1.5 p-2 rounded shrink-0 relative border ${status?.isManualPaused ? "border-orange-500/50 bg-orange-500/5" : "border-green-500/50 bg-green-500/5"}`}>'

content = content.replace(old_div, new_div)

with open('src/App.tsx', 'w') as f:
    f.write(content)
