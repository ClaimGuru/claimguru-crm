# Claim Intake Wizards Documentation

ClaimGuru offers two distinct pathways for claim intake, each optimized for different user preferences and scenarios while maintaining complete field schema consistency.

## 🚀 Two Intake Approaches

### 1. **Manual Intake Wizard** (`ManualIntakeWizard.tsx`)
**Traditional form-based claim entry**

- **Purpose**: Manual data entry for users who prefer traditional forms
- **Interface**: Step-by-step form fields with manual input
- **Data Source**: User keyboard input only
- **Use Cases**: 
  - Quick claim entry without documents
  - Training and onboarding
  - Users who prefer manual control
  - Simple claims without complex documentation

**Access**: Click "New Client Intake" button on Claims page

### 2. **AI-Enhanced Intake Wizard** (`EnhancedAIClaimWizard.tsx`)
**AI-powered claim intake with document processing**

- **Purpose**: Intelligent data extraction and AI-assisted claim creation
- **Interface**: PDF upload + AI validation + smart suggestions
- **Data Source**: PDF extraction + AI enhancement + user validation
- **Use Cases**:
  - Claims with policy documents available
  - Complex claims requiring AI analysis
  - Time-critical claim processing
  - Document-heavy workflows

**Access**: Click "AI-Enhanced Intake Wizard" button on Claims page

## 🔗 Shared Field Schemas

Both wizards use **identical field definitions** ensuring complete consistency:

### Schema Architecture
```
📁 /src/services/sharedFieldSchemas.ts
├── clientDetailsSchema
├── insuranceDetailsSchema  
├── claimInformationSchema
├── propertyDetailsSchema
└── Validation & utility functions
```

### Schema Management Hook
```typescript
// /src/hooks/useSharedFieldSchemas.ts
const { 
  validateSchema, 
  getFieldProps,
  isSchemaComplete 
} = useSharedFieldSchemas()
```

## 📝 Adding/Modifying Fields

**IMPORTANT**: When adding or changing fields, modify only the shared schema files. Changes automatically apply to both wizards.

### Example: Adding a New Field

1. **Edit Schema** (`/src/services/sharedFieldSchemas.ts`):
```typescript
export const insuranceDetailsSchema: FieldSection = {
  id: 'insurance-details',
  fields: [
    // ... existing fields
    {
      id: 'newField',
      label: 'New Field Label',
      type: 'text',
      required: true,
      placeholder: 'Enter new field value',
      validationRules: [
        { type: 'required', message: 'This field is required' }
      ]
    }
  ]
}
```

2. **Update Interface** (if needed):
```typescript
interface WizardData {
  // ... existing properties
  newField?: string
}
```

3. **Field Automatically Available** in both wizards!

### Field Types Supported
- `text` - Text input
- `email` - Email input with validation
- `tel` - Phone number input
- `date` - Date picker
- `number` - Numeric input
- `textarea` - Multi-line text
- `select` - Dropdown selection
- `radio` - Radio button group
- `checkbox` - Checkbox input

### Validation Rules
- `required` - Field is mandatory
- `email` - Email format validation
- `phone` - Phone number format
- `pattern` - Custom regex pattern
- `length` - Min/max length validation
- `date` - Date format validation
- `number` - Numeric validation

## 🎯 Wizard-Specific Features

### Manual Wizard Only
- Traditional form progression
- Manual field completion tracking
- Client-friendly interface
- No AI processing overhead

### AI Wizard Only
- PDF document upload
- Intelligent data extraction
- AI confidence scoring
- Multi-document processing
- Smart field suggestions
- Policy validation

## 🔄 Data Flow

### Manual Wizard Flow
```
User Input → Form Validation → Progress Saving → Claim Creation
```

### AI Wizard Flow
```
PDF Upload → AI Extraction → Validation → User Review → Claim Creation
```

### Shared Elements
- Field schemas and validation
- Progress saving mechanism
- Final claim data structure
- Database storage format

## 📊 Progress Tracking

Both wizards support:
- **Auto-save**: Changes saved every 2 seconds
- **Step validation**: Real-time field validation
- **Progress restoration**: Resume from any step
- **Completion tracking**: Visual progress indicators

## 🛠 Development Guidelines

### When to Modify Schemas
- Adding new required fields
- Changing validation rules
- Adding new field types
- Updating help text or labels

### When to Modify Individual Wizards
- UI/UX improvements specific to approach
- Adding wizard-specific features
- Performance optimizations
- Integration with external services

### Best Practices
1. **Always test both wizards** when changing shared schemas
2. **Update field interfaces** if adding new data structures
3. **Maintain backward compatibility** for existing claims
4. **Document schema changes** in this file
5. **Test validation rules** thoroughly

## 🚦 Quality Assurance

### Testing Checklist
When modifying schemas or wizards:

- [ ] Manual wizard: All fields render correctly
- [ ] Manual wizard: Validation works as expected
- [ ] AI wizard: All fields render correctly  
- [ ] AI wizard: PDF extraction populates fields
- [ ] AI wizard: Validation works as expected
- [ ] Both wizards: Progress saving/restoration
- [ ] Both wizards: Final claim creation
- [ ] Database: Claim data structure integrity

## 📈 Future Enhancements

### Planned Features
- Dynamic field ordering based on AI confidence
- Conditional field display logic
- Advanced validation rules
- Multi-language field labels
- Custom field templates per organization

### Architecture Considerations
- Keep schemas centralized
- Maintain wizard-specific customizations separate
- Ensure backward compatibility
- Plan for dynamic field configurations

---

## 🆘 Troubleshooting

### Common Issues

**Fields not showing in one wizard**
- Check if field is properly defined in shared schema
- Verify field `showWhen` conditions
- Ensure wizard imports shared schemas correctly

**Validation inconsistencies**
- Confirm both wizards use `useWizardStepValidation` hook
- Check validation rules in shared schema
- Verify field types match validation expectations

**Progress saving issues**
- Ensure both wizards use same progress saving service
- Check wizard_type distinguishes between approaches
- Verify user permissions for progress storage

### Support
For issues related to claim intake wizards, check:
1. Shared schema definitions
2. Individual wizard implementations  
3. Progress saving service
4. Database claim structure

---

*Last Updated: 2025-07-16*
*Maintained by: ClaimGuru Development Team*
