import os
import re

src_dir = 'src'
for filename in os.listdir(src_dir):
    if not filename.endswith('.ts') and not filename.endswith('.tsx'):
        continue
    
    filepath = os.path.join(src_dir, filename)
    with open(filepath, 'r') as f:
        content = f.read()

    # Pattern to match from '../components/X' or './components/X'
    # We want to replace paths that contain /components/, /views/, /services/, /utils/, /data/
    # And we just want the last part of the path (the filename)
    
    def replacer(match):
        quote = match.group(1)
        full_path = match.group(2)
        basename = full_path.split('/')[-1]
        return f"from {quote}./{basename}{quote}"

    # matches from '../something/something' or from "./something/something"
    content = re.sub(r'from ([\'"])([^(\'")]*(?:components|views|services|utils|data)/[^\'"]+)([\'"])', replacer, content)
    
    # also handle /types
    content = re.sub(r'from ([\'"])[^\'"]*types([\'"])', r'from \1./types\2', content)

    with open(filepath, 'w') as f:
        f.write(content)

print("Imports fixed")
