import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# I need to change the grid-flow-col container classes.
old_grid = """                    <div className={`p-6 grid grid-flow-col max-md:auto-cols-[85%] md:auto-cols-[calc(50%-8px)] overflow-x-auto gap-4 custom-scrollbar-blue pb-6 ${((status?.activeAppIds?.length || 0) + (status?.pausedGames?.length || 0)) === 0 ? 'grid-rows-1' : 'grid-rows-2'}`}>
                      {/* Add New Session Card */}
                      <div onClick={handleAddNewSession} className="bg-[#0b1016] border border-dashed border-[#1d2630] hover:border-[#22c55e]/50 rounded-lg p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors group">
                        <div className="w-12 h-12 flex items-center justify-center rounded-full border border-[#22c55e] text-[#22c55e] group-hover:bg-[#22c55e]/10 transition-colors">"""

new_grid = """                    <div className={`p-6 grid grid-flow-col max-md:auto-cols-[85%] md:auto-cols-[calc(50%-8px)] lg:auto-cols-[300px] xl:auto-cols-[350px] overflow-x-auto gap-4 custom-scrollbar-blue pb-6 ${((status?.activeAppIds?.length || 0) + (status?.pausedGames?.length || 0)) >= 2 ? 'grid-rows-2' : 'grid-rows-1'}`}>
                      {/* Add New Session Card */}
                      <div onClick={handleAddNewSession} className="row-span-full h-full min-h-[140px] bg-[#0b1016] border border-dashed border-[#1d2630] hover:border-[#22c55e]/50 rounded-lg p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors group">
                        <div className="w-12 h-12 flex items-center justify-center rounded-full border border-[#22c55e] text-[#22c55e] group-hover:bg-[#22c55e]/10 transition-colors">"""

content = content.replace(old_grid, new_grid)

with open('src/App.tsx', 'w') as f:
    f.write(content)
