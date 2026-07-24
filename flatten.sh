#!/bin/bash

# Remove StockCheckView.tsx
rm -f src/views/StockCheckView.tsx

# Move all files from subdirectories to src/
find src -type f -mindepth 2 -exec mv {} src/ \;

# Remove empty directories
find src -type d -empty -delete

# Fix imports in all files in src/
for file in src/*.tsx src/*.ts; do
  # Replace ../components/X or ./components/X with ./X
  sed -i -E "s|from '([^']*)/(components|views|services|utils|data)/([^']+)'|from './\3'|g" "$file"
  sed -i -E 's|from "([^"]*)/(components|views|services|utils|data)/([^"]+)"|from "./\3"|g' "$file"
  
  # specific replacements for imports like from './components/Header'
  sed -i -E "s|from '\./(components|views|services|utils|data)/([^']+)'|from './\2'|g" "$file"
  sed -i -E 's|from "\./(components|views|services|utils|data)/([^"]+)"|from "./\2"|g' "$file"
  
  # Replace ../types or ../../types with ./types
  sed -i -E "s|from '([^']*)/types'|from './types'|g" "$file"
  sed -i -E 's|from "([^"]*)/types"|from "./types"|g' "$file"
done

# Remove StockCheckView usages in App.tsx
sed -i '/import StockCheckView/d' src/App.tsx
sed -i '/<StockCheckView \/>/d' src/App.tsx

# Remove stock_check from ViewTab in types.ts
sed -i "/| 'stock_check'/d" src/types.ts

# Remove stock_check from Sidebar.tsx
sed -i "/id: 'stock_check'/d" src/Sidebar.tsx

