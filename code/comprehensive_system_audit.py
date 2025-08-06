#!/usr/bin/env python3
"""
Comprehensive ClaimGuru System Audit Script
Analyzes codebase for duplicates, unused code, and generates production roadmap
"""

import os
import re
import json
from pathlib import Path
from collections import defaultdict, Counter
from typing import Dict, List, Set, Tuple

class ClaimGuruAuditor:
    def __init__(self, project_root: str = "/workspace/claimguru"):
        self.project_root = Path(project_root)
        self.src_path = self.project_root / "src"
        self.components_path = self.src_path / "components"
        self.services_path = self.src_path / "services"
        self.pages_path = self.src_path / "pages"
        self.hooks_path = self.src_path / "hooks"
        
        # Analysis results
        self.component_usage = defaultdict(list)
        self.service_usage = defaultdict(list)
        self.import_analysis = defaultdict(set)
        self.duplicate_functions = defaultdict(list)
        self.wizard_components = defaultdict(list)
        self.wizard_analysis = {}
        
    def analyze_imports_in_file(self, file_path: Path) -> Set[str]:
        """Extract all imports from a TypeScript/JavaScript file"""
        imports = set()
        if not file_path.exists():
            return imports
            
        try:
            content = file_path.read_text(encoding='utf-8')
            
            # Match various import patterns
            import_patterns = [
                r"import\s+.*?from\s+['\"](.+?)['\"]",  # Standard imports
                r"import\s*\(\s*['\"](.+?)['\"]\s*\)",   # Dynamic imports
                r"require\s*\(\s*['\"](.+?)['\"]\s*\)",  # CommonJS requires
            ]
            
            for pattern in import_patterns:
                matches = re.findall(pattern, content, re.MULTILINE)
                for match in matches:
                    # Clean up the import path
                    clean_import = match.strip()
                    if clean_import.startswith('./') or clean_import.startswith('../'):
                        # Convert relative imports to component names
                        component_name = clean_import.split('/')[-1]
                        if component_name:
                            imports.add(component_name)
                    elif '/' in clean_import and not clean_import.startswith('@'):
                        # Internal imports
                        imports.add(clean_import.split('/')[-1])
                        
        except Exception as e:
            print(f"Error reading {file_path}: {e}")
            
        return imports
    
    def find_component_references(self, component_name: str, search_content: str) -> List[str]:
        """Find references to a component in file content"""
        references = []
        
        # Pattern to match component usage in JSX
        patterns = [
            rf"<{component_name}[\s/>]",  # JSX tag
            rf"\b{component_name}\s*\(",   # Function call
            rf"import.*{component_name}",   # Import statement
            rf"export.*{component_name}",   # Export statement
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, search_content, re.IGNORECASE)
            references.extend(matches)
            
        return references
    
    def analyze_wizard_components(self):
        """Analyze wizard-specific components and their relationships"""
        wizard_files = [
            "ComprehensiveManualIntakeWizard.tsx",
            "EnhancedAIClaimWizard.tsx", 
            "ManualIntakeWizard.tsx",
            "StreamlinedManualWizard.tsx",
            "SimpleTestWizard.tsx",
            "SimpleCompletionStep.tsx"
        ]
        
        for wizard_file in wizard_files:
            wizard_path = self.components_path / "claims" / wizard_file
            if wizard_path.exists():
                try:
                    content = wizard_path.read_text(encoding='utf-8')
                    imports = self.analyze_imports_in_file(wizard_path)
                    self.wizard_components[wizard_file] = list(imports)
                    
                    # Analyze wizard complexity and purpose
                    lines = len(content.split('\n'))
                    imports_count = len(imports)
                    
                    self.wizard_analysis[wizard_file] = {
                        'lines_of_code': lines,
                        'import_count': imports_count,
                        'imported_components': list(imports),
                        'file_size_kb': len(content.encode('utf-8')) / 1024,
                        'ai_related': 'ai' in content.lower() or 'AI' in content,
                        'pdf_related': 'pdf' in content.lower() or 'PDF' in content,
                        'extraction_related': 'extract' in content.lower()
                    }
                except Exception as e:
                    print(f"Error analyzing wizard {wizard_file}: {e}")
    
    def analyze_component_usage(self):
        """Analyze which components are used where"""
        if not self.components_path.exists():
            print(f"Components path not found: {self.components_path}")
            return
            
        # Get all component files
        component_files = []
        for root, dirs, files in os.walk(self.components_path):
            for file in files:
                if file.endswith(('.tsx', '.ts')):
                    component_files.append(Path(root) / file)
        
        print(f"Found {len(component_files)} component files")
        
        # Analyze each component
        for component_file in component_files:
            component_name = component_file.stem
            
            # Search for usage across entire src directory
            usage_files = []
            for root, dirs, files in os.walk(self.src_path):
                for file in files:
                    if file.endswith(('.tsx', '.ts', '.js')):
                        file_path = Path(root) / file
                        if file_path != component_file:  # Don't include self
                            try:
                                content = file_path.read_text(encoding='utf-8')
                                references = self.find_component_references(component_name, content)
                                if references:
                                    relative_path = file_path.relative_to(self.src_path)
                                    usage_files.append(str(relative_path))
                            except Exception as e:
                                continue
            
            self.component_usage[component_name] = usage_files
    
    def analyze_services_usage(self):
        """Analyze service file usage and potential duplicates"""
        if not self.services_path.exists():
            print(f"Services path not found: {self.services_path}")
            return
            
        service_files = list(self.services_path.glob("*.ts"))
        print(f"Found {len(service_files)} service files")
        
        for service_file in service_files:
            service_name = service_file.stem
            
            # Search for usage
            usage_files = []
            for root, dirs, files in os.walk(self.src_path):
                for file in files:
                    if file.endswith(('.tsx', '.ts', '.js')):
                        file_path = Path(root) / file
                        if file_path != service_file:
                            try:
                                content = file_path.read_text(encoding='utf-8')
                                if service_name in content:
                                    relative_path = file_path.relative_to(self.src_path)
                                    usage_files.append(str(relative_path))
                            except Exception as e:
                                continue
            
            self.service_usage[service_name] = usage_files
    
    def find_duplicate_functions(self):
        """Find potentially duplicate functions across services"""
        function_signatures = defaultdict(list)
        
        # Analyze all TypeScript files for function signatures
        for root, dirs, files in os.walk(self.src_path):
            for file in files:
                if file.endswith(('.ts', '.tsx')):
                    file_path = Path(root) / file
                    try:
                        content = file_path.read_text(encoding='utf-8')
                        
                        # Find function declarations
                        function_patterns = [
                            r"export\s+(?:async\s+)?function\s+(\w+)",
                            r"(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?(?:\([^)]*\)\s*=>|\([^)]*\)\s*=>\s*{)",
                            r"(\w+)\s*:\s*(?:async\s+)?\([^)]*\)\s*=>"
                        ]
                        
                        for pattern in function_patterns:
                            matches = re.findall(pattern, content)
                            for match in matches:
                                func_name = match if isinstance(match, str) else match[0]
                                relative_path = file_path.relative_to(self.src_path)
                                function_signatures[func_name].append(str(relative_path))
                                
                    except Exception as e:
                        continue
        
        # Find potential duplicates
        for func_name, locations in function_signatures.items():
            if len(locations) > 1:
                self.duplicate_functions[func_name] = locations
    
    def identify_unused_components(self) -> Dict[str, List[str]]:
        """Identify components that appear to be unused"""
        unused = {}
        potentially_unused = {}
        
        for component, usage_files in self.component_usage.items():
            if not usage_files:
                unused[component] = []
            elif len(usage_files) == 1:
                potentially_unused[component] = usage_files
        
        return {
            "definitely_unused": unused,
            "potentially_unused": potentially_unused
        }
    
    def analyze_wizard_step_components(self):
        """Specifically analyze wizard step components"""
        wizard_steps_path = self.components_path / "claims" / "wizard-steps"
        if not wizard_steps_path.exists():
            print(f"Wizard steps path not found: {wizard_steps_path}")
            return {}
            
        step_files = list(wizard_steps_path.glob("*.tsx"))
        step_analysis = {}
        
        for step_file in step_files:
            step_name = step_file.stem
            
            # Check usage in parent wizards
            usage_in_wizards = []
            for wizard_file, components in self.wizard_components.items():
                if step_name in components or step_name.replace('Step', '') in ' '.join(components):
                    usage_in_wizards.append(wizard_file)
            
            step_analysis[step_name] = {
                'used_in_wizards': usage_in_wizards,
                'total_usage': len(self.component_usage.get(step_name, [])),
                'usage_files': self.component_usage.get(step_name, [])
            }
        
        return step_analysis
    
    def generate_audit_report(self) -> Dict:
        """Generate comprehensive audit report"""
        unused_analysis = self.identify_unused_components()
        step_analysis = self.analyze_wizard_step_components()
        
        report = {
            'summary': {
                'total_components': len(self.component_usage),
                'total_services': len(self.service_usage),
                'unused_components': len(unused_analysis['definitely_unused']),
                'potentially_unused_components': len(unused_analysis['potentially_unused']),
                'duplicate_functions': len(self.duplicate_functions),
                'wizard_files': len(self.wizard_analysis)
            },
            'unused_components': unused_analysis,
            'wizard_analysis': self.wizard_analysis,
            'wizard_step_analysis': step_analysis,
            'service_usage': dict(self.service_usage),
            'duplicate_functions': dict(self.duplicate_functions),
            'detailed_component_usage': dict(self.component_usage)
        }
        
        return report
    
    def run_full_audit(self):
        """Run complete system audit"""
        print("Starting comprehensive ClaimGuru system audit...")
        
        print("1. Analyzing wizard components...")
        self.analyze_wizard_components()
        
        print("2. Analyzing component usage...")
        self.analyze_component_usage()
        
        print("3. Analyzing service usage...")
        self.analyze_services_usage()
        
        print("4. Finding duplicate functions...")
        self.find_duplicate_functions()
        
        print("5. Generating audit report...")
        report = self.generate_audit_report()
        
        return report

def main():
    auditor = ClaimGuruAuditor()
    report = auditor.run_full_audit()
    
    # Save detailed report
    output_file = "/workspace/comprehensive_system_audit_report.json"
    with open(output_file, 'w') as f:
        json.dump(report, f, indent=2)
    
    print(f"\n✅ Audit complete! Report saved to: {output_file}")
    
    # Print summary
    print("\n" + "="*60)
    print("CLAIMGURU SYSTEM AUDIT SUMMARY")
    print("="*60)
    print(f"Total Components: {report['summary']['total_components']}")
    print(f"Total Services: {report['summary']['total_services']}")
    print(f"Unused Components: {report['summary']['unused_components']}")
    print(f"Potentially Unused: {report['summary']['potentially_unused_components']}")
    print(f"Duplicate Functions: {report['summary']['duplicate_functions']}")
    print(f"Wizard Files: {report['summary']['wizard_files']}")
    
    if report['unused_components']['definitely_unused']:
        print(f"\n🗑️  DEFINITELY UNUSED COMPONENTS:")
        for comp in report['unused_components']['definitely_unused']:
            print(f"   - {comp}")
    
    if report['wizard_analysis']:
        print(f"\n🧙 WIZARD ANALYSIS:")
        for wizard, analysis in report['wizard_analysis'].items():
            print(f"   {wizard}: {analysis['lines_of_code']} lines, {analysis['import_count']} imports")
    
    return report

if __name__ == "__main__":
    main()
