#!/usr/bin/env python3
import os
import re

def fix_octal_escapes(directory):
    """Fix octal escape sequences in TypeScript files"""
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # Replace \001 with \x01
                    new_content = content.replace('\\001', '\\x01')
                    
                    if content != new_content:
                        with open(file_path, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        print(f"Fixed escape sequences in: {file_path}")
                        
                except Exception as e:
                    print(f"Error processing {file_path}: {e}")

if __name__ == "__main__":
    fix_octal_escapes("/workspace/claimguru/src")
    print("Done fixing escape sequences!")
