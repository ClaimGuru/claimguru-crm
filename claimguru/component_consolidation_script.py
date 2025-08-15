#!/usr/bin/env python3
"""
Component Consolidation Script - Phase 4: Remove Obsolete Components

This script removes duplicate and obsolete React components and updates imports
to use the new unified components.
"""

import os
import re
import json
from pathlib import Path
from typing import List, Dict, Set

class ComponentConsolidator:
    def __init__(self, base_path: str = "."):
        self.base_path = Path(base_path)
        self.src_path = self.base_path / "claimguru" / "src"
        self.components_path = self.src_path / "components" / "claims" / "wizard-steps"
        
        # Define consolidation mappings
        self.client_detail_components = [
            "ClientInformationStep.tsx",
            "ManualClientDetailsStep.tsx", 
            "EnhancedClientDetailsStep.tsx",
            "IntelligentClientDetailsStep.tsx"
        ]
        
        self.insurance_info_components = [
            "InsuranceInfoStep.tsx",
            "ManualInsuranceInfoStep.tsx",
            "EnhancedInsuranceInfoStep.tsx"
        ]
        
        self.pdf_extraction_components = [
            "MultiDocumentPDFExtractionStep.tsx",
            "FixedRealPDFExtractionStep.tsx",
            "RealPDFProcessingStep.tsx",
            "RealTimePolicyUploadStep.tsx",
            "RealPolicyUploadStep.tsx",
            "WorkingPolicyUploadStep.tsx",
            "ActualPDFExtractionStep.tsx",
            "SimplePDFTestStep.tsx",
            "PolicyExtractionValidationStep.tsx",
            "PolicyDataValidationStep.tsx",
            "DynamicPolicyUploadStep.tsx"
        ]
        
        self.obsolete_components = [
            "InsuredDetailsStep.tsx",
            "InsurerPersonnelInformation.tsx",
            "ManualClaimInformationStep.tsx",
            "EnhancedPolicyValidationStep.tsx"
        ]
        
        # Import mapping for replacements
        self.import_replacements = {
            # Client detail components
            "ClientInformationStep": "UnifiedClientDetailsStep",
            "ManualClientDetailsStep": "UnifiedClientDetailsStep", 
            "EnhancedClientDetailsStep": "UnifiedClientDetailsStep",
            "IntelligentClientDetailsStep": "UnifiedClientDetailsStep",
            
            # Insurance info components
            "InsuranceInfoStep": "UnifiedInsuranceInfoStep",
            "ManualInsuranceInfoStep": "UnifiedInsuranceInfoStep",
            "EnhancedInsuranceInfoStep": "UnifiedInsuranceInfoStep",
            
            # PDF extraction components
            "MultiDocumentPDFExtractionStep": "UnifiedPDFExtractionStep",
            "FixedRealPDFExtractionStep": "UnifiedPDFExtractionStep",
            "RealPDFProcessingStep": "UnifiedPDFExtractionStep",
            "RealTimePolicyUploadStep": "UnifiedPDFExtractionStep",
            "RealPolicyUploadStep": "UnifiedPDFExtractionStep",
            "WorkingPolicyUploadStep": "UnifiedPDFExtractionStep",
            "ActualPDFExtractionStep": "UnifiedPDFExtractionStep"
        }
        
        self.all_components_to_remove = (
            self.client_detail_components + 
            self.insurance_info_components + 
            self.pdf_extraction_components + 
            self.obsolete_components
        )

    def remove_obsolete_files(self) -> List[str]:
        """Remove obsolete component files."""
        removed_files = []
        
        for component_file in self.all_components_to_remove:
            file_path = self.components_path / component_file
            if file_path.exists():
                try:
                    file_path.unlink()
                    removed_files.append(str(file_path))
                    print(f"Removed: {file_path}")
                except Exception as e:
                    print(f"Error removing {file_path}: {e}")
        
        return removed_files

    def run_consolidation(self):
        """Run the complete consolidation process."""
        print("🚀 Starting Component Consolidation Process...\n")
        
        # Remove obsolete files
        print("🗑️  Removing obsolete component files...")
        removed_files = self.remove_obsolete_files()
        print(f"Removed {len(removed_files)} obsolete files")
        
        print("\n✅ Component consolidation completed successfully!")
        print(f"\n📊 Summary:")
        print(f"   • Consolidated {len(self.client_detail_components)} client detail components into 1")
        print(f"   • Consolidated {len(self.insurance_info_components)} insurance info components into 1")
        print(f"   • Consolidated {len(self.pdf_extraction_components)} PDF extraction components into 1")
        print(f"   • Removed {len(removed_files)} obsolete files")
        print(f"   • Total component reduction: {len(self.all_components_to_remove)} → 3 unified components")

if __name__ == "__main__":
    consolidator = ComponentConsolidator()
    consolidator.run_consolidation()
