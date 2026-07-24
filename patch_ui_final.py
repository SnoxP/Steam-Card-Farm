import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Fix handleLoginWithToken
content = content.replace("onClick={handleClientLogin}", "onClick={handleLoginWithToken}", 1)

# Remove ACTIVE/OFFLINE header button entirely on login page
old_header = """        <div className="flex items-center mt-3 sm:mt-0">
          {refreshToken && (
            <button 
              onClick={handleToggleActive}
              disabled={loading}
              className={`px-3 py-1 rounded-full flex items-center gap-2 text-xs font-bold tracking-wider transition-colors border ${
                status?.isClientLoggedIn 
                  ? 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20' 
                  : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${status?.isClientLoggedIn ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></span>
              {status?.isClientLoggedIn ? 'ACTIVE' : 'OFFLINE'}
            </button>
          )}"""

new_header = """        <div className="flex items-center mt-3 sm:mt-0">
          {status?.isClientLoggedIn && (
            <button 
              onClick={handleToggleActive}
              disabled={loading}
              className={`px-3 py-1 rounded-full flex items-center gap-2 text-xs font-bold tracking-wider transition-colors border bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20`}
            >
              <span className={`w-2 h-2 rounded-full bg-green-400 animate-pulse`}></span>
              ACTIVE
            </button>
          )}"""
content = content.replace(old_header, new_header)

with open('src/App.tsx', 'w') as f:
    f.write(content)

