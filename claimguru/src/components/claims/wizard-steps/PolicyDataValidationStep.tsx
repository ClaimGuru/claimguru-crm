import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { LoadingSpinner } from '../../ui/LoadingSpinner';
import { 
  CheckCircle, 
  AlertTriangle, 
  Edit3, 
  Save, 
  X, 
  Brain,
  FileText,
  User,
  Building,
  Calendar,
  DollarSign,
  Shield,
  Hash,
  Link,
  Info,
  RefreshCw,
  Check,
  Minus,
  Eye,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

interface PolicyDataValidationStepProps {
  extractedData: any;
  rawText: string;
  onValidated: (validatedData: any) => void;
  onReject: () => void;
  onReAnalyze?: () => void; // NEW: Re-analyze function
  identifierAnalysis?: any; // Optional identifier analysis data
}

interface ValidationResult {
  field: string;
  label: string;
  value: string;
  confidence: 'high' | 'medium' | 'low';
  suggestions?: string[];
  isRequired: boolean;
  icon: React.ComponentType<any>;
  status: 'pending' | 'accepted' | 'rejected' | 'modified';
  originalValue?: string;
}

// Define field definitions organized by sections - moved to component level
const fieldSections = [
  {
    title: 'Basic Policy Information',
    icon: FileText,
    fields: [
      {
        field: 'policyNumber',
        label: 'Policy Number',
        pattern: /[A-Z0-9\-]{5,25}/,
        isRequired: true,
        icon: FileText
      },
      {
        field: 'effectiveDate',
        label: 'Effective Date',
        pattern: /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/,
        isRequired: true,
        icon: Calendar
      },
      {
        field: 'expirationDate',
        label: 'Expiration Date',
        pattern: /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/,
        isRequired: true,
        icon: Calendar
      }
    ]
  },
  {
    title: 'Insured Information',
    icon: User,
    fields: [
      {
        field: 'insuredName',
        label: 'Insured Name',
        pattern: /[A-Za-z\s&,]{2,50}/,
        isRequired: true,
        icon: User
      },
      {
        field: 'coinsuredName',
        label: 'Co-Insured Name',
        pattern: /[A-Za-z\s&,]{2,50}/,
        isRequired: false,
        icon: User
      }
    ]
  },
  {
    title: 'Property Information',
    icon: Building,
    fields: [
      {
        field: 'propertyAddress',
        label: 'Property Address',
        pattern: /[\w\s,#\-]{10,100}/,
        isRequired: true,
        icon: Building
      },
      {
        field: 'mailingAddress',
        label: 'Mailing Address',
        pattern: /[\w\s,#\-]{10,100}/,
        isRequired: false,
        icon: Building
      }
    ]
  },
  {
    title: 'Coverage Details',
    icon: Shield,
    fields: [
      {
        field: 'coverageA',
        label: 'Coverage A (Dwelling)',
        pattern: /\$[\d,]+/,
        isRequired: false,
        icon: DollarSign
      },
      {
        field: 'coverageB',
        label: 'Coverage B (Other Structures)',
        pattern: /\$[\d,]+/,
        isRequired: false,
        icon: DollarSign
      },
      {
        field: 'coverageC',
        label: 'Coverage C (Personal Property)',
        pattern: /\$[\d,]+/,
        isRequired: false,
        icon: DollarSign
      },
      {
        field: 'coverageD',
        label: 'Coverage D (Loss of Use)',
        pattern: /\$[\d,]+/,
        isRequired: false,
        icon: DollarSign
      },
      {
        field: 'moldLimit',
        label: 'Mold Coverage Limit',
        pattern: /\$[\d,]+/,
        isRequired: false,
        icon: DollarSign
      },
      // Legacy field for compatibility
      {
        field: 'coverageAmount',
        label: 'Total Coverage Amount',
        pattern: /\$[\d,]+/,
        isRequired: false,
        icon: DollarSign
      }
    ]
  },
  {
    title: 'Deductibles',
    icon: Shield,
    fields: [
      {
        field: 'aopDeductible',
        label: 'AOP Deductible (All Other Perils)',
        pattern: /(\$[\d,]+|[\d.]+%)/,
        isRequired: false,
        icon: Shield
      },
      {
        field: 'aopDeductibleType',
        label: 'AOP Deductible Type',
        pattern: /(Stated Amount|Percentage of Coverage [A-D])/,
        isRequired: false,
        icon: Shield
      },
      {
        field: 'windHailDeductible',
        label: 'Wind/Hail Deductible',
        pattern: /(\$[\d,]+|[\d.]+%)/,
        isRequired: false,
        icon: Shield
      },
      {
        field: 'windHailDeductibleType',
        label: 'Wind/Hail Deductible Type',
        pattern: /(Stated Amount|Percentage of Coverage [A-D])/,
        isRequired: false,
        icon: Shield
      },
      {
        field: 'namedStormDeductible',
        label: 'Named Storm Deductible',
        pattern: /(\$[\d,]+|[\d.]+%)/,
        isRequired: false,
        icon: Shield
      },
      {
        field: 'namedStormDeductibleType',
        label: 'Named Storm Deductible Type',
        pattern: /(Stated Amount|Percentage of Coverage [A-D])/,
        isRequired: false,
        icon: Shield
      },
      {
        field: 'hurricaneDeductible',
        label: 'Hurricane Deductible',
        pattern: /(\$[\d,]+|[\d.]+%)/,
        isRequired: false,
        icon: Shield
      },
      {
        field: 'hurricaneDeductibleType',
        label: 'Hurricane Deductible Type',
        pattern: /(Stated Amount|Percentage of Coverage [A-D])/,
        isRequired: false,
        icon: Shield
      },
      {
        field: 'tornadoDeductible',
        label: 'Tornado Deductible',
        pattern: /(\$[\d,]+|[\d.]+%)/,
        isRequired: false,
        icon: Shield
      },
      {
        field: 'tornadoDeductibleType',
        label: 'Tornado Deductible Type',
        pattern: /(Stated Amount|Percentage of Coverage [A-D])/,
        isRequired: false,
        icon: Shield
      },
      // Legacy compatibility fields
      {
        field: 'deductible',
        label: 'General Deductible',
        pattern: /(\$[\d,]+|[\d.]+%)/,
        isRequired: false,
        icon: Shield
      },
      {
        field: 'deductibleType',
        label: 'General Deductible Type',
        pattern: /(Stated Amount|Percentage of Coverage [A-D]|[A-Za-z\s\/\-]{2,30})/,
        isRequired: false,
        icon: Shield
      }
    ]
  },
  {
    title: 'Insurer Information',
    icon: Building,
    fields: [
      {
        field: 'insurerName',
        label: 'Insurance Company',
        pattern: /[A-Za-z\s&.,]{2,50}/,
        isRequired: true,
        icon: Building
      },
      {
        field: 'insurerPhone',
        label: 'Insurer Phone',
        pattern: /[\d\-\(\)\.\s]{10,15}/,
        isRequired: false,
        icon: Building
      },
      {
        field: 'insurerAddress',
        label: 'Insurer Address',
        pattern: /[\w\s,#\-]{10,100}/,
        isRequired: false,
        icon: Building
      }
    ]
  },
  {
    title: 'Agent Information',
    icon: User,
    fields: [
      {
        field: 'agentName',
        label: 'Agent Name',
        pattern: /[A-Za-z\s&,]{2,50}/,
        isRequired: false,
        icon: User
      },
      {
        field: 'agentPhone',
        label: 'Agent Phone',
        pattern: /[\d\-\(\)\.\s]{10,15}/,
        isRequired: false,
        icon: User
      },
      {
        field: 'agentAddress',
        label: 'Agent Address',
        pattern: /[\w\s,#\-]{10,100}/,
        isRequired: false,
        icon: User
      }
    ]
  },
  {
    title: 'Mortgagee Information',
    icon: Building,
    fields: [
      {
        field: 'mortgageeName',
        label: 'Mortgagee Name',
        pattern: /[A-Za-z\s&.,]{2,50}/,
        isRequired: false,
        icon: Building
      },
      {
        field: 'mortgageePhone',
        label: 'Mortgagee Phone',
        pattern: /[\d\-\(\)\.\s]{10,15}/,
        isRequired: false,
        icon: Building
      },
      {
        field: 'mortgageeAddress',
        label: 'Mortgagee Address',
        pattern: /[\w\s,#\-]{10,100}/,
        isRequired: false,
        icon: Building
      },
      {
        field: 'mortgageAccountNumber',
        label: 'Mortgage Account Number',
        pattern: /[A-Z0-9\-]{6,20}/,
        isRequired: false,
        icon: FileText
      }
    ]
  },
  {
    title: 'Construction Details',
    icon: Building,
    fields: [
      {
        field: 'yearBuilt',
        label: 'Year Built',
        pattern: /\d{4}/,
        isRequired: false,
        icon: Calendar
      },
      {
        field: 'dwellingStyle',
        label: 'Dwelling Style',
        pattern: /[A-Za-z\s\-]{2,30}/,
        isRequired: false,
        icon: Building
      },
      {
        field: 'squareFootage',
        label: 'Square Footage',
        pattern: /\d{1,6}/,
        isRequired: false,
        icon: Building
      },
      {
        field: 'numberOfStories',
        label: 'Number of Stories',
        pattern: /\d{1,2}/,
        isRequired: false,
        icon: Building
      },
      {
        field: 'constructionType',
        label: 'Construction Type',
        pattern: /[A-Za-z\s\-]{2,30}/,
        isRequired: false,
        icon: Building
      },
      {
        field: 'foundationType',
        label: 'Foundation Type',
        pattern: /[A-Za-z\s\-]{2,30}/,
        isRequired: false,
        icon: Building
      },
      {
        field: 'roofMaterialType',
        label: 'Roof Material',
        pattern: /[A-Za-z\s\-]{2,30}/,
        isRequired: false,
        icon: Building
      },
      {
        field: 'sidingType',
        label: 'Siding Type',
        pattern: /[A-Za-z\s\-]{2,30}/,
        isRequired: false,
        icon: Building
      },
      {
        field: 'heatingAndCooling',
        label: 'Heating & Cooling',
        pattern: /[A-Za-z\s\-]{2,50}/,
        isRequired: false,
        icon: Building
      }
    ]
  }
];

export const PolicyDataValidationStep: React.FC<PolicyDataValidationStepProps> = ({
  extractedData,
  rawText,
  onValidated,
  onReject,
  onReAnalyze,
  identifierAnalysis
}) => {
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [isValidating, setIsValidating] = useState(true);
  const [overallConfidence, setOverallConfidence] = useState<number>(0);

  useEffect(() => {
    validateExtractedData();
  }, [extractedData, rawText]);

  const validateExtractedData = async () => {
    setIsValidating(true);

    try {
      console.log('Validating extracted data:', extractedData);
      
      // Flatten all fields for processing
      const fieldDefinitions = fieldSections.reduce((acc, section) => {
        return acc.concat(section.fields);
      }, []);

      const results: ValidationResult[] = [];
      let totalConfidence = 0;

      for (const fieldDef of fieldDefinitions) {
        // Get the value from the extracted data - handle both direct fields and nested policyData
        let extractedValue = '';
        
        if (extractedData[fieldDef.field]) {
          extractedValue = extractedData[fieldDef.field];
        } else if (extractedData.policyData && extractedData.policyData[fieldDef.field]) {
          extractedValue = extractedData.policyData[fieldDef.field];
        } else if (extractedData.extractedPolicyData && extractedData.extractedPolicyData[fieldDef.field]) {
          extractedValue = extractedData.extractedPolicyData[fieldDef.field];
        }
        
        // Convert to string if needed
        if (typeof extractedValue !== 'string') {
          extractedValue = extractedValue ? String(extractedValue) : '';
        }
        
        const confidence = calculateFieldConfidence(extractedValue, fieldDef, rawText);
        const suggestions = generateSuggestions(fieldDef.field, rawText, fieldDef.pattern);

        results.push({
          field: fieldDef.field,
          label: fieldDef.label,
          value: extractedValue,
          confidence,
          suggestions,
          isRequired: fieldDef.isRequired,
          icon: fieldDef.icon,
          status: 'pending',
          originalValue: extractedValue
        });

        // Improved confidence scoring
        const confidenceScore = confidence === 'high' ? 100 : confidence === 'medium' ? 60 : 20;
        const fieldWeight = fieldDef.isRequired ? 2 : 1; // Weight required fields more heavily
        totalConfidence += confidenceScore * fieldWeight;
      }

      setValidationResults(results);
      
      // Calculate weighted overall confidence
      const totalPossibleScore = fieldDefinitions.reduce((sum, fieldDef) => {
        const fieldWeight = fieldDef.isRequired ? 2 : 1;
        return sum + (100 * fieldWeight);
      }, 0);
      
      const calculatedConfidence = totalPossibleScore > 0 ? (totalConfidence / totalPossibleScore) * 100 : 0;
      setOverallConfidence(Math.max(calculatedConfidence, 5)); // Minimum 5% to avoid 0%

      console.log('Validation completed:', results.length, 'fields processed');

    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const calculateFieldConfidence = (value: string, fieldDef: any, rawText: string): 'high' | 'medium' | 'low' => {
    if (!value || value.trim() === '') return 'low';
    
    let score = 0;
    
    // Pattern matching score (40 points)
    if (fieldDef.pattern && fieldDef.pattern.test(value)) {
      score += 40;
    } else if (value.length > 2) {
      score += 20; // Partial credit for having content
    }
    
    // Text presence score (30 points)
    if (rawText.toLowerCase().includes(value.toLowerCase())) {
      score += 30;
    } else {
      // Check for partial matches
      const words = value.toLowerCase().split(/\s+/);
      const foundWords = words.filter(word => word.length > 2 && rawText.toLowerCase().includes(word));
      if (foundWords.length > 0) {
        score += 15 * (foundWords.length / words.length);
      }
    }
    
    // Length and format score (20 points)
    if (value.length >= 5 && value.length <= 100) {
      score += 20;
    } else if (value.length > 2) {
      score += 10;
    }
    
    // Field-specific scoring (10 points)
    switch (fieldDef.field) {
      case 'policyNumber':
        if (/^[A-Z0-9\-]{5,25}$/.test(value)) score += 10;
        break;
      case 'effectiveDate':
      case 'expirationDate':
        if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/.test(value)) score += 10;
        break;
      case 'coverageA':
      case 'coverageAmount':
      case 'deductible':
        if (/^\$[\d,]+$/.test(value)) score += 10;
        break;
      default:
        if (value.length > 3) score += 5;
    }
    
    // Convert score to confidence level
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  };

  const generateSuggestions = (field: string, rawText: string, pattern: RegExp): string[] => {
    const suggestions: string[] = [];
    
    try {
      // Field-specific suggestion patterns
      switch (field) {
        case 'policyNumber':
          const policyMatches = rawText.match(/(?:policy\s*(?:number|#|no|num)?\s*[:.]?\s*)?([A-Z0-9\-]{5,25})/gi) || [];
          suggestions.push(...policyMatches.slice(0, 5));
          break;
          
        case 'insuredName':
          const nameMatches = rawText.match(/(?:insured|policyholder|named)\s*[:.]?\s*([A-Z][A-Za-z\s,&'-]{2,50})/gi) || [];
          suggestions.push(...nameMatches.slice(0, 3));
          break;
          
        case 'insurerName':
          const insurerMatches = rawText.match(/(?:insurance|company|carrier|insurer)\s*[:.]?\s*([A-Z][A-Za-z\s,&'-]{2,50})/gi) || [];
          suggestions.push(...insurerMatches.slice(0, 3));
          break;
          
        case 'effectiveDate':
        case 'expirationDate':
          const dateMatches = rawText.match(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/g) || [];
          suggestions.push(...dateMatches.slice(0, 5));
          break;
          
        case 'propertyAddress':
          const addressMatches = rawText.match(/\d+\s+[\w\s,#\-]+(?:street|st|avenue|ave|road|rd|drive|dr|lane|ln|way|blvd|boulevard)/gi) || [];
          suggestions.push(...addressMatches.slice(0, 3));
          break;
          
        case 'coverageAmount':
        case 'deductible':
          const amountMatches = rawText.match(/\$[\d,]+/g) || [];
          suggestions.push(...amountMatches.slice(0, 5));
          break;
          
        default:
          // Generic pattern matching
          const matches = rawText.match(new RegExp(pattern, 'gi'));
          if (matches) {
            suggestions.push(...matches.slice(0, 3));
          }
      }
    } catch (error) {
      console.warn('Error generating suggestions for', field, ':', error);
    }
    
    // Clean and deduplicate suggestions
    return suggestions
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .filter((s, i, arr) => arr.indexOf(s) === i)
      .slice(0, 5); // Max 5 suggestions
  };

  const handleEdit = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue);
  };

  const handleSave = (field: string) => {
    setValidationResults(prev => 
      prev.map(result => 
        result.field === field 
          ? { ...result, value: editValue, confidence: 'high', status: 'modified' } // User-corrected = high confidence
          : result
      )
    );
    setEditingField(null);
    setEditValue('');
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditValue('');
  };

  const handleAcceptSuggestion = (field: string, suggestion: string) => {
    setValidationResults(prev => 
      prev.map(result => 
        result.field === field 
          ? { ...result, value: suggestion, confidence: 'medium', status: 'modified' }
          : result
      )
    );
  };

  const handleAcceptField = (field: string) => {
    setValidationResults(prev => 
      prev.map(result => 
        result.field === field 
          ? { ...result, status: 'accepted' }
          : result
      )
    );
  };

  const handleRejectField = (field: string) => {
    setValidationResults(prev => 
      prev.map(result => 
        result.field === field 
          ? { ...result, status: 'rejected', value: '' }
          : result
      )
    );
  };

  const handleValidateAndProceed = () => {
    const validatedData = {};
    validationResults.forEach(result => {
      validatedData[result.field] = result.value;
    });

    // Add validation metadata
    const finalData = {
      ...validatedData,
      validationMetadata: {
        overallConfidence,
        userValidated: true,
        validatedAt: new Date().toISOString(),
        fieldCount: validationResults.length,
        requiredFieldsComplete: validationResults
          .filter(r => r.isRequired)
          .every(r => r.value && r.value.trim() !== ''),
        highConfidenceFields: validationResults.filter(r => r.confidence === 'high').length,
        mediumConfidenceFields: validationResults.filter(r => r.confidence === 'medium').length,
        lowConfidenceFields: validationResults.filter(r => r.confidence === 'low').length
      }
    };

    onValidated(finalData);
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getConfidenceIcon = (confidence: string) => {
    switch (confidence) {
      case 'high': return <CheckCircle className="h-4 w-4" />;
      case 'medium': return <AlertTriangle className="h-4 w-4" />;
      case 'low': return <X className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  if (isValidating) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <div>
            <h3 className="text-lg font-medium text-gray-900">Validating Extracted Data</h3>
            <p className="text-gray-600">AI is analyzing and confirming the extracted policy information...</p>
          </div>
        </div>
      </div>
    );
  }

  const requiredFieldsComplete = validationResults
    .filter(r => r.isRequired)
    .every(r => r.value && r.value.trim() !== '');

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            AI Data Validation & Confirmation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* LEARNING INSIGHTS SECTION */}
            {extractedData.intelligenceMetadata && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-purple-900 mb-3 flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  AI Learning Insights
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white rounded p-3">
                    <div className="font-medium text-purple-800">Carrier Identified</div>
                    <div className="text-purple-700">
                      {extractedData.intelligenceMetadata.carrierIdentified || 'Unknown'}
                    </div>
                  </div>
                  <div className="bg-white rounded p-3">
                    <div className="font-medium text-purple-800">Extraction Method</div>
                    <div className="text-purple-700 capitalize">
                      {extractedData.intelligenceMetadata.extractionMethod.replace('_', ' ')}
                    </div>
                  </div>
                  <div className="bg-white rounded p-3">
                    <div className="font-medium text-purple-800">Learning Applied</div>
                    <div className="text-purple-700">
                      {extractedData.intelligenceMetadata.rulesApplied.carrierSpecific ? '✅ Yes' : '❌ No'}
                    </div>
                  </div>
                </div>
                {extractedData.intelligenceMetadata.rulesApplied.carrierSpecific && (
                  <div className="mt-3 p-2 bg-green-50 rounded text-sm text-green-700">
                    🎯 This document was processed using learned patterns from previous documents by this carrier
                  </div>
                )}
              </div>
            )}

            {/* CRITICAL IDENTIFIERS SECTION */}
            {(extractedData.policyNumber || extractedData.claimNumber || identifierAnalysis) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-900 mb-3 flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Critical Identifiers - Policy & Claim Numbers
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Policy Number */}
                  <div className="bg-white rounded-lg p-3 border">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-gray-900">Policy Number</span>
                      {identifierAnalysis?.policyNumberConfidence && (
                        <span className={`text-xs px-2 py-1 rounded ${
                          identifierAnalysis.policyNumberConfidence > 0.8 ? 'bg-green-100 text-green-700' :
                          identifierAnalysis.policyNumberConfidence > 0.5 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {Math.round(identifierAnalysis.policyNumberConfidence * 100)}% confidence
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-sm bg-gray-50 p-2 rounded">
                      {extractedData.policyNumber || 'Not found'}
                    </div>
                  </div>

                  {/* Claim Number */}
                  <div className="bg-white rounded-lg p-3 border">
                    <div className="flex items-center gap-2 mb-2">
                      <Hash className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-gray-900">Claim Number</span>
                      {identifierAnalysis?.claimNumberConfidence && (
                        <span className={`text-xs px-2 py-1 rounded ${
                          identifierAnalysis.claimNumberConfidence > 0.8 ? 'bg-green-100 text-green-700' :
                          identifierAnalysis.claimNumberConfidence > 0.5 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {Math.round(identifierAnalysis.claimNumberConfidence * 100)}% confidence
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-sm bg-gray-50 p-2 rounded">
                      {extractedData.claimNumber || 'Not found'}
                    </div>
                  </div>
                </div>

                {/* Relationship Status */}
                {identifierAnalysis && (
                  <div className="mt-3 p-3 bg-white rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Link className="h-4 w-4 text-purple-600" />
                      <span className="font-medium text-gray-900">Identifier Relationship</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        identifierAnalysis.relationshipStatus === 'valid' ? 'bg-green-100 text-green-700' :
                        identifierAnalysis.relationshipStatus === 'missing' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {identifierAnalysis.relationshipStatus}
                      </span>
                    </div>
                    <div className="text-sm text-gray-700">
                      <p><strong>Document Type:</strong> {identifierAnalysis.documentType || 'Unknown'}</p>
                      <p><strong>Primary Focus:</strong> {identifierAnalysis.primaryIdentifier || 'Unknown'}</p>
                      {identifierAnalysis.validationMessage && (
                        <p><strong>Status:</strong> {identifierAnalysis.validationMessage}</p>
                      )}
                      {identifierAnalysis.hasMultipleIdentifiers && (
                        <p className="text-blue-600">✓ Both policy and claim identifiers found</p>
                      )}
                    </div>
                    {identifierAnalysis.suggestions && identifierAnalysis.suggestions.length > 0 && (
                      <div className="mt-2 p-2 bg-blue-50 rounded">
                        <p className="text-xs font-medium text-blue-800">Suggestions:</p>
                        <ul className="text-xs text-blue-700 list-disc list-inside mt-1">
                          {identifierAnalysis.suggestions.map((suggestion: string, idx: number) => (
                            <li key={idx}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Overall Confidence - ENHANCED */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 text-lg mb-1">Overall Extraction Confidence</h4>
                  <p className="text-sm text-blue-700 mb-3">
                    AI analysis based on pattern matching, text structure, and field validation
                  </p>
                  
                  {/* Confidence Progress Bar */}
                  <div className="w-full bg-blue-100 rounded-full h-3 mb-2">
                    <div 
                      className={`h-3 rounded-full transition-all duration-500 ${
                        overallConfidence >= 80 ? 'bg-green-500' :
                        overallConfidence >= 60 ? 'bg-yellow-500' :
                        overallConfidence >= 40 ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.max(overallConfidence, 5)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-blue-600">
                    {overallConfidence >= 80 ? '🟢 Excellent - High accuracy expected' : 
                     overallConfidence >= 60 ? '🟡 Good - Review recommended' : 
                     overallConfidence >= 40 ? '🟠 Fair - Manual verification needed' : '🔴 Poor - Re-analysis recommended'}
                  </div>
                </div>
                
                <div className="flex items-center gap-4 ml-6">
                  {onReAnalyze && (
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={onReAnalyze}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 text-blue-700 border-blue-300 hover:bg-blue-100 font-medium"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Re-Analyze Document
                      </Button>
                      {overallConfidence < 50 && (
                        <div className="text-xs text-orange-600 text-center">
                          ⚠️ Low confidence detected
                        </div>
                      )}
                    </div>
                  )}
                  <div className="text-right">
                    <div className={`text-3xl font-bold ${
                      overallConfidence >= 80 ? 'text-green-600' :
                      overallConfidence >= 60 ? 'text-yellow-600' :
                      overallConfidence >= 40 ? 'text-orange-600' : 'text-red-600'
                    }`}>{Math.round(overallConfidence)}%</div>
                    <div className="text-xs text-gray-600 font-medium">
                      Confidence Score
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-900">Please Review & Confirm</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Review each extracted field below. Click "Edit" to correct any inaccurate data, 
                    or use AI suggestions if available. All required fields must be completed to proceed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Field Validation Results - Organized by Sections */}
      <div className="space-y-6">
        {fieldSections.map((section) => {
          const SectionIcon = section.icon;
          const sectionFields = validationResults.filter(result => 
            section.fields.some(field => field.field === result.field)
          );

          // Only show sections that have fields
          if (sectionFields.length === 0) return null;

          return (
            <Card key={section.title} className="border-2">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <SectionIcon className="h-5 w-5 text-blue-600" />
                  {section.title}
                  <span className="text-sm font-normal text-gray-500">
                    ({sectionFields.length} field{sectionFields.length !== 1 ? 's' : ''})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {sectionFields.map((result) => {
                  const Icon = result.icon;
                  const isEditing = editingField === result.field;

                  return (
                    <div key={result.field} className={`border rounded-lg p-4 border-l-4 ${
                      result.confidence === 'high' ? 'border-l-green-500 bg-green-50/30' :
                      result.confidence === 'medium' ? 'border-l-yellow-500 bg-yellow-50/30' : 
                      'border-l-red-500 bg-red-50/30'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <Icon className="h-4 w-4 text-gray-600 mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium text-gray-900">{result.label}</h4>
                              {result.isRequired && (
                                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                  Required
                                </span>
                              )}
                              <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded border ${getConfidenceColor(result.confidence)}`}>
                                {getConfidenceIcon(result.confidence)}
                                {result.confidence} confidence
                              </div>
                              {result.status !== 'pending' && (
                                <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
                                  result.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                  result.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                  'bg-blue-100 text-blue-700'
                                }`}>
                                  {result.status === 'accepted' && <Check className="h-3 w-3" />}
                                  {result.status === 'rejected' && <X className="h-3 w-3" />}
                                  {result.status === 'modified' && <Edit3 className="h-3 w-3" />}
                                  {result.status === 'accepted' ? 'Accepted' :
                                   result.status === 'rejected' ? 'Rejected' : 'Modified'}
                                </div>
                              )}
                            </div>

                            {/* Value Display/Edit */}
                            {isEditing ? (
                              <div className="space-y-2">
                                <Input
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="w-full"
                                  placeholder={`Enter ${result.label.toLowerCase()}`}
                                />
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => handleSave(result.field)}
                                    variant="primary"
                                    size="sm"
                                    className="flex items-center gap-1"
                                  >
                                    <Save className="h-3 w-3" />
                                    Save
                                  </Button>
                                  <Button
                                    onClick={handleCancel}
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-1"
                                  >
                                    <X className="h-3 w-3" />
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <span className={`font-mono text-sm px-3 py-2 rounded border ${
                                      result.status === 'accepted' ? 'bg-green-50 text-green-900 border-green-200' :
                                      result.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-200' :
                                      result.value ? 'bg-gray-100 text-gray-900 border-gray-200' : 'bg-red-50 text-red-600 border-red-200'
                                    }`}>
                                      {result.value || 'Not found'}
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                      {result.value && result.status === 'pending' && (
                                        <div className="flex gap-1">
                                          <Button
                                            onClick={() => handleAcceptField(result.field)}
                                            variant="outline"
                                            size="sm"
                                            className="flex items-center gap-1 text-green-700 border-green-300 hover:bg-green-50 font-medium px-3"
                                            title="Accept this value as correct"
                                          >
                                            <ThumbsUp className="h-3 w-3" />
                                            ✓ Accept
                                          </Button>
                                          <Button
                                            onClick={() => handleRejectField(result.field)}
                                            variant="outline"
                                            size="sm"
                                            className="flex items-center gap-1 text-red-700 border-red-300 hover:bg-red-50 font-medium px-3"
                                            title="Reject this value as incorrect"
                                          >
                                            <ThumbsDown className="h-3 w-3" />
                                            × Reject
                                          </Button>
                                        </div>
                                      )}
                                      
                                      {/* Always show edit button */}
                                      <Button
                                        onClick={() => handleEdit(result.field, result.value)}
                                        variant="outline"
                                        size="sm"
                                        className="flex items-center gap-1 text-blue-700 border-blue-300 hover:bg-blue-50"
                                        title="Edit or modify this value"
                                      >
                                        <Edit3 className="h-3 w-3" />
                                        Edit
                                      </Button>
                                      
                                      {/* Status indicator for processed fields */}
                                      {result.status !== 'pending' && (
                                        <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                                          result.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                          result.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                          'bg-blue-100 text-blue-700'
                                        }`}>
                                          {result.status === 'accepted' && '✓ Accepted'}
                                          {result.status === 'rejected' && '× Rejected'}
                                          {result.status === 'modified' && '✎ Modified'}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  {result.originalValue && result.value !== result.originalValue && (
                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                      <Eye className="h-3 w-3" />
                                      Original: <span className="font-mono">{result.originalValue}</span>
                                    </div>
                                  )}
                                </div>

                                {/* AI Suggestions */}
                                {result.suggestions && result.suggestions.length > 0 && (
                                  <div className="space-y-1">
                                    <p className="text-xs text-gray-600 font-medium">💡 AI Suggestions ({result.suggestions.length}):</p>
                                    <div className="flex flex-wrap gap-1">
                                      {result.suggestions.map((suggestion, idx) => (
                                        <button
                                          key={idx}
                                          onClick={() => handleAcceptSuggestion(result.field, suggestion)}
                                          className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 rounded border border-blue-200 transition-colors font-mono"
                                          title={`Click to use: ${suggestion}`}
                                        >
                                          {suggestion}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Field Summary */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <h4 className="font-medium text-gray-900 mb-3">Field Validation Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Accepted: {validationResults.filter(r => r.status === 'accepted').length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Modified: {validationResults.filter(r => r.status === 'modified').length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Rejected: {validationResults.filter(r => r.status === 'rejected').length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <span>Pending: {validationResults.filter(r => r.status === 'pending').length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-6 border-t">
        <div className="flex gap-2">
          <Button
            onClick={onReject}
            variant="outline"
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Reject & Re-upload
          </Button>
          {onReAnalyze && (
            <Button
              onClick={onReAnalyze}
              variant="outline"
              className="flex items-center gap-2 text-blue-700 border-blue-300 hover:bg-blue-50"
            >
              <RefreshCw className="h-4 w-4" />
              Re-Analyze Document
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600">
            {requiredFieldsComplete ? (
              <span className="text-green-600 flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                All required fields complete
              </span>
            ) : (
              <span className="text-red-600 flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                Complete required fields to proceed
              </span>
            )}
          </div>

          <Button
            onClick={handleValidateAndProceed}
            disabled={!requiredFieldsComplete}
            variant="primary"
            className="flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Confirm & Proceed
          </Button>
        </div>
      </div>
    </div>
  );
};
