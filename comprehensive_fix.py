#!/usr/bin/env python3
import os
import re

def fix_all_files(directory):
    """Comprehensively fix all issues in TypeScript files"""
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    original_content = content
                    
                    # Fix all variants of octal escape sequences
                    content = re.sub(r'\\\\001', r'\\x01', content)
                    content = re.sub(r'\\001', r'\\x01', content)
                    content = re.sub(r'\\\001', r'\\x01', content)
                    
                    # Remove any weird characters that might be causing issues
                    content = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', content)
                    
                    if content != original_content:
                        with open(file_path, 'w', encoding='utf-8') as f:
                            f.write(content)
                        print(f"Fixed: {file_path}")
                        
                except Exception as e:
                    print(f"Error processing {file_path}: {e}")

if __name__ == "__main__":
    fix_all_files("/workspace/claimguru/src/pages")
    print("Comprehensive fix completed!")
