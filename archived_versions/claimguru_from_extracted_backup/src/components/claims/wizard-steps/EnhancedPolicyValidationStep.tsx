import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Edit, 
  Check, 
  X, 
  ArrowLeft, 
  ArrowRight,
  AlertTriangle,
  Sparkles,
  HelpCircle
} from 'lucide-react';

interface ValidationField {
  key: string;
  label: string;
  value: string;
  originalValue: string;
  confidence: number;
  editing: boolean;
  source?: string;
  alternatives?: { value: string; confidence: number; source: string }[];
}

interface EnhancedPolicyValidationStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onPrevStep?: () => void;
  onNextStep?: () => void;
}

export const EnhancedPolicyValidationStep: React.FC<EnhancedPolicyValidationStepProps> = ({
  data,
  onUpdate,
  onPrevStep,
  onNextStep
}) => {
  const [fields, setFields] = useState<ValidationField[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [validationLevel, setValidationLevel] = useState<'basic' | 'advanced'>('basic');
  const [validationStats, setValidationStats] = useState({
    totalFields: 0,
    verifiedFields: 0,
    editedFields: 0,
    lowConfidenceFields: 0
  });
  
  // Initialize fields from policy data
  useEffect(() => {
    if (data?.policyDetails) {
      const policyData = data.policyDetails;
      const validationResults = data.validationResults || [];
      
      // Map policy data to validation fields
      const fieldMappings = [
        { key: 'policyNumber', label: 'Policy Number' },
        { key: 'insuredName', label: 'Insured Name' },
        { key: 'insurerName', label: 'Insurance Company' },
        { key: 'effectiveDate', label: 'Effective Date' },
        { key: 'expirationDate', label: 'Expiration Date' },
        { key: 'propertyAddress', label: 'Property Address' },
        { key: 'coverageAmount', label: 'Coverage Amount' },
        { key: 'deductible', label: 'Deductible' },
        { key: 'premium', label: 'Premium' },
        { key: 'agentName', label: 'Agent Name' },
        { key: 'agentPhone', label: 'Agent Phone' },
        { key: 'mortgagee', label: 'Mortgagee' },
        { key: 'loanNumber', label: 'Loan Number' }
      ];
      
      const newFields: ValidationField[] = [];
      
      fieldMappings.forEach(mapping => {
        if (policyData[mapping.key]) {
          // Find validation result for this field
          const validationResult = validationResults.find(vr => vr.field === mapping.key);
          
          newFields.push({
            key: mapping.key,
            label: mapping.label,
            value: policyData[mapping.key],
            originalValue: policyData[mapping.key],
            confidence: validationResult?.confidence || 0.85,
            editing: false,
            source: validationResult?.source || data.processingMethod || 'pdf.js',
            alternatives: validationResult?.alternativeValues
          });
        }
      });
      
      setFields(newFields);
      
      // Calculate validation stats
      const lowConfidenceThreshold = 0.75;
      const stats = {
        totalFields: newFields.length,
        verifiedFields: 0,
        editedFields: 0,
        lowConfidenceFields: newFields.filter(f => f.confidence < lowConfidenceThreshold).length
      };
      
      setValidationStats(stats);
    }
  }, [data]);
  
  // Handle field edit
  const handleEdit = (index: number) => {
    setFields(prevFields => {
      const newFields = [...prevFields];
      newFields[index].editing = true;
      return newFields;
    });
  };
  
  // Handle field value change
  const handleChange = (index: number, newValue: string) => {
    setFields(prevFields => {
      const newFields = [...prevFields];
      newFields[index].value = newValue;
      return newFields;
    });
  };
  
  // Handle field save
  const handleSave = (index: number) => {
    setFields(prevFields => {
      const newFields = [...prevFields];
      newFields[index].editing = false;
      
      // Check if value was edited
      const wasEdited = newFields[index].value !== newFields[index].originalValue;
      
      // Update edited fields count in stats
      if (wasEdited) {
        setValidationStats(prevStats => ({
          ...prevStats,
          editedFields: prevStats.editedFields + 1
        }));
      }
      
      return newFields;
    });
  };
  
  // Handle field cancel
  const handleCancel = (index: number) => {
    setFields(prevFields => {
      const newFields = [...prevFields];
      newFields[index].editing = false;
      newFields[index].value = newFields[index].originalValue;
      return newFields;
    });
  };
  
  // Handle using an alternative value
  const handleUseAlternative = (index: number, alternativeValue: string) => {
    setFields(prevFields => {
      const newFields = [...prevFields];
      newFields[index].value = alternativeValue;
      newFields[index].editing = false;
      
      // Update edited fields count in stats
      setValidationStats(prevStats => ({
        ...prevStats,
        editedFields: prevStats.editedFields + 1
      }));
      
      return newFields;
    });
  };
  
  // Handle field verification
  const handleVerify = (index: number) => {
    // Mark field as verified in stats
    setValidationStats(prevStats => ({
      ...prevStats,
      verifiedFields: prevStats.verifiedFields + 1
    }));
  };
  
  // Handle submission of verified data
  const handleSubmit = () => {
    // Create updated policy data
    const updatedPolicyData = { ...data.policyDetails };
    
    // Update with validated values
    fields.forEach(field => {
      updatedPolicyData[field.key] = field.value;
    });
    
    // Update wizard data
    onUpdate({
      ...data,
      policyDetails: updatedPolicyData,
      validatedPolicyData: true,
      validationStats: {
        totalFields: validationStats.totalFields,
        verifiedFields: validationStats.verifiedFields,
        editedFields: validationStats.editedFields
      }
    });
    
    // Move to next step
    if (onNextStep) {
      onNextStep();
    }
  };
  
  // Determine if all fields are validated and ready to proceed
  const isReadyToProceed = validationStats.verifiedFields > 0 || validationStats.editedFields > 0;
  
  // Determine confidence level colors
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.75) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  // Determine confidence level icon
  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.9) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (confidence >= 0.75) return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    return <AlertCircle className="h-4 w-4 text-red-600" />;
  };
  
  // Format confidence as percentage
  const formatConfidence = (confidence: number) => {
    return `${Math.round(confidence * 100)}%`;
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              Validate Extracted Policy Data
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditMode(!editMode)}
                className="flex items-center gap-1.5"
              >
                <Edit className="h-4 w-4" />
                {editMode ? 'Exit Edit Mode' : 'Edit Mode'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setValidationLevel(validationLevel === 'basic' ? 'advanced' : 'basic')}
                className="flex items-center gap-1.5"
              >
                {validationLevel === 'basic' ? (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Advanced View
                  </>
                ) : (
                  <>
                    <ArrowLeft className="h-4 w-4" />
                    Basic View
                  </>
                )}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Validation Summary */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Validation Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-3 rounded-lg text-center">
                <div className="text-2xl font-bold">{validationStats.totalFields}</div>
                <div className="text-sm text-gray-500">Total Fields</div>
              </div>
              <div className="bg-white p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{validationStats.verifiedFields}</div>
                <div className="text-sm text-gray-500">Verified Fields</div>
              </div>
              <div className="bg-white p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{validationStats.editedFields}</div>
                <div className="text-sm text-gray-500">Edited Fields</div>
              </div>
              <div className="bg-white p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-600">{validationStats.lowConfidenceFields}</div>
                <div className="text-sm text-gray-500">Need Review</div>
              </div>
            </div>
            
            {validationStats.lowConfidenceFields > 0 && (
              <div className="mt-3 text-sm text-yellow-800 bg-yellow-50 p-2 rounded border border-yellow-200 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5" />
                <div>
                  <strong>{validationStats.lowConfidenceFields} fields</strong> have lower confidence scores and need your review.
                </div>
              </div>
            )}
          </div>
          
          {/* Extraction Information */}
          {validationLevel === 'advanced' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
              <h3 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                Extraction Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2">
                <div>
                  <strong>Processing Method:</strong> {data.processingMethod}
                </div>
                <div>
                  <strong>Confidence:</strong> {formatConfidence(data.confidence || 0.85)}
                </div>
                <div>
                  <strong>Processing Time:</strong> {data.processingTime?.toFixed(1) || '3.2'} seconds
                </div>
                <div>
                  <strong>Page Count:</strong> {data.pageCount || '?'} pages
                </div>
                <div>
                  <strong>Processing Cost:</strong> ${data.cost?.toFixed(3) || '0.000'}
                </div>
                <div>
                  <strong>File:</strong> {data.fileProcessed || 'policy.pdf'}
                </div>
              </div>
            </div>
          )}
          
          {/* Field Validation */}
          <div className="grid grid-cols-1 gap-4">
            {fields.map((field, index) => (
              <div 
                key={field.key}
                className={`border rounded-lg p-4 ${
                  field.confidence < 0.75 ? 'bg-red-50 border-red-200' :
                  field.confidence < 0.9 ? 'bg-yellow-50 border-yellow-200' :
                  'bg-white border-gray-200'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {getConfidenceIcon(field.confidence)}
                    <h3 className="font-medium">{field.label}</h3>
                    
                    {validationLevel === 'advanced' && (
                      <span className={`text-xs ${getConfidenceColor(field.confidence)}`}>
                        {formatConfidence(field.confidence)}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {editMode ? (
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(index)}
                          className="h-7 px-2"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => handleVerify(index)}
                          className="h-7 px-2 text-green-600 border-green-300 hover:bg-green-50"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : field.editing ? (
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => handleSave(index)}
                          className="h-7 px-2 text-green-600 border-green-300 hover:bg-green-50"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                        
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancel(index)}
                          className="h-7 px-2 text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : (
                      validationLevel === 'advanced' && (
                        <div className="text-xs text-gray-500">
                          Source: {field.source}
                        </div>
                      )
                    )}
                  </div>
                </div>
                
                <div className="mt-2">
                  {field.editing ? (
                    <Input
                      value={field.value}
                      onChange={(e) => handleChange(index, e.target.value)}
                      className="border-gray-300"
                    />
                  ) : (
                    <div className="p-2 bg-white border border-gray-200 rounded">{field.value}</div>
                  )}
                </div>
                
                {/* Alternative values from different extraction methods */}
                {validationLevel === 'advanced' && field.alternatives && field.alternatives.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-xs text-gray-500 mb-1">Alternative values:</h4>
                    <div className="space-y-2">
                      {field.alternatives.map((alt, altIndex) => (
                        <div key={altIndex} className="flex items-center justify-between p-1.5 bg-gray-50 rounded text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-700">{alt.value}</span>
                            <span className={`text-xs ${getConfidenceColor(alt.confidence)}`}>
                              {formatConfidence(alt.confidence)}
                            </span>
                            <span className="text-xs text-gray-500">
                              (from {alt.source})
                            </span>
                          </div>
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => handleUseAlternative(index, alt.value)}
                            className="h-6 px-2 text-xs"
                          >
                            Use this
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={onPrevStep}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Upload
            </Button>
            
            <Button
              onClick={handleSubmit}
              disabled={!isReadyToProceed}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};