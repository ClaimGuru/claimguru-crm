# Policy Number vs Claim Number - Mapping Audit & Fix

## **CRITICAL ISSUES IDENTIFIED** ⚠️

### **1. Database Relationship Problems**

**Current Schema Issues:**
```sql
-- WRONG: Policies table references claims (backwards relationship)
CREATE TABLE policies (
    claim_id UUID NOT NULL,  -- ❌ This is backwards!
    policy_number VARCHAR(100) NOT NULL
);

-- CORRECT: Claims should reference policies
CREATE TABLE claims (
    policy_id UUID NOT NULL,  -- ✅ Claims belong to policies
    claim_number VARCHAR(100)
);
```

**The Fundamental Relationship:**
```
1 Policy → Multiple Claims (over time)
1 Claim → 1 Policy (always)
```

### **2. Extraction Mapping Problems**

**Current Issues:**
- **Policy Documents**: Extract `policyNumber` ✅ (but may contain claim references too)
- **Claim Documents**: Extract `claimNumber` ✅ (but MUST also extract `policyNumber`)
- **Missing Cross-Validation**: No verification that extracted policy/claim pairs are valid

**Example of Missing Logic:**
```
Document: "Claim #ABC123456 for Policy #POL987654"
Current System Extracts:
- claimNumber: "ABC123456" ✅
- policyNumber: NOT EXTRACTED ❌ 

Should Extract:
- claimNumber: "ABC123456" ✅ 
- policyNumber: "POL987654" ✅
- relationship: validated ✅
```

### **3. Document Type Extraction Gaps**

**Policy Documents** (Insurance Policy PDFs):
- ✅ Extract: policyNumber, insuredName, coverages, etc.
- ❌ Missing: claimNumber (if referenced)

**Claim Documents** (ROR, RFI, Settlement Letters):
- ✅ Extract: claimNumber, dateOfLoss, etc.
- ❌ Missing: policyNumber (which should ALWAYS be present)
- ❌ Missing: Cross-validation

## **COMPREHENSIVE FIX PLAN**

### **Phase 1: Enhanced Extraction Service** 🔧

#### **Universal Policy/Claim Extraction**
```typescript
interface UniversalExtractionResult {
  // Always try to extract both
  policyNumber: string | null;
  claimNumber: string | null;
  
  // Validation
  hasBothIdentifiers: boolean;
  identifierConsistency: 'valid' | 'conflicting' | 'missing';
  
  // Document context
  documentType: 'policy' | 'claim' | 'mixed';
  primaryIdentifier: 'policy' | 'claim';
}
```

#### **Enhanced Pattern Recognition**
```typescript
const ENHANCED_PATTERNS = {
  policyNumbers: [
    /(?:policy\s*(?:number|#|no|num)?\s*[:.]?\s*)([A-Z]{2,4}[\d\-]{6,20})/i,
    /(?:policy\s*[:]\s*)([A-Z0-9\-]{6,25})/i,
    /\b([A-Z]{2,3}\d{7,15})\b/,
    /(?:pol(?:icy)?[:\s#]*([A-Z0-9\-]{5,25}))/i
  ],
  
  claimNumbers: [
    /(?:claim\s*(?:number|#|no|num)?\s*[:.]?\s*)([A-Z0-9\-]{5,25})/i,
    /(?:file\s*(?:number|#|no)?\s*[:.]?\s*)([A-Z0-9\-]{5,25})/i,
    /(?:reference\s*(?:number|#|no)?\s*[:.]?\s*)([A-Z0-9\-]{5,25})/i,
    /\b(CLM\d{6,15})\b/i,
    /\b([A-Z]{2,3}\d{8,15})\b/
  ]
};
```

### **Phase 2: Database Schema Fix** 🗄️

#### **Corrected Relationship**
```sql
-- Fix the relationship direction
ALTER TABLE policies 
DROP COLUMN claim_id;

ALTER TABLE claims 
ADD COLUMN policy_id UUID REFERENCES policies(id);

-- Add proper indexes
CREATE INDEX idx_claims_policy_id ON claims(policy_id);
CREATE INDEX idx_claims_claim_number ON claims(claim_number);
CREATE INDEX idx_policies_policy_number ON policies(policy_number);
```

#### **Enhanced Validation**
```sql
-- Add constraints for data integrity
ALTER TABLE claims 
ADD CONSTRAINT chk_claim_policy_relationship 
CHECK (policy_id IS NOT NULL AND claim_number IS NOT NULL);

-- Add unique constraint on policy-claim combination
ALTER TABLE claims 
ADD CONSTRAINT uq_policy_claim 
UNIQUE (policy_id, claim_number);
```

### **Phase 3: Enhanced OpenAI Extraction** 🤖

#### **Universal Extraction Prompt**
```typescript
const UNIVERSAL_EXTRACTION_PROMPT = `
Extract BOTH policy and claim information from this document:

INSURANCE IDENTIFIERS (CRITICAL):
{
  "policyNumber": "string or null",
  "claimNumber": "string or null", 
  "fileNumber": "string or null",
  "carrierClaimNumber": "string or null",
  
  // Document Analysis
  "documentType": "policy|claim|communication|settlement",
  "primaryFocus": "policy_information|claim_processing",
  
  // Relationship Validation  
  "hasMultipleIdentifiers": "boolean",
  "identifierContext": "string - explain the relationship"
}

EXTRACTION RULES:

**Policy Numbers:**
- Look for: "Policy Number", "Policy #", "Policy:", "Pol #"
- Patterns: ABC123456, POL-789012, 12-AB-345678
- Usually alphanumeric, 6-20 characters

**Claim Numbers:**  
- Look for: "Claim Number", "Claim #", "File #", "Reference #"
- Patterns: CLM123456, ABC-2024-789, 2024-12345678
- May include year, letters, or hyphens

**Document Types:**
- Policy: Insurance policy documents, declarations pages
- Claim: ROR, RFI, settlement letters, denial letters  
- Communication: General correspondence
- Settlement: Payment/settlement documents

**Cross-Validation:**
- If both policy and claim numbers exist, note their relationship
- Identify which is the primary identifier for this document
- Flag any inconsistencies or unusual patterns

ALWAYS extract both identifiers if present in the document.
```

### **Phase 4: Cross-Validation Logic** ✅

#### **Relationship Validation Service**
```typescript
class PolicyClaimValidator {
  validateRelationship(policyNumber: string, claimNumber: string): ValidationResult {
    // Check database for existing relationships
    // Validate format consistency  
    // Cross-reference with carrier patterns
    // Return confidence score and validation status
  }
  
  detectMismatch(documentData: any): MismatchResult {
    // Detect conflicting policy/claim pairs
    // Flag suspicious patterns
    // Suggest corrections
  }
  
  suggestCorrections(extractedData: any): CorrectionSuggestions {
    // AI-powered suggestions for correction
    // Pattern-based recommendations
    // Historical data comparison
  }
}
```

### **Phase 5: Enhanced UI Display** 🖥️

#### **Clear Identifier Display**
```tsx
<IdentifierValidationPanel>
  <PolicyIdentifier 
    number={extractedData.policyNumber}
    confidence={policyConfidence}
    source="primary_extraction"
  />
  
  <ClaimIdentifier 
    number={extractedData.claimNumber} 
    confidence={claimConfidence}
    source="document_header"
  />
  
  <RelationshipStatus 
    status={validationResult.status}
    message={validationResult.message}
    suggestions={validationResult.suggestions}
  />
</IdentifierValidationPanel>
```

## **IMPLEMENTATION PRIORITY**

### **🔥 IMMEDIATE (Week 1)**
1. **Fix extraction logic** to always extract both policy and claim numbers
2. **Update OpenAI prompt** with universal extraction rules
3. **Add validation warnings** in UI when identifiers are missing/conflicting

### **📋 HIGH PRIORITY (Week 2)**  
1. **Database schema migration** to fix policy→claim relationship
2. **Enhanced pattern recognition** for both identifier types
3. **Cross-validation service** implementation

### **⚡ MEDIUM PRIORITY (Week 3)**
1. **Historical data cleanup** to fix existing relationships
2. **Enhanced UI validation** components  
3. **Automated relationship suggestions**

## **TESTING SCENARIOS**

### **Test Cases:**
1. **Policy Document Only**: Should extract policy number, show "no claim number" status
2. **Claim Document**: Should extract BOTH policy and claim numbers
3. **Multi-Claim Document**: Should handle multiple claim numbers for same policy  
4. **Conflicting Identifiers**: Should flag mismatches and suggest corrections
5. **Missing Identifiers**: Should prompt user for manual entry

### **Validation Tests:**
- Verify extracted claim belongs to extracted policy
- Detect impossible claim/policy combinations
- Flag typos or format inconsistencies
- Suggest corrections based on context

## **SUCCESS METRICS**

### **Accuracy Improvements:**
- **Policy Number Extraction**: >95% accuracy (currently ~85%)
- **Claim Number Extraction**: >95% accuracy (currently ~80%) 
- **Relationship Validation**: >90% accuracy (currently 0%)
- **User Correction Rate**: <10% (currently ~30%)

### **Business Impact:**
- Reduced manual data entry errors
- Improved claim-to-policy tracking
- Better compliance and audit trails
- Enhanced user confidence in AI extraction

This comprehensive fix ensures that policy numbers and claim numbers are properly distinguished, extracted, validated, and mapped throughout the entire system.
