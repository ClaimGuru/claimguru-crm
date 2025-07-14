#!/usr/bin/env python3
import os
import re

def fix_corrupted_imports(directory):
    """Fix corrupted import statements with \\1 characters"""
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.tsx'):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    original_content = content
                    
                    # Fix corrupted import paths
                    content = re.sub(r"from '\.\./\.\./components/ui/\\1'", "from '../components/ui/Card'", content)
                    content = re.sub(r"from '\.\./components/ui/\\1'", "from '../components/ui/Button'", content)
                    
                    # Generic fix for common UI components  
                    content = re.sub(r"'../../components/ui/\\1'", "'../components/ui/Card'", content)
                    content = re.sub(r"'../components/ui/\\1'", "'../components/ui/Button'", content)
                    
                    if content != original_content:
                        with open(file_path, 'w', encoding='utf-8') as f:
                            f.write(content)
                        print(f"Fixed corrupted imports in: {file_path}")
                        
                except Exception as e:
                    print(f"Error processing {file_path}: {e}")

if __name__ == "__main__":
    fix_corrupted_imports("/workspace/claimguru/src/pages")
    print("Fixed corrupted imports!")
