#!/bin/bash

# Move everything from src/ to root
mv src/* ./

# Update index.html
sed -i 's|/src/main.tsx|/main.tsx|g' index.html

# Remove the now empty src directory
rm -rf src/

