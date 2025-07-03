#!/bin/bash

# Fix import paths for Next.js migration

TARGET_DIR="/Users/udingethe/Dev/gigavibe/gigavibe-nextjs/src"

echo "Fixing import paths..."

# Fix relative imports to use @ alias
find "$TARGET_DIR" -name "*.tsx" -o -name "*.ts" | while read file; do
    echo "Processing $file..."
    
    # Replace relative imports with @ alias
    sed -i '' 's|from "\.\./\.\./components/ui/|from "@/components/ui/|g' "$file"
    sed -i '' 's|from "\.\./components/ui/|from "@/components/ui/|g' "$file"
    sed -i '' 's|from "\./components/ui/|from "@/components/ui/|g' "$file"
    sed -i '' 's|from "\.\./\.\./hooks/|from "@/hooks/|g' "$file"
    sed -i '' 's|from "\.\./hooks/|from "@/hooks/|g' "$file"
    sed -i '' 's|from "\./hooks/|from "@/hooks/|g' "$file"
    sed -i '' 's|from "\.\./\.\./lib/|from "@/lib/|g' "$file"
    sed -i '' 's|from "\.\./lib/|from "@/lib/|g' "$file"
    sed -i '' 's|from "\./lib/|from "@/lib/|g' "$file"
    sed -i '' 's|from "\.\./\.\./components/|from "@/components/|g' "$file"
    sed -i '' 's|from "\.\./components/|from "@/components/|g' "$file"
    sed -i '' 's|from "\./components/|from "@/components/|g' "$file"
    
    # Remove react-router-dom imports (we'll handle navigation differently)
    sed -i '' '/react-router-dom/d' "$file"
done

echo "Import paths fixed!"
