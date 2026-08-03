import re

with open('server.ts', 'r') as f:
    content = f.read()

# Make getSession async
old_get_session = """function getSession(req: any): SteamBotSession {
    let sid = req.headers['x-session-id'] as string;
    if (!sid) {
        sid = 'default';
    }
    if (!sessions.has(sid)) {
        const newSession = new SteamBotSession(sid);
        sessions.set(sid, newSession);
        newSession.loadData();
    }
    return sessions.get(sid)!;
}"""

new_get_session = """async function getSession(req: any): Promise<SteamBotSession> {
    let sid = req.headers['x-session-id'] as string;
    if (!sid) {
        sid = 'default';
    }
    if (!sessions.has(sid)) {
        const newSession = new SteamBotSession(sid);
        sessions.set(sid, newSession);
        await newSession.loadData();
    }
    return sessions.get(sid)!;
}"""
content = content.replace(old_get_session, new_get_session)

# Replace all getSession(req) with await getSession(req)
# And make the routes async
content = re.sub(r"app\.([a-z]+)\('([^']+)', \((req, res)\) => \{", r"app.\1('\2', async (\3) => {", content)
content = content.replace("const session = getSession(req);", "const session = await getSession(req);")

with open('server.ts', 'w') as f:
    f.write(content)
