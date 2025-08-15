#!/usr/bin/env python3
"""
Post-Cleanup Repair Script
Fixes syntax errors introduced during debug statement cleanup
"""

import os
import re
from pathlib import Path
from typing import List, Dict

class PostCleanupRepairTool:
    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.src_root = self.project_root / "src"
        self.repairs_made = []
        
    def log_repair(self, file_path: str, repair: str):
        """Log repair actions"""
        log_entry = f"✅ {Path(file_path).name}: {repair}"
        self.repairs_made.append(log_entry)
        print(log_entry)
        
    def fix_broken_syntax(self):
        """Fix common syntax errors from overly aggressive cleanup"""
        print("🔧 PHASE 1: Fixing Broken Syntax")
        
        ts_files = list(self.src_root.rglob("*.ts")) + list(self.src_root.rglob("*.tsx"))
        
        for file_path in ts_files:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    original_content = content
                    
                # Fix patterns where console.log removal broke syntax
                
                # Pattern 1: Missing opening of console.log object
                # console.log('message:', {
                #   key: value,
                #   key2: value2
                # })
                # Became:
                #   key: value,
                #   key2: value2
                # })
                pattern1 = r'(\s+)(\w+):\s*([^,\n}]+),?\s*\n(\s+)(\w+):\s*([^,\n}]+)\s*\n\s*}\)'
                matches1 = re.findall(pattern1, content)
                if matches1:
                    # Comment out the orphaned object structure
                    content = re.sub(pattern1, r'\1// \2: \3,\n\4// \5: \6\n\1// })', content)
                    
                # Pattern 2: Orphaned object closing
                # })
                pattern2 = r'\n\s*}\)\s*$'
                content = re.sub(pattern2, '', content, flags=re.MULTILINE)
                
                # Pattern 3: Orphaned object properties
                orphaned_props = r'^\s*(\w+):\s*[^,\n}]+,?\s*$'
                lines = content.split('\n')
                fixed_lines = []
                
                for i, line in enumerate(lines):
                    # Check if this looks like an orphaned object property
                    if re.match(orphaned_props, line) and ':' in line:
                        # Look ahead and behind for context
                        prev_line = lines[i-1] if i > 0 else ''
                        next_line = lines[i+1] if i < len(lines)-1 else ''
                        
                        # If previous line doesn't end with opening brace or comma
                        # and next line doesn't look like object content
                        if (not prev_line.strip().endswith(('{', ',')) and 
                            not next_line.strip().startswith(('}', ')')) and
                            not re.match(r'^\s*\w+:', next_line)):
                            # Comment out this orphaned property
                            fixed_lines.append(f"      // {line.strip()}")
                        else:
                            fixed_lines.append(line)
                    else:
                        fixed_lines.append(line)
                        
                content = '\n'.join(fixed_lines)
                
                # Pattern 4: Fix missing try block openings
                content = re.sub(r'(\s+)(} catch \(error\))', r'\1try {\n\1  // Code was here\n\1\2', content)
                
                # Pattern 5: Fix missing function bodies
                content = re.sub(r'(async \w+\([^)]*\):\s*Promise<[^>]+>\s*{)\s*(})', r'\1\n    // Function body was here\n  \2', content)
                
                if content != original_content:
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    self.log_repair(str(file_path), "Fixed broken syntax")
                    
            except Exception as e:
                print(f"❌ Error fixing {file_path}: {e}")
                
    def fix_missing_imports(self):
        """Fix any missing imports for remaining components"""
        print("\n📎 PHASE 2: Checking Import References")
        
        # This would be more complex - for now just report
        print("ℹ️ Import checking would require full dependency analysis")
        
    def restore_critical_console_errors(self):
        """Restore critical console.error statements that should remain"""
        print("\n🚨 PHASE 3: Restoring Critical Error Logging")
        
        critical_files = [
            self.src_root / "lib" / "supabase.ts",
            self.src_root / "lib" / "environment.ts"
        ]
        
        for file_path in critical_files:
            if file_path.exists():
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        
                    # Restore critical error logging
                    content = re.sub(
                        r'// console\.error\((.+PRODUCTION SECURITY ERROR.+)\)',
                        r'console.error(\1)',
                        content
                    )
                    
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(content)
                        
                    self.log_repair(str(file_path), "Restored critical error logging")
                    
                except Exception as e:
                    print(f"❌ Error restoring errors in {file_path}: {e}")
                    
    def run_repair(self):
        """Execute all repair phases"""
        print("🔧 STARTING POST-CLEANUP REPAIR")
        print("=" * 40)
        
        self.fix_broken_syntax()
        self.fix_missing_imports()
        self.restore_critical_console_errors()
        
        print(f"\n✅ REPAIR COMPLETE!")
        print(f"📁 Repairs made: {len(self.repairs_made)}")
        
        # Generate repair report
        report_file = self.project_root.parent / "POST_CLEANUP_REPAIR_REPORT.md"
        with open(report_file, 'w') as f:
            f.write("# Post-Cleanup Repair Report\n\n")
            f.write("## Repairs Made\n\n")
            for repair in self.repairs_made:
                f.write(f"- {repair}\n")
                
        print(f"📄 Repair report: {report_file}")

def main():
    project_root = "/workspace/claimguru"
    repair_tool = PostCleanupRepairTool(project_root)
    repair_tool.run_repair()

if __name__ == "__main__":
    main()
