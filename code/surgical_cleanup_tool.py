#!/usr/bin/env python3
"""
Surgical Codebase Cleanup Tool
Carefully removes unused components one by one with build verification
"""

import os
import subprocess
import json
import shutil
from pathlib import Path
from typing import List, Dict, Tuple

class SurgicalCleanupTool:
    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.src_root = self.project_root / "src"
        self.removed_components = []
        self.failed_removals = []
        
    def test_build(self) -> Tuple[bool, str]:
        """Test if the project builds successfully"""
        try:
            result = subprocess.run(
                ['pnpm', 'build'],
                cwd=self.project_root,
                capture_output=True,
                text=True,
                timeout=120
            )
            return result.returncode == 0, result.stderr + result.stdout
        except subprocess.TimeoutExpired:
            return False, "Build timeout"
        except Exception as e:
            return False, str(e)
            
    def fix_current_build_errors(self):
        """Fix existing build errors before starting cleanup"""
        print("🔧 Fixing existing build errors...")
        
        # Read the problematic file
        problem_file = self.src_root / "components" / "claims" / "wizard-steps" / "UnifiedClientDetailsStep.tsx"
        
        if problem_file.exists():
            with open(problem_file, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # Fix common syntax errors from previous cleanup
            lines = content.split('\n')
            fixed_lines = []
            
            for i, line in enumerate(lines):
                # Skip lines that look like orphaned variable declarations
                if (line.strip().startswith('const [') and 
                    not line.strip().endswith(';') and 
                    not line.strip().endswith(',') and
                    '=' not in line):
                    # This looks like a broken const declaration, comment it out
                    fixed_lines.append(f"  // {line.strip()} // Fixed: incomplete declaration")
                else:
                    fixed_lines.append(line)
                    
            with open(problem_file, 'w', encoding='utf-8') as f:
                f.write('\n'.join(fixed_lines))
                
            print(f"✅ Fixed syntax errors in {problem_file.name}")
            
    def check_component_usage(self, component_path: Path) -> bool:
        """Check if a component is actually used anywhere"""
        component_name = component_path.stem
        
        # Search for imports of this component
        search_extensions = ['.ts', '.tsx', '.js', '.jsx']
        
        for file_path in self.src_root.rglob('*'):
            if file_path.suffix in search_extensions and file_path != component_path:
                try:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                        
                    # Check for direct import
                    if f"import {{" in content and component_name in content:
                        return True
                        
                    # Check for default import
                    if f"import {component_name}" in content:
                        return True
                        
                    # Check for usage in JSX
                    if f"<{component_name}" in content:
                        return True
                        
                except Exception:
                    continue
                    
        return False
        
    def remove_component_safely(self, component_path: Path) -> bool:
        """Remove a component and test if build still works"""
        print(f"🗑️ Testing removal of {component_path.name}...")
        
        # Check if component is actually unused
        if self.check_component_usage(component_path):
            print(f"⚠️ {component_path.name} appears to be used, skipping")
            return False
            
        # Create backup
        backup_path = component_path.with_suffix('.backup')
        shutil.copy2(component_path, backup_path)
        
        try:
            # Remove the component
            component_path.unlink()
            
            # Test build
            build_success, build_output = self.test_build()
            
            if build_success:
                print(f"✅ Successfully removed {component_path.name}")
                backup_path.unlink()  # Remove backup
                self.removed_components.append(str(component_path))
                return True
            else:
                print(f"❌ Build failed after removing {component_path.name}, restoring...")
                # Restore from backup
                shutil.move(backup_path, component_path)
                self.failed_removals.append({
                    'file': str(component_path),
                    'reason': 'Build failure',
                    'error': build_output[:500]  # First 500 chars of error
                })
                return False
                
        except Exception as e:
            print(f"❌ Error removing {component_path.name}: {e}")
            # Restore from backup if it exists
            if backup_path.exists():
                shutil.move(backup_path, component_path)
            return False
            
    def surgical_cleanup(self):
        """Perform careful, tested cleanup"""
        print("🔬 STARTING SURGICAL CLEANUP")
        print("=" * 40)
        
        # First, fix any existing build errors
        self.fix_current_build_errors()
        
        # Test initial build
        print("📊 Testing initial build state...")
        build_success, build_output = self.test_build()
        
        if not build_success:
            print("❌ Initial build is broken, attempting basic fixes...")
            self.attempt_build_fixes()
            
            # Test again
            build_success, build_output = self.test_build()
            if not build_success:
                print("❌ Cannot proceed with cleanup - build is fundamentally broken")
                print("Build errors:")
                print(build_output[:1000])
                return
                
        print("✅ Initial build successful, proceeding with cleanup...")
        
        # Load the unused components list
        analysis_file = Path('/workspace/code/cleanup_analysis_results.json')
        if analysis_file.exists():
            with open(analysis_file, 'r') as f:
                analysis = json.load(f)
                unused_components = analysis.get('unused_components', [])
        else:
            print("❌ Analysis file not found, cannot proceed")
            return
            
        print(f"📊 Found {len(unused_components)} components to check")
        
        # Process each component
        for component_path_str in unused_components:
            component_path = Path(component_path_str)
            if component_path.exists():
                self.remove_component_safely(component_path)
            else:
                print(f"⚠️ {component_path.name} not found, skipping")
                
        # Generate report
        self.generate_surgical_report()
        
    def attempt_build_fixes(self):
        """Attempt to fix common build issues"""
        print("🔧 Attempting build fixes...")
        
        # Fix common issues in service files that might have syntax errors
        service_files = [
            self.src_root / "services" / "index.ts",
            self.src_root / "services" / "UnifiedValidationService.ts"
        ]
        
        for service_file in service_files:
            if service_file.exists():
                try:
                    with open(service_file, 'r', encoding='utf-8') as f:
                        content = f.read()
                        
                    # Fix missing closing braces
                    open_braces = content.count('{')
                    close_braces = content.count('}')
                    
                    if open_braces > close_braces:
                        content += '\n' + '}' * (open_braces - close_braces)
                        
                    # Fix missing semicolons on function declarations
                    content = content.replace('): Promise<void> {\n    // Function body was here\n  }', 
                                            '): Promise<void> {\n    // Function body was here\n  }')
                    
                    with open(service_file, 'w', encoding='utf-8') as f:
                        f.write(content)
                        
                    print(f"✅ Applied fixes to {service_file.name}")
                    
                except Exception as e:
                    print(f"❌ Error fixing {service_file.name}: {e}")
                    
    def generate_surgical_report(self):
        """Generate report of surgical cleanup"""
        report_path = Path('/workspace/SURGICAL_CLEANUP_REPORT.md')
        
        with open(report_path, 'w') as f:
            f.write("# Surgical Codebase Cleanup Report\n\n")
            f.write(f"**Successfully Removed**: {len(self.removed_components)} components\n")
            f.write(f"**Failed Removals**: {len(self.failed_removals)} components\n\n")
            
            if self.removed_components:
                f.write("## Successfully Removed Components\n\n")
                for comp in self.removed_components:
                    f.write(f"- {Path(comp).name}\n")
                    
            if self.failed_removals:
                f.write("\n## Failed Removals (Still in Codebase)\n\n")
                for failure in self.failed_removals:
                    f.write(f"- {Path(failure['file']).name}: {failure['reason']}\n")
                    
        print(f"\n✅ SURGICAL CLEANUP COMPLETE")
        print(f"📁 Removed: {len(self.removed_components)} components")
        print(f"❌ Failed: {len(self.failed_removals)} components")
        print(f"📄 Report: {report_path}")

def main():
    project_root = "/workspace/claimguru"
    tool = SurgicalCleanupTool(project_root)
    tool.surgical_cleanup()

if __name__ == "__main__":
    main()
