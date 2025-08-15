#!/usr/bin/env python3
"""
Comprehensive ClaimGuru Codebase Cleanup Analyzer
Analyzes the codebase to identify dead code, unused files, and cleanup opportunities
"""

import os
import json
import re
from pathlib import Path
from typing import Set, Dict, List, Tuple
from collections import defaultdict

class CodebaseCleanupAnalyzer:
    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.src_root = self.project_root / "src"
        self.unused_files = []
        self.unused_imports = defaultdict(list)
        self.dead_components = []
        self.temporary_files = []
        self.analysis_results = {}
        
    def analyze_typescript_imports(self) -> Dict[str, Set[str]]:
        """Analyze all TypeScript imports in the codebase"""
        import_map = defaultdict(set)
        file_imports = defaultdict(set)
        
        # Find all TypeScript files
        ts_files = list(self.src_root.rglob("*.ts")) + list(self.src_root.rglob("*.tsx"))
        
        for file_path in ts_files:
            try:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    
                # Find import statements
                import_patterns = [
                    r"import\s+(?:{[^}]+}|\*\s+as\s+\w+|\w+)\s+from\s+['\"]([^'\"]+)['\"];",
                    r"import\s+['\"]([^'\"]+)['\"];",
                    r"from\s+['\"]([^'\"]+)['\"]\s+import"
                ]
                
                for pattern in import_patterns:
                    matches = re.findall(pattern, content)
                    for match in matches:
                        if match.startswith('.'):  # Relative import
                            file_imports[str(file_path)].add(match)
                        import_map[match].add(str(file_path))
                        
            except Exception as e:
                print(f"Error reading {file_path}: {e}")
                
        return dict(import_map), dict(file_imports)
    
    def find_unused_components(self) -> List[str]:
        """Find React components that are not imported anywhere"""
        components_dir = self.src_root / "components"
        if not components_dir.exists():
            return []
            
        component_files = list(components_dir.rglob("*.tsx")) + list(components_dir.rglob("*.ts"))
        unused_components = []
        
        # Get all import statements
        import_map, _ = self.analyze_typescript_imports()
        
        for comp_file in component_files:
            component_name = comp_file.stem
            relative_path = str(comp_file.relative_to(self.src_root))
            
            # Check if this component is imported anywhere
            is_used = False
            for import_path, importers in import_map.items():
                if (component_name.lower() in import_path.lower() or 
                    relative_path.replace('\\', '/') in import_path or
                    f"./{relative_path.replace('\\', '/')}" in import_path):
                    is_used = True
                    break
                    
            if not is_used:
                unused_components.append(str(comp_file))
                
        return unused_components
    
    def find_dead_code_patterns(self) -> Dict[str, List[str]]:
        """Find common dead code patterns"""
        dead_code = {
            'commented_blocks': [],
            'unused_functions': [],
            'debug_code': [],
            'todo_comments': []
        }
        
        ts_files = list(self.src_root.rglob("*.ts")) + list(self.src_root.rglob("*.tsx"))
        
        for file_path in ts_files:
            try:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    lines = content.split('\n')
                    
                # Find large commented blocks (5+ consecutive comment lines)
                comment_block_start = None
                for i, line in enumerate(lines):
                    stripped = line.strip()
                    if stripped.startswith('//') or stripped.startswith('/*'):
                        if comment_block_start is None:
                            comment_block_start = i
                    else:
                        if comment_block_start is not None and (i - comment_block_start) >= 5:
                            dead_code['commented_blocks'].append({
                                'file': str(file_path),
                                'lines': f"{comment_block_start + 1}-{i}",
                                'size': i - comment_block_start
                            })
                        comment_block_start = None
                        
                # Find TODO/FIXME comments
                todo_pattern = r'//.*(?:TODO|FIXME|XXX|HACK)'
                for i, line in enumerate(lines):
                    if re.search(todo_pattern, line, re.IGNORECASE):
                        dead_code['todo_comments'].append({
                            'file': str(file_path),
                            'line': i + 1,
                            'content': line.strip()
                        })
                        
                # Find console.log statements
                console_pattern = r'console\.(log|debug|info|warn|error)'
                for i, line in enumerate(lines):
                    if re.search(console_pattern, line) and not line.strip().startswith('//'):
                        dead_code['debug_code'].append({
                            'file': str(file_path),
                            'line': i + 1,
                            'content': line.strip()
                        })
                        
            except Exception as e:
                print(f"Error analyzing {file_path}: {e}")
                
        return dead_code
    
    def find_obsolete_test_files(self) -> List[str]:
        """Find test files that no longer have corresponding implementation files"""
        test_files = []
        test_patterns = ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx']
        
        for pattern in test_patterns:
            test_files.extend(self.project_root.rglob(pattern))
            
        orphaned_tests = []
        
        for test_file in test_files:
            # Try to find corresponding implementation file
            test_name = test_file.stem.replace('.test', '').replace('.spec', '')
            impl_patterns = [
                test_file.parent / f"{test_name}.ts",
                test_file.parent / f"{test_name}.tsx",
                test_file.parent / f"{test_name}.js",
                test_file.parent / f"{test_name}.jsx"
            ]
            
            has_implementation = any(impl_file.exists() for impl_file in impl_patterns)
            
            if not has_implementation:
                orphaned_tests.append(str(test_file))
                
        return orphaned_tests
    
    def find_unused_assets(self) -> List[str]:
        """Find unused static assets (images, fonts, etc.)"""
        public_dir = self.project_root / "public"
        if not public_dir.exists():
            return []
            
        asset_files = []
        asset_extensions = {'.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.pdf', '.webp'}
        
        for file_path in public_dir.rglob("*"):
            if file_path.suffix.lower() in asset_extensions:
                asset_files.append(file_path)
                
        # Check if assets are referenced in code
        unused_assets = []
        all_source_files = list(self.src_root.rglob("*")) + [self.project_root / "index.html"]
        
        for asset in asset_files:
            asset_name = asset.name
            is_referenced = False
            
            for source_file in all_source_files:
                if source_file.is_file() and source_file.suffix in {'.ts', '.tsx', '.js', '.jsx', '.html', '.css', '.scss'}:
                    try:
                        with open(source_file, 'r', encoding='utf-8', errors='ignore') as f:
                            content = f.read()
                            if asset_name in content:
                                is_referenced = True
                                break
                    except:
                        continue
                        
            if not is_referenced:
                unused_assets.append(str(asset))
                
        return unused_assets
    
    def analyze_package_dependencies(self) -> Dict[str, List[str]]:
        """Analyze package.json for potentially unused dependencies"""
        package_json = self.project_root / "package.json"
        if not package_json.exists():
            return {'unused_dependencies': [], 'dev_dependencies': []}
            
        with open(package_json, 'r') as f:
            package_data = json.load(f)
            
        dependencies = package_data.get('dependencies', {})
        dev_dependencies = package_data.get('devDependencies', {})
        
        # Simple check - look for imports in source files
        all_source_content = ""
        ts_files = list(self.src_root.rglob("*.ts")) + list(self.src_root.rglob("*.tsx"))
        
        for file_path in ts_files:
            try:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    all_source_content += f.read() + "\n"
            except:
                continue
                
        potentially_unused = []
        for dep_name in dependencies.keys():
            if dep_name not in all_source_content and not any([
                dep_name.replace('-', '').lower() in all_source_content.lower(),
                dep_name.replace('@', '').replace('/', '') in all_source_content
            ]):
                potentially_unused.append(dep_name)
                
        return {
            'potentially_unused_dependencies': potentially_unused,
            'total_dependencies': len(dependencies),
            'total_dev_dependencies': len(dev_dependencies)
        }
    
    def run_comprehensive_analysis(self) -> Dict:
        """Run all analysis functions and compile results"""
        print("🔍 Starting comprehensive codebase analysis...")
        
        print("📂 Analyzing imports and components...")
        import_map, file_imports = self.analyze_typescript_imports()
        unused_components = self.find_unused_components()
        
        print("💀 Finding dead code patterns...")
        dead_code = self.find_dead_code_patterns()
        
        print("🧪 Analyzing test files...")
        orphaned_tests = self.find_obsolete_test_files()
        
        print("🖼️ Checking unused assets...")
        unused_assets = self.find_unused_assets()
        
        print("📦 Analyzing package dependencies...")
        dependency_analysis = self.analyze_package_dependencies()
        
        results = {
            'summary': {
                'total_typescript_files': len(list(self.src_root.rglob("*.ts")) + list(self.src_root.rglob("*.tsx"))),
                'unused_components_count': len(unused_components),
                'commented_blocks_count': len(dead_code['commented_blocks']),
                'debug_statements_count': len(dead_code['debug_code']),
                'orphaned_tests_count': len(orphaned_tests),
                'unused_assets_count': len(unused_assets)
            },
            'unused_components': unused_components,
            'dead_code': dead_code,
            'orphaned_tests': orphaned_tests,
            'unused_assets': unused_assets,
            'dependency_analysis': dependency_analysis,
            'import_statistics': {
                'total_import_paths': len(import_map),
                'files_with_imports': len(file_imports)
            }
        }
        
        return results

def main():
    project_root = "/workspace/claimguru"
    analyzer = CodebaseCleanupAnalyzer(project_root)
    
    # Run analysis
    results = analyzer.run_comprehensive_analysis()
    
    # Save results
    output_file = "/workspace/code/cleanup_analysis_results.json"
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2, default=str)
    
    print(f"\n✅ Analysis complete! Results saved to {output_file}")
    
    # Print summary
    print("\n📊 CLEANUP ANALYSIS SUMMARY:")
    print(f"📄 Total TypeScript files: {results['summary']['total_typescript_files']}")
    print(f"🗑️ Unused components: {results['summary']['unused_components_count']}")
    print(f"💬 Large commented blocks: {results['summary']['commented_blocks_count']}")
    print(f"🐛 Debug statements: {results['summary']['debug_statements_count']}")
    print(f"🧪 Orphaned test files: {results['summary']['orphaned_tests_count']}")
    print(f"🖼️ Unused assets: {results['summary']['unused_assets_count']}")
    
    if results['dependency_analysis']['potentially_unused_dependencies']:
        print(f"📦 Potentially unused deps: {len(results['dependency_analysis']['potentially_unused_dependencies'])}")

if __name__ == "__main__":
    main()
