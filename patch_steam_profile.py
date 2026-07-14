import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '<div className="col-span-2 md:col-span-1 lg:col-span-1 bg-[#10151c] border border-[#1d2630] rounded-lg p-4 flex items-center justify-between gap-3 h-24">',
    '<div className="max-md:col-span-2 md:col-span-1 lg:col-span-1 bg-[#10151c] border border-[#1d2630] rounded-lg p-4 flex items-center justify-between gap-3 h-24">'
)

with open('src/App.tsx', 'w') as f:
    f.write(content)

