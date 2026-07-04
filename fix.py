import re

with open('db.ts', 'r') as f:
    content = f.read()
content = content.replace("import fs from 'fs';", "import * as fs from 'fs';")
content = content.replace("import path from 'path';", "import * as path from 'path';")
with open('db.ts', 'w') as f:
    f.write(content)

with open('session.ts', 'r') as f:
    content = f.read()
content = content.replace("import fs from 'fs';", "import * as fs from 'fs';")
content = content.replace("import path from 'path';", "import * as path from 'path';")
with open('session.ts', 'w') as f:
    f.write(content)

with open('adminStats.ts', 'r') as f:
    content = f.read()
content = content.replace("import fs from 'fs';", "import * as fs from 'fs';")
content = content.replace("import path from 'path';", "import * as path from 'path';")
with open('adminStats.ts', 'w') as f:
    f.write(content)

with open('server.ts', 'r') as f:
    content = f.read()
content = content.replace("import express from 'express';", "import * as express from 'express';")
content = content.replace("import path from 'path';", "import * as path from 'path';")

# 289: recordCardsDropped inside a promise or non-async function
# let's find the function it's in.
