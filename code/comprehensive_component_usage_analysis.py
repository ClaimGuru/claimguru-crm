#!/usr/bin/env python3
"""
Comprehensive Component Usage Analysis
Checks ALL possible usages of wizard step components across the entire codebase
"""

import os
import re
from pathlib import Path
from collections import defaultdict
import json

def comprehensive_component_analysis():
    """Analyze all wizard step component usage across entire codebase"""
    
    base_path = Path("/workspace/claimguru")
    wizard_steps_path = base_path / "src/components/claims/wizard-steps"
    
    results = {
        "component_files": [],
        "usage_analysis": {},
        "wizard_files": [],
        "other_usage": {},
        "import_patterns": {},
        "recommendations": {
            "definitely_unused": [],
            "potentially_unused": [],
            "actively_used": [],
            "future_implementation": [],
            "different_workflows": []
        }
    }
    
    print("🔍 Comprehensive ClaimGuru Component Usage Analysis...")
    print("=" * 70)
    
    # 1. Get all wizard step component files
    if wizard_steps_path.exists():
        component_files = list(wizard_steps_path.glob("*.tsx"))
        results["component_files"] = [f.name for f in component_files]
        print(f"📁 Found {len(component_files)} wizard step components")
    else:
        print("❌ Wizard steps directory not found!")
        return results
    
    # 2. Find all wizard-related files that might import components
    wizard_patterns = [
        "**/claims/*wizard*.tsx",
        "**/claims/*Wizard*.tsx", 
        "**/*wizard*.tsx",
        "**/*Wizard*.tsx"
    ]
    
    wizard_files = set()
    for pattern in wizard_patterns:
        wizard_files.update(base_path.glob(pattern))
    
    results["wizard_files"] = [str(f.relative_to(base_path)) for f in wizard_files]
    
    print(f"\n📋 Found {len(wizard_files)} wizard-related files:")
    for wf in sorted(wizard_files):
        rel_path = wf.relative_to(base_path)
        print(f"   • {rel_path}")
    
    # 3. Analyze usage in each wizard file
    print(f"\n🔎 Analyzing component imports in wizard files:")
    
    for wizard_file in wizard_files:
        if wizard_file.exists():
            try:
                with open(wizard_file, 'r') as f:
                    content = f.read()
                
                # Find import statements for wizard steps
                import_pattern = r"import.*?from\s+['\"]\.\/wizard-steps\/([^'\"]+)['\"]"
                imports = re.findall(import_pattern, content)
                
                # Also check for dynamic imports or references
                reference_pattern = r"wizard-steps\/([^'\"]+\.tsx?)"
                references = re.findall(reference_pattern, content)
                
                all_refs = list(set(imports + references))
                
                if all_refs:
                    results["usage_analysis"][str(wizard_file.relative_to(base_path))] = all_refs
                    print(f"   📄 {wizard_file.name}: {len(all_refs)} components")
                    for ref in sorted(all_refs):
                        print(f"     • {ref}")
                else:
                    print(f"   📄 {wizard_file.name}: No wizard-step imports found")
                    
            except Exception as e:
                print(f"   ❌ Error reading {wizard_file.name}: {e}")
    
    # 4. Search for ANY references to wizard step components across entire src directory
    print(f"\n🌐 Searching for references across entire src directory:")
    
    src_path = base_path / "src"
    all_refs = defaultdict(list)
    
    # Search all .tsx and .ts files
    for file_path in src_path.rglob("*.tsx"):
        if file_path.exists() and "wizard-steps" not in str(file_path):
            try:
                with open(file_path, 'r') as f:
                    content = f.read()
                
                # Check for any reference to wizard step files
                for comp_file in results["component_files"]:
                    comp_name = comp_file.replace('.tsx', '')
                    # Look for imports, references, or mentions
                    patterns = [
                        f"from.*wizard-steps.*{comp_name}",
                        f"import.*{comp_name}",
                        f"wizard-steps/{comp_file}",
                        f"wizard-steps/{comp_name}"
                    ]
                    
                    for pattern in patterns:
                        if re.search(pattern, content, re.IGNORECASE):
                            all_refs[comp_file].append(str(file_path.relative_to(base_path)))
                            break
                            
            except Exception as e:
                continue
    
    results["other_usage"] = dict(all_refs)
    
    # 5. Analyze component patterns to identify workflows
    print(f"\n🏷️  Analyzing component patterns:")
    
    workflow_patterns = {
        "AI_Enhanced": ["enhanced", "ai", "intelligent", "smart"],
        "Manual_Only": ["manual"],
        "PDF_Processing": ["pdf", "extraction", "upload", "document"],
        "Validation": ["validation", "review"],
        "Testing": ["test", "simple", "demo"],
        "Real_Implementation": ["real", "actual", "working", "fixed"]
    }
    
    for workflow, keywords in workflow_patterns.items():
        matching_components = []
        for comp in results["component_files"]:
            if any(keyword in comp.lower() for keyword in keywords):
                matching_components.append(comp)
        
        if matching_components:
            print(f"   {workflow}: {len(matching_components)} components")
            for comp in matching_components:
                used_in = []
                # Check if used anywhere
                for wizard_file, imports in results["usage_analysis"].items():
                    if any(comp.replace('.tsx', '') in imp for imp in imports):
                        used_in.append(wizard_file)
                if comp in results["other_usage"]:
                    used_in.extend(results["other_usage"][comp])
                
                status = "✅ USED" if used_in else "❓ UNUSED"
                print(f"     • {comp} {status}")
                if used_in:
                    for usage in used_in[:2]:  # Show first 2 usages
                        print(f"       → {usage}")
    
    # 6. Create comprehensive recommendations
    print(f"\n💡 Comprehensive Analysis Results:")
    
    total_components = len(results["component_files"])
    used_components = set()
    
    # Collect all used components
    for imports in results["usage_analysis"].values():
        for imp in imports:
            # Add .tsx if not present
            if not imp.endswith('.tsx'):
                imp += '.tsx'
            used_components.add(imp)
    
    # Add components found in other usages
    used_components.update(results["other_usage"].keys())
    
    unused_components = set(results["component_files"]) - used_components
    
    # Categorize components
    for comp in results["component_files"]:
        comp_lower = comp.lower()
        
        if comp in used_components:
            results["recommendations"]["actively_used"].append(comp)
        elif any(keyword in comp_lower for keyword in ["test", "simple", "demo"]):
            results["recommendations"]["potentially_unused"].append(comp)
        elif any(keyword in comp_lower for keyword in ["enhanced", "intelligent", "smart"]):
            results["recommendations"]["future_implementation"].append(comp)
        elif any(keyword in comp_lower for keyword in ["manual", "real", "actual", "working"]):
            results["recommendations"]["different_workflows"].append(comp)
        else:
            results["recommendations"]["definitely_unused"].append(comp)
    
    print(f"   ✅ Actively Used: {len(results['recommendations']['actively_used'])} components")
    print(f"   🚀 Future Implementation: {len(results['recommendations']['future_implementation'])} components")
    print(f"   🔄 Different Workflows: {len(results['recommendations']['different_workflows'])} components")
    print(f"   ❓ Potentially Unused: {len(results['recommendations']['potentially_unused'])} components")
    print(f"   ❌ Definitely Unused: {len(results['recommendations']['definitely_unused'])} components")
    
    # 7. Updated recommendations
    print(f"\n🎯 UPDATED Recommendations:")
    
    if results["recommendations"]["actively_used"]:
        print(f"   KEEP - Actively Used ({len(results['recommendations']['actively_used'])}):")
        for comp in sorted(results["recommendations"]["actively_used"]):
            print(f"     • {comp}")
    
    if results["recommendations"]["future_implementation"]:
        print(f"   REVIEW - Likely Future AI Implementation ({len(results['recommendations']['future_implementation'])}):")
        for comp in sorted(results["recommendations"]["future_implementation"]):
            print(f"     • {comp}")
    
    if results["recommendations"]["different_workflows"]:
        print(f"   REVIEW - Different Workflow Variants ({len(results['recommendations']['different_workflows'])}):")
        for comp in sorted(results["recommendations"]["different_workflows"]):
            print(f"     • {comp}")
    
    if results["recommendations"]["potentially_unused"]:
        print(f"   ARCHIVE - Testing/Development Only ({len(results['recommendations']['potentially_unused'])}):")
        for comp in sorted(results["recommendations"]["potentially_unused"]):
            print(f"     • {comp}")
    
    if results["recommendations"]["definitely_unused"]:
        print(f"   DELETE - No References Found ({len(results['recommendations']['definitely_unused'])}):")
        for comp in sorted(results["recommendations"]["definitely_unused"]):
            print(f"     • {comp}")
    
    print()
    print("=" * 70)
    print("✅ Comprehensive analysis complete!")
    
    # Save detailed results
    with open("/workspace/comprehensive_component_usage_analysis.json", "w") as f:
        json.dump(results, f, indent=2)
    
    print("📄 Detailed results saved to: /workspace/comprehensive_component_usage_analysis.json")
    
    return results

if __name__ == "__main__":
    comprehensive_component_analysis()
