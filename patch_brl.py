import re

with open('server.ts', 'r') as f:
    content = f.read()

content = content.replace("currency=1", "currency=7")

with open('server.ts', 'w') as f:
    f.write(content)
