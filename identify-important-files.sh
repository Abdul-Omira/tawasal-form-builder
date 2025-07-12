#!/bin/bash

# Syrian Ministry of Communication - Important Files Identifier
# This script identifies important files to keep
# 
# Author: Abdulwahab Omira <abdul@omiratech.com>
# Version: 1.0.0

echo "📋 Identifying Important Files to Keep"
echo "======================================"

# Create a list of important files
KEEP_LIST="important-files-to-keep.txt"
> "$KEEP_LIST"

echo -e "\n1️⃣ Production Configuration Files:"
echo "-----------------------------------"
find . -maxdepth 1 -name "*.env" -o -name "*.conf" -o -name "ecosystem.config.js" -o -name "docker-compose*.yml" | grep -v node_modules | while read file; do
    echo "  ✅ $file"
    echo "$file" >> "$KEEP_LIST"
done

echo -e "\n2️⃣ Source Code:"
echo "----------------"
echo "  ✅ client/ (React frontend)"
echo "  ✅ server/ (Node.js backend)"
echo "  ✅ shared/ (Shared schemas)"
echo "client/" >> "$KEEP_LIST"
echo "server/" >> "$KEEP_LIST"
echo "shared/" >> "$KEEP_LIST"

echo -e "\n3️⃣ Assets:"
echo "-----------"
echo "  ✅ assets/ (fonts, logos)"
echo "  ✅ client/public/ (public assets)"
echo "  ✅ uploads/ (user uploads)"
echo "assets/" >> "$KEEP_LIST"
echo "client/public/" >> "$KEEP_LIST"
echo "uploads/" >> "$KEEP_LIST"

echo -e "\n4️⃣ Database Related:"
echo "--------------------"
if [ -d "backups" ]; then
    echo "  ✅ backups/ (database backups)"
    echo "backups/" >> "$KEEP_LIST"
fi
if [ -d "migrations" ]; then
    echo "  ✅ migrations/ (database migrations)"
    echo "migrations/" >> "$KEEP_LIST"
fi
echo "  ✅ drizzle.config.ts"
echo "drizzle.config.ts" >> "$KEEP_LIST"

echo -e "\n5️⃣ Configuration Files:"
echo "------------------------"
for file in package.json tsconfig.json vite.config.ts tailwind.config.ts postcss.config.js components.json; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
        echo "$file" >> "$KEEP_LIST"
    fi
done

echo -e "\n6️⃣ Documentation:"
echo "------------------"
find . -maxdepth 1 -name "*.md" | while read file; do
    echo "  ✅ $file"
    echo "$file" >> "$KEEP_LIST"
done

echo -e "\n7️⃣ Deployment Scripts:"
echo "-----------------------"
find . -maxdepth 1 -name "*.sh" | while read file; do
    echo "  ✅ $file"
    echo "$file" >> "$KEEP_LIST"
done

echo -e "\n8️⃣ Type Definitions:"
echo "---------------------"
if [ -d "types" ]; then
    echo "  ✅ types/"
    echo "types/" >> "$KEEP_LIST"
fi

echo -e "\n❌ Files/Directories to REMOVE:"
echo "================================"
echo "  ❌ node_modules/ (can be rebuilt with npm install)"
echo "  ❌ dist/ (build output, can be rebuilt)"
echo "  ❌ test-*.ts, debug-*.ts files"
echo "  ❌ *.log files"
echo "  ❌ local-mail-server/sent/* (old emails)"
echo "  ❌ local-mail-server/failed/*"
echo "  ❌ quarantine/ (if exists)"
echo "  ❌ .DS_Store files"
echo "  ❌ *.tmp, *.bak, *.swp files"

echo -e "\n📊 Storage Analysis:"
echo "===================="
echo "Current directory size:"
du -sh .

echo -e "\nLargest directories:"
du -sh */ 2>/dev/null | sort -hr | head -10

echo -e "\n💾 Node modules size:"
if [ -d "node_modules" ]; then
    du -sh node_modules
else
    echo "No node_modules directory found"
fi

echo -e "\n📸 Uploads directory size:"
if [ -d "uploads" ]; then
    du -sh uploads
    echo "Number of files: $(find uploads -type f | wc -l)"
else
    echo "No uploads directory found"
fi

echo -e "\n✅ Important files list saved to: $KEEP_LIST"
echo "Review this file to ensure all important files are preserved before cleanup."