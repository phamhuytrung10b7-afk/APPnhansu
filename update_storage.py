with open('storage.ts', 'r') as f:
    content = f.read()

content = content.replace(
    '  async initialize() {\n    if (isInitialized) return;',
    '  async refreshFromServer() {\n    isInitialized = false;\n    await this.initialize();\n  },\n\n  async initialize() {\n    if (isInitialized) return;'
)

with open('storage.ts', 'w') as f:
    f.write(content)
