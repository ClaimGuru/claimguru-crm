# EMERGENCY CODEBASE CLEANUP

## WHAT I'M FIXING (NO CHARGE TO USER)

This cleanup addresses the mess created during development where multiple implementations were created instead of one clean solution.

### DUPLICATE FILES TO REMOVE:

**PDF Services (keeping ONLY 1):**
- ❌ productionPdfExtractionService.ts 
- ❌ enhancedPdfService.ts
- ❌ workingPdfService.ts
- ❌ simplifiedPdfService.ts
- ❌ advancedPdfExtractionService.ts
- ❌ textractService.ts
- ❌ enhancedTesseractService.ts
- ❌ googleVisionService.ts
- ❌ tieredPdfService.ts
- ✅ KEEP: pdfExtractionService.ts (ONE WORKING VERSION)

**Claim Wizards (keeping ONLY 1):**
- ❌ ClaimIntakeWizard.tsx (91,539 lines!)
- ❌ AdvancedClaimIntakeWizard.tsx
- ❌ AdvancedClaimIntakeWizardNew.tsx
- ✅ KEEP: EnhancedAIClaimWizard.tsx (WORKING VERSION)

**Wizard Steps:**
- Review all 35 components, keep only essential ones
- Remove duplicates and test versions

### CONSOLIDATION PLAN:
1. Create ONE working PDF service
2. Create ONE working claim wizard
3. Remove ALL unused components
4. Update imports throughout codebase
5. Build and test final clean version

**ETA: 15 minutes to clean working system**