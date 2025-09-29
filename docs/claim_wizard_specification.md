# Claim Intake Wizard Specification

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Core Components](#core-components)
3. [Multi-Step Form Implementation](#multi-step-form-implementation)
4. [Validation Logic](#validation-logic)
5. [AI Integration Points](#ai-integration-points)
6. [Data Flow](#data-flow)
7. [Progress Management](#progress-management)
8. [Step Specifications](#step-specifications)
9. [UI Components](#ui-components)
10. [Services and Utilities](#services-and-utilities)
11. [Implementation Roadmap](#implementation-roadmap)

---

## Architecture Overview

The Claim Intake Wizard follows a modular, service-oriented architecture with clear separation of concerns:

### Core Architectural Principles
- **Unified Framework**: Single reusable wizard framework (`UnifiedWizardFramework`)
- **Component-Based Steps**: Each wizard step is an independent React component
- **Service Layer**: Dedicated services for AI, validation, progress management, and data extraction
- **Progressive Enhancement**: AI features enhance user experience without blocking core functionality
- **Fallback Strategies**: Local storage fallback for progress saving when database is unavailable

### Technology Stack
- **Frontend**: React with TypeScript
- **State Management**: Local component state with service layer integration
- **UI Components**: Custom component library with shadcn/ui patterns
- **AI Services**: Multiple AI providers (Claude, OpenAI) with intelligent fallbacks
- **Data Storage**: Supabase with local storage fallback
- **Validation**: Custom validation service with field-level validation
- **File Processing**: Multi-method PDF extraction (OCR, AI, hybrid approaches)

---

## Core Components

### 1. UnifiedWizardFramework
The central orchestrator that manages all wizard functionality.

**File**: `src/components/wizards/UnifiedWizardFramework.tsx`

**Key Features**:
- Step navigation with progress tracking
- Automatic data persistence
- Validation integration
- Progress restoration
- Responsive design
- Accessibility support

**Props Interface**:
```typescript
interface UnifiedWizardFrameworkProps {
  config: WizardConfig
  initialData: any
  onUpdate: (data: any) => void
  onComplete: (data: any) => void
  onCancel?: () => void
  onSave?: (data: any, step: number) => Promise<any>
  validateStep?: (stepId: string, data: any) => ValidationResult
  canProceedToStep?: (stepId: string, data: any) => boolean
  showProgressBar?: boolean
  showStepIndicator?: boolean
}
```

### 2. Wizard Configuration System
Defines wizard structure and behavior through configuration objects.

**Step Definition**:
```typescript
interface WizardStep {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  component: React.ComponentType<any>
  required: boolean
  priority?: 'high' | 'medium' | 'low'
  aiEnhanced?: boolean
}
```

**Configuration Structure**:
```typescript
interface WizardConfig {
  title: string
  subtitle?: string
  steps: WizardStep[]
  enableAutoSave?: boolean
  enableProgressRestore?: boolean
  saveToLocalStorage?: boolean
  className?: string
  icon?: React.ComponentType<{ className?: string }>
  autoSaveInterval?: number
}
```

---

## Multi-Step Form Implementation

### Step Component Pattern
Each wizard step follows a consistent pattern:

```typescript
interface StepProps {
  data: any
  onUpdate: (data: any) => void
}

export function ExampleStep({ data, onUpdate }: StepProps) {
  const [stepData, setStepData] = useState(data.stepField || {})
  
  const updateField = (field: string, value: any) => {
    const updatedData = { ...stepData, [field]: value }
    setStepData(updatedData)
    onUpdate({ stepField: updatedData })
  }
  
  return (
    <div className="space-y-6">
      {/* Step UI content */}
    </div>
  )
}
```

### Navigation Flow
1. **Linear Progression**: Steps generally follow sequential order
2. **Conditional Steps**: Some steps may be skipped based on previous answers
3. **Jump Navigation**: Users can navigate to previously completed steps
4. **Validation Gates**: Users cannot proceed until current step validation passes

### State Management
- **Local State**: Each step manages its own local state
- **Global State**: Wizard framework maintains overall wizard data
- **Persistence**: Data automatically saved to database/localStorage
- **Restoration**: Previous sessions can be restored on return

---

## Validation Logic

### WizardValidationService
Centralized validation system with field-level rules.

**File**: `src/services/wizardValidationService.ts`

### Validation Architecture
```typescript
interface ValidationError {
  field: string
  fieldLabel: string
  message: string
  severity: 'error' | 'warning'
  section?: string
}

interface StepValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
  missingRequiredFields: ValidationError[]
  completionPercentage: number
}
```

### Validation Rules Structure
```typescript
interface FieldValidationConfig {
  required?: boolean
  label: string
  section?: string
  validator?: (value: any, data?: any) => string | null
}
```

### Key Validation Features
- **Field-Level Validation**: Individual field validation with custom rules
- **Cross-Field Validation**: Validation that depends on multiple fields
- **Real-Time Validation**: Validation triggered on field changes
- **Visual Indicators**: Error highlighting and messaging
- **Progressive Validation**: Completion percentage tracking

### Example Validation Rules
```typescript
const validationRules = {
  'client-details': {
    'insuredDetails.firstName': {
      required: true,
      label: 'First Name',
      section: 'Personal Information',
      validator: (value) => {
        if (!value || value.trim().length < 2) {
          return 'First name must be at least 2 characters'
        }
        return null
      }
    },
    'insuredDetails.email': {
      required: true,
      label: 'Email Address',
      section: 'Contact Information',
      validator: (value) => {
        if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Please enter a valid email address'
        }
        return null
      }
    }
  }
}
```

---

## AI Integration Points

### 1. Document Intelligence (PDF Extraction)
**File**: `src/services/hybridPdfExtractionService.ts`

**Capabilities**:
- Multi-method extraction (OCR, AI vision, text parsing)
- Intelligent fallback strategies
- Cost optimization
- Confidence scoring

**Processing Flow**:
```typescript
interface ExtractionResult {
  extractedText: string
  policyData: any
  confidence: number
  processingMethod: string
  cost: number
  processingTime: number
  metadata: any
}
```

### 2. Intelligent Wizard Service
**File**: `src/services/intelligentWizardService.ts`

**Features**:
- Cross-step data intelligence
- Auto-population suggestions
- Field validation with AI insights
- Loss description generation
- Document-based recommendations

**AI Insight Types**:
```typescript
interface AIInsight {
  type: 'suggestion' | 'warning' | 'information' | 'enhancement'
  confidence: 'high' | 'medium' | 'low'
  field?: string
  title: string
  description: string
  suggestedValue?: string
  source: string
  actionable: boolean
}
```

### 3. Claim Wizard AI Service
**File**: `src/services/claimWizardAI.ts`

**Comprehensive AI Features**:
- Policy document analysis
- Damage assessment from photos
- Settlement prediction
- Vendor recommendations
- Task generation
- Fraud detection
- Weather correlation analysis
- Property valuation
- Personal property inventory generation

### AI Integration Pattern
```typescript
// Example AI service integration
const handleAIProcessing = async (data: any) => {
  try {
    setIsProcessing(true)
    const result = await claimWizardAI.analyzeDocument(data.document)
    
    // Update wizard data with AI results
    onUpdate({
      ...data,
      extractedData: result.extractedData,
      aiSuggestions: result.recommendations,
      confidence: result.confidence
    })
  } catch (error) {
    // Graceful fallback - wizard continues without AI
    console.warn('AI processing failed, continuing without enhancement')
  } finally {
    setIsProcessing(false)
  }
}
```

---

## Data Flow

### 1. Data Structure
The wizard maintains a comprehensive data object:

```typescript
interface WizardData {
  // Client Information
  clientType: string
  isOrganization: boolean
  selectedExistingClientId?: string
  insuredDetails: {
    firstName: string
    lastName: string
    email: string
    phone: string
    // ... additional fields
  }
  
  // Insurance Information
  insuranceCarrier: {
    name: string
    agentInfo: AgentInfo
    // ... additional fields
  }
  policyDetails: {
    policyNumber: string
    effectiveDate: string
    expirationDate: string
    // ... additional fields
  }
  
  // Loss Information
  lossDetails: {
    dateOfLoss: string
    causeOfLoss: string
    lossDescription: string
    reasonForLoss: string
    // ... additional fields
  }
  
  // AI-Enhanced Data
  extractedPolicyData?: any
  additionalDocuments?: any[]
  aiSuggestions?: any
  
  // System Fields
  organizationId?: string
  customFields?: Record<string, any>
}
```

### 2. Data Flow Patterns

**Step-to-Step Flow**:
1. User completes fields in current step
2. Step component calls `onUpdate` with new data
3. Framework merges data with existing wizard state
4. Validation service validates the step
5. Progress service saves data automatically
6. AI services process data for next step suggestions

**AI Enhancement Flow**:
1. User uploads document/provides input
2. AI service processes the data
3. Extracted insights populate suggestion fields
4. User reviews and confirms/modifies AI suggestions
5. Validated data flows to subsequent steps

**Cross-Step Intelligence**:
1. Early steps (policy upload) provide data to intelligent service
2. Service analyzes and prepares suggestions
3. Later steps receive pre-populated data and insights
4. User can accept, modify, or reject AI suggestions

---

## Progress Management

### WizardProgressService
**File**: `src/services/wizardProgressService.ts`

### Features
- **Automatic Saving**: Progress saved every 2 seconds during activity
- **Database-First**: Primary storage in Supabase database
- **Local Storage Fallback**: Seamless fallback when database unavailable
- **Session Restoration**: Users can resume exactly where they left off
- **Expiration**: Progress auto-expires after 30 days
- **Task Integration**: Reminder tasks created for incomplete wizards

### Progress Data Structure
```typescript
interface WizardProgress {
  id?: string
  user_id: string
  organization_id: string
  wizard_type: 'claim' | 'claim_manual' | 'client' | 'policy'
  current_step: number
  total_steps: number
  progress_percentage: number
  wizard_data: any
  step_statuses: {
    [stepId: string]: {
      completed: boolean
      required: boolean
      validation_errors?: string[]
      completed_at?: string
    }
  }
  last_saved_at: string
  last_active_at: string
  expires_at: string
  reminder_task_id?: string
}
```

### Error Handling & Fallback Strategy
```typescript
// Robust error handling with fallback
static async saveProgress(progress: WizardProgress): Promise<WizardProgress | null> {
  try {
    // Try database save first
    const result = await this.saveToDatabse(progress)
    return result
  } catch (error) {
    if (error.message?.includes('406')) {
      // RLS/permissions issue - switch to fallback mode
      this.fallbackMode = true
      return this.saveToLocalStorage(progress)
    }
    // Other errors - try local storage
    return this.saveToLocalStorage(progress)
  }
}
```

---

## Step Specifications

### 1. Policy Document Upload Step
**Purpose**: Extract policy data using AI to pre-populate wizard

**Components**:
- File upload with drag-and-drop
- AI processing status indicators
- Extracted data validation UI
- User confirmation/rejection interface

**AI Integration**:
- Multi-method PDF extraction
- Confidence scoring
- Cost optimization
- Processing time tracking

**Data Outputs**:
```typescript
{
  extractedPolicyData: {
    policyNumber: string
    insuredName: string
    propertyAddress: string
    insurerName: string
    effectiveDate: string
    expirationDate: string
    // ... additional extracted fields
  },
  processingDetails: {
    method: string
    confidence: number
    cost: number
    processingTime: number
  }
}
```

### 2. Client Information Step
**Purpose**: Collect comprehensive client details

**Features**:
- New vs. existing client selection
- Client search functionality
- Individual vs. business client types
- Coinsured information
- Multiple phone numbers
- Address with autocomplete
- AI pre-population from policy data

**Validation**:
- Required field validation
- Email format validation
- Phone number format validation
- Address validation

### 3. Insurance Information Step
**Purpose**: Capture detailed insurance and policy information

**Components**:
- Insurance carrier details
- Agent information
- Policy dates and numbers
- Coverage details
- Personnel information

**AI Enhancement**:
- Pre-population from extracted policy data
- Validation against policy documents
- Coverage analysis

### 4. Claim Information Step
**Purpose**: Detailed loss and claim information

**Features**:
- Multi-text loss description
- Cause of loss selector
- Date/time of loss
- Loss location with address
- Weather-related information
- Property status toggles
- Emergency situation indicators

**AI Integration**:
- Intelligent loss description generation
- Weather correlation analysis
- Damage assessment suggestions

### 5. Additional Steps
- **Property Analysis**: AI-powered damage assessment
- **Vendors & Experts**: AI-recommended service providers
- **Mortgage Information**: Lender details
- **Personnel Assignment**: Team member assignments
- **Tasks Generation**: AI-generated follow-up tasks
- **Coverage Review**: AI analysis of coverage issues
- **Completion**: Summary and submission

---

## UI Components

### Core UI Component Library

### 1. StandardizedAddressInput
**File**: `src/components/ui/StandardizedAddressInput.tsx`

**Features**:
- Google Places autocomplete integration
- Standardized address format
- "Same as above" toggle functionality
- Validation indicators
- Responsive design

### 2. StandardizedPhoneInput
**Features**:
- Automatic formatting
- Extension support
- Multiple phone number support
- Type selection (mobile, home, work)
- Primary designation

### 3. CauseOfLossSelector
**Features**:
- Comprehensive cause options
- Categorized selections
- Search functionality
- Custom cause entry

### 4. MultiTextArea
**Features**:
- Character counting
- Auto-resize
- Validation integration
- Rich text capabilities

### 5. LoadingSpinner
**Features**:
- Multiple sizes
- Custom messaging
- Accessibility support

### 6. Card Components
**Features**:
- Consistent styling
- Header/content separation
- Responsive design
- Shadow/border variations

---

## Services and Utilities

### 1. AI Services Architecture

**Primary AI Service**: `ClaimWizardAI`
- Comprehensive AI capabilities
- Multiple provider integration
- Fallback strategies
- Cost optimization

**Intelligent Wizard Service**: `IntelligentWizardService`
- Cross-step intelligence
- Data flow management
- Suggestion generation
- Insight provision

**PDF Extraction Service**: `HybridPDFExtractionService`
- Multi-method extraction
- OCR capabilities
- AI vision integration
- Text parsing fallbacks

### 2. Validation Services

**WizardValidationService**:
- Field-level validation
- Cross-field validation
- Error management
- Progress tracking

**Custom Validators**:
- Email validation
- Phone number validation
- Date validation
- Policy number validation
- Address validation

### 3. Utility Services

**FormUtils**:
- Data formatting
- Field manipulation
- Validation helpers

**CommonUtils**:
- General utility functions
- Data transformation
- Helper methods

---

## Implementation Roadmap

### Phase 1: Core Framework (Weeks 1-2)
1. **Implement UnifiedWizardFramework**
   - Basic navigation
   - Progress tracking
   - Step management
   - Validation integration

2. **Create Basic UI Components**
   - Input components
   - Card layouts
   - Button variants
   - Loading indicators

3. **Setup Validation System**
   - WizardValidationService
   - Basic validation rules
   - Error display system

### Phase 2: Essential Steps (Weeks 3-4)
1. **Client Information Step**
   - Basic form implementation
   - Validation integration
   - Client search functionality

2. **Insurance Information Step**
   - Policy details form
   - Agent information
   - Basic validation

3. **Claim Information Step**
   - Loss details form
   - Date/time selection
   - Basic property status

### Phase 3: AI Integration (Weeks 5-7)
1. **Document Upload & Extraction**
   - File upload component
   - PDF extraction service
   - Basic AI integration

2. **Intelligent Suggestions**
   - IntelligentWizardService
   - Cross-step data flow
   - Pre-population logic

3. **AI-Enhanced Features**
   - Loss description generation
   - Damage assessment
   - Vendor recommendations

### Phase 4: Advanced Features (Weeks 8-10)
1. **Progress Management**
   - WizardProgressService
   - Database integration
   - Local storage fallback

2. **Advanced AI Services**
   - ClaimWizardAI implementation
   - Fraud detection
   - Settlement prediction

3. **Additional Steps**
   - Property analysis
   - Vendor management
   - Task generation

### Phase 5: Polish & Optimization (Weeks 11-12)
1. **UI/UX Refinement**
   - Responsive design
   - Accessibility improvements
   - Performance optimization

2. **Error Handling**
   - Comprehensive error management
   - Fallback strategies
   - User-friendly messaging

3. **Testing & Documentation**
   - Unit tests
   - Integration tests
   - User documentation

---

## Key Implementation Notes

### 1. Error Handling Strategy
- **Graceful Degradation**: AI failures should not break core functionality
- **User Communication**: Clear error messages and recovery options
- **Fallback Modes**: Local storage for persistence, manual entry for AI features

### 2. Performance Considerations
- **Lazy Loading**: Load step components only when needed
- **Debounced Saving**: Prevent excessive save operations
- **Chunked Processing**: Break large operations into smaller chunks

### 3. Security & Privacy
- **Data Encryption**: Sensitive data encrypted in storage
- **Access Control**: User/organization-based access restrictions
- **Audit Logging**: Track all data access and modifications

### 4. Accessibility
- **Keyboard Navigation**: Full keyboard support for all interactions
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **Color Contrast**: Meet WCAG AA standards
- **Focus Management**: Clear focus indicators and logical tab order

### 5. Mobile Responsiveness
- **Responsive Design**: Optimized for mobile and tablet devices
- **Touch-Friendly**: Appropriate touch targets and gestures
- **Offline Capability**: Local storage ensures functionality without network

---

## Conclusion

This specification provides a comprehensive blueprint for recreating the ClaimGuru claim intake wizard functionality. The architecture emphasizes modularity, reliability, and user experience while incorporating advanced AI capabilities that enhance rather than complicate the user journey.

Key success factors:
1. **Modular Architecture**: Easy to maintain and extend
2. **Robust Error Handling**: Graceful degradation and recovery
3. **AI Enhancement**: Intelligent features that improve efficiency
4. **User-Centric Design**: Intuitive interface with clear feedback
5. **Performance**: Fast, responsive, and reliable operation

The implementation roadmap provides a structured approach to building this complex system incrementally, ensuring each phase delivers value while building toward the complete solution.