import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

admin_btn_block = """          {status?.isAdmin && (
            <Link to="/admin" className="hover:text-white transition-colors" title="Admin Dashboard">
              <ShieldAlert size={14} className="inline mr-1" />
              ADMIN
            </Link>
          )}"""

content = content.replace(admin_btn_block, "")

sidebar_nav_admin = """            {status?.isAdmin && (
              <Link onClick={() => setIsMobileSidebarOpen(false)} to="/admin" className="flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition-colors text-amber-500 hover:bg-[#161b22]">
                <ShieldAlert size={16} />
                <span>ADMIN</span>
              </Link>
            )}"""

# We'll insert it right after the Cartas Coletadas link
insert_after = """            <Link onClick={() => setIsMobileSidebarOpen(false)} to="/cartas-coletadas" className={`flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition-colors ${isCollectedTab ? 'bg-[#1f6feb] text-white' : 'text-[#8b949e] hover:bg-[#161b22]'}`}>
              <span>{t[lang].collectedCards}</span>
            </Link>"""

content = content.replace(insert_after, insert_after + "\n" + sidebar_nav_admin)

with open('src/App.tsx', 'w') as f:
    f.write(content)
