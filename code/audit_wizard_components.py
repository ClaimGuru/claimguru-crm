#!/usr/bin/env python3
"""
ClaimGuru Wizard Component Audit Script
Analyzes wizard step components to identify redundancy and usage patterns
"""

import os
import re
from pathlib import Path
from collections import defaultdict
import json

def analyze_wizard_components():
    """Analyze wizard step components and their usage"""
    
    base_path = Path("/workspace/claimguru")
    wizard_steps_path = base_path / "src/components/claims/wizard-steps"
    main_wizard_path = base_path / "src/components/claims/ComprehensiveManualIntakeWizard.tsx"
    
    results = {
        "component_files": [],
        "main_wizard_imports": [],
        "categorized_components": {
            "client_related": [],
            "insurance_related": [],
            "policy_related": [],
            "pdf_related": [],
            "loss_related": [],
            "building_related": [],
            "other": []
        },
        "redundancy_groups": [],
        "recommendations": []
    }
    
    print("🔍 Starting ClaimGuru Wizard Component Audit...")
    print("=" * 60)
    
    # 1. List all wizard step component files
    if wizard_steps_path.exists():
        component_files = list(wizard_steps_path.glob("*.tsx"))
        results["component_files"] = [f.name for f in component_files]
        print(f"📁 Found {len(component_files)} wizard step components:")
        for comp in sorted(component_files):
            print(f"   • {comp.name}")
    else:
        print("❌ Wizard steps directory not found!")
        return results
    
    print()
    
    # 2. Analyze main wizard imports
    if main_wizard_path.exists():
        with open(main_wizard_path, 'r') as f:
            content = f.read()
            
        # Find import statements for wizard steps
        import_pattern = r"import.*?from\s+['\"]\.\/wizard-steps\/([^'\"]+)['\"]"
        imports = re.findall(import_pattern, content)
        results["main_wizard_imports"] = imports
        
        print(f"📥 Main wizard imports {len(imports)} components:")
        for imp in imports:
            print(f"   • {imp}")
    else:
        print("❌ Main wizard file not found!")
    
    print()
    
    # 3. Categorize components by functionality
    print("🏷️  Categorizing components by functionality:")
    
    categorization_rules = {
        "client_related": ["client", "insured", "details"],
        "insurance_related": ["insurance", "insurer", "carrier"],
        "policy_related": ["policy", "coverage"],
        "pdf_related": ["pdf", "extraction", "upload", "document"],
        "loss_related": ["loss", "claim", "damage"],
        "building_related": ["building", "construction", "property"],
        "mortgage_related": ["mortgage", "lender"],
        "referral_related": ["referral", "source"],
        "task_related": ["task", "office", "completion"]
    }
    
    for component in results["component_files"]:
        component_lower = component.lower()
        categorized = False
        
        for category, keywords in categorization_rules.items():
            if any(keyword in component_lower for keyword in keywords):
                if category not in results["categorized_components"]:
                    results["categorized_components"][category] = []
                results["categorized_components"][category].append(component)
                categorized = True
                break
        
        if not categorized:
            results["categorized_components"]["other"].append(component)
    
    for category, components in results["categorized_components"].items():
        if components:
            print(f"   {category.replace('_', ' ').title()}: {len(components)} components")
            for comp in sorted(components):
                is_imported = any(imp in comp for imp in results["main_wizard_imports"])
                status = "✅ USED" if is_imported else "❓ UNUSED"
                print(f"     • {comp} {status}")
    
    print()
    
    # 4. Identify redundancy groups
    print("🔄 Identifying potential redundancy groups:")
    
    redundancy_patterns = [
        {
            "name": "Client Information Steps",
            "pattern": ["client", "insured", "details"],
            "components": results["categorized_components"].get("client_related", [])
        },
        {
            "name": "Insurance Information Steps", 
            "pattern": ["insurance", "insurer", "carrier"],
            "components": results["categorized_components"].get("insurance_related", [])
        },
        {
            "name": "PDF Processing Steps",
            "pattern": ["pdf", "extraction", "upload"],
            "components": results["categorized_components"].get("pdf_related", [])
        },
        {
            "name": "Loss/Claim Information Steps",
            "pattern": ["loss", "claim", "damage"], 
            "components": results["categorized_components"].get("loss_related", [])
        }
    ]
    
    for group in redundancy_patterns:
        if len(group["components"]) > 1:
            results["redundancy_groups"].append(group)
            print(f"   🔴 {group['name']}: {len(group['components'])} components (NEEDS CONSOLIDATION)")
            for comp in group["components"]:
                is_imported = any(imp in comp for imp in results["main_wizard_imports"])
                status = "✅ USED" if is_imported else "❌ UNUSED"
                print(f"     • {comp} {status}")
        elif len(group["components"]) == 1:
            print(f"   ✅ {group['name']}: {len(group['components'])} component (OK)")
    
    print()
    
    # 5. Generate recommendations
    print("💡 Recommendations:")
    
    total_components = len(results["component_files"])
    used_components = len([c for c in results["component_files"] 
                          if any(imp in c for imp in results["main_wizard_imports"])])
    unused_components = total_components - used_components
    
    results["recommendations"] = [
        f"CRITICAL: {unused_components} of {total_components} components appear unused ({unused_components/total_components*100:.1f}%)",
        f"Archive {unused_components} unused components to archived_versions/wizard-steps/",
        "Consolidate redundant component groups into single master components",
        "Test main wizard functionality after each consolidation step",
        "Create integration points for Rolodex database system"
    ]
    
    for i, rec in enumerate(results["recommendations"], 1):
        print(f"   {i}. {rec}")
    
    print()
    
    # 6. Generate specific action items
    print("🎯 Immediate Action Items:")
    action_items = [
        "Move unused components to archived_versions/wizard-steps/",
        "Consolidate client information components into single ClientInformationStep.tsx",
        "Consolidate insurance components into single InsurerInformationStep.tsx", 
        "Consolidate PDF components into single PolicyDocumentUploadStep.tsx",
        "Test build after each consolidation step",
        "Verify main wizard imports work with consolidated components"
    ]
    
    for i, action in enumerate(action_items, 1):
        print(f"   {i}. {action}")
    
    print()
    print("=" * 60)
    print("✅ Audit complete! See results above and execute action items.")
    
    # Save results to JSON file
    with open("/workspace/wizard_component_audit_results.json", "w") as f:
        json.dump(results, f, indent=2)
    
    print("📄 Detailed results saved to: /workspace/wizard_component_audit_results.json")
    
    return results

if __name__ == "__main__":
    analyze_wizard_components()
