import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { AddressAutocomplete } from '../../ui/AddressAutocomplete';
import { ConfirmedFieldWrapper } from '../../ui/ConfirmedFieldWrapper';
import { ConfirmedFieldsSummary } from '../../ui/ConfirmedFieldsSummary';
import { intelligentWizardService } from '../../../services/intelligentWizardService';
import { ConfirmedFieldsService } from '../../../services/confirmedFieldsService';
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  CheckCircle, 
  AlertCircle, 
  Brain,
  Eye,
  Edit3,
  Wand2,
  Info,
  Plus,
  X
} from 'lucide-react';
import { formatPhoneNumber, formatPhoneExtension, getPhoneInputProps, getPhoneExtensionInputProps } from '../../../utils/phoneUtils';

interface IntelligentClientDetailsStepProps {
  data: any;
  onUpdate: (data: any) => void;
}

interface AISuggestion {
  field: string;
  suggestedValue: string;
  confidence: 'high' | 'medium' | 'low';
  source: string;
  applied: boolean;
}

export const IntelligentClientDetailsStep: React.FC<IntelligentClientDetailsStepProps> = ({
  data,
  onUpdate
}) => {
  const [clientDetails, setClientDetails] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    phoneExtension: '',
    phoneType: 'Primary',
    email: '',
    mailingAddress: {
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      zipCode: ''
    },
    emergencyContact: {
      name: '',
      relationship: '',
      phone: '',
      phoneExtension: ''
    },
    ...data.clientDetails
  });

  const [additionalPhones, setAdditionalPhones] = useState<Array<{
    id: string;
    type: string;
    number: string;
    extension: string;
  }>>(data.clientDetails?.additionalPhones || []);

  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [insights, setInsights] = useState<any[]>([]);
  const [isProcessingAI, setIsProcessingAI] = useState(false);

  useEffect(() => {
    // Restore confirmed fields state if available
    if (data.confirmedFieldsState) {
      console.log('📎 Restoring confirmed fields state in client details step');
      ConfirmedFieldsService.importState(data.confirmedFieldsState);
    }
    
    loadAISuggestions();
    loadInsights();
  }, [data.extractedPolicyData, data.confirmedFieldsState]);

  const loadAISuggestions = async () => {
    if (!data.extractedPolicyData) {
      console.log('❌ No extracted policy data available for AI suggestions');
      return;
    }

    setIsProcessingAI(true);
    try {
      // Get pre-populated suggestions (intelligent service should already be initialized by main wizard)
      const suggestions = intelligentWizardService.getPrePopulatedData('client-details');
      console.log('💡 AI suggestions loaded successfully');
      
      if (suggestions._aiSuggested) {
        const aiSuggestions: AISuggestion[] = [];
        
        // Map suggestions to AISuggestion format
        Object.keys(suggestions).forEach(key => {
          if (key.startsWith('_')) return; // Skip metadata
          
          const currentValue = getFieldValue(clientDetails, key);
          const suggestedValue = suggestions[key];
          
          if (suggestedValue && suggestedValue !== currentValue) {
            aiSuggestions.push({
              field: key,
              suggestedValue: typeof suggestedValue === 'object' ? JSON.stringify(suggestedValue) : suggestedValue,
              confidence: suggestions._confidence || 'medium',
              source: 'Policy Document',
              applied: false
            });
          }
        });

        setAiSuggestions(aiSuggestions);

        // Auto-apply high confidence suggestions
        const autoApplyData = { ...clientDetails };
        let hasAutoApplied = false;
        
        aiSuggestions.forEach(suggestion => {
          if (suggestion.confidence === 'high' && !getFieldValue(clientDetails, suggestion.field)) {
            setFieldValue(autoApplyData, suggestion.field, suggestion.suggestedValue);
            suggestion.applied = true;
            hasAutoApplied = true;
          }
        });

        if (hasAutoApplied) {
          setClientDetails(autoApplyData);
          updateWizardData(autoApplyData);
        }
      }
    } catch (error) {
      console.error('Error loading AI suggestions:', error);
    } finally {
      setIsProcessingAI(false);
    }
  };

  const loadInsights = async () => {
    try {
      const stepInsights = await intelligentWizardService.generateStepInsights('client-details', clientDetails);
      setInsights(stepInsights);
    } catch (error) {
      console.error('Error loading insights:', error);
    }
  };

  const applySuggestion = (suggestion: AISuggestion) => {
    const updatedDetails = { ...clientDetails };
    setFieldValue(updatedDetails, suggestion.field, suggestion.suggestedValue);
    setClientDetails(updatedDetails);
    updateWizardData(updatedDetails);

    // Mark suggestion as applied
    setAiSuggestions(prev => 
      prev.map(s => s.field === suggestion.field ? { ...s, applied: true } : s)
    );
  };

  const applyAllSuggestions = () => {
    const updatedDetails = { ...clientDetails };
    let hasChanges = false;

    aiSuggestions.forEach(suggestion => {
      if (!suggestion.applied) {
        setFieldValue(updatedDetails, suggestion.field, suggestion.suggestedValue);
        suggestion.applied = true;
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setClientDetails(updatedDetails);
      updateWizardData(updatedDetails);
      setAiSuggestions([...aiSuggestions]); // Trigger re-render
    }
  };

  const handleInputChange = (field: string, value: string) => {
    const updatedDetails = { ...clientDetails };
    setFieldValue(updatedDetails, field, value);
    setClientDetails(updatedDetails);
    
    // Update confirmed fields service
    ConfirmedFieldsService.modifyField(field, value, 'user_entered');
    
    updateWizardData(updatedDetails);

    // Mark corresponding suggestion as applied if values match
    setAiSuggestions(prev => 
      prev.map(s => 
        s.field === field && s.suggestedValue === value 
          ? { ...s, applied: true } 
          : s
      )
    );
  };

  const handleAddressChange = (addressData: any) => {
    const updatedDetails = {
      ...clientDetails,
      mailingAddress: {
        ...clientDetails.mailingAddress,
        ...addressData
      }
    };
    setClientDetails(updatedDetails);
    updateWizardData(updatedDetails);
  };

  const updateWizardData = (details: any) => {
    onUpdate({
      ...data,
      clientDetails: details,
      confirmedFieldsState: ConfirmedFieldsService.exportState() // Keep state in sync
    });
  };

  // Utility functions
  const getFieldValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  const setFieldValue = (obj: any, path: string, value: any) => {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {};
      return current[key];
    }, obj);
    target[lastKey] = value;
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
      case 'medium': return <AlertCircle className="h-4 w-4" />;
      case 'low': return <Info className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const unappliedSuggestions = aiSuggestions.filter(s => !s.applied);
  const hasUnappliedSuggestions = unappliedSuggestions.length > 0;

  return (
    <div className="space-y-6">
      {/* Confirmed Fields Summary */}
      <ConfirmedFieldsSummary
        onBulkConfirm={() => {
          // Refresh the component state after bulk confirmation
          const updatedDetails = { ...clientDetails };
          setClientDetails(updatedDetails);
          updateWizardData(updatedDetails);
        }}
        showActions={true}
      />


      {/* AI Suggestions Header */}
      {(hasUnappliedSuggestions || isProcessingAI) && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Brain className="h-5 w-5" />
              {isProcessingAI ? 'AI Analyzing Policy Data...' : 'AI Suggestions Available'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isProcessingAI ? (
              <div className="flex items-center gap-2 text-blue-700">
                <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                <span className="text-sm">Extracting client information from policy documents...</span>
              </div>
            ) : hasUnappliedSuggestions ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-blue-700">
                    {unappliedSuggestions.length} fields can be auto-filled from your policy documents
                  </p>
                  <Button
                    onClick={applyAllSuggestions}
                    variant="primary"
                    size="sm"
                    className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <Wand2 className="h-3 w-3" />
                    Apply All
                  </Button>
                </div>
                
                <div className="grid gap-2">
                  {unappliedSuggestions.slice(0, 3).map((suggestion) => (
                    <div key={suggestion.field} className="flex items-center justify-between bg-white rounded-lg p-2 border border-blue-200">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium capitalize">{suggestion.field.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded border ${getConfidenceColor(suggestion.confidence)}`}>
                            {getConfidenceIcon(suggestion.confidence)}
                            {suggestion.confidence}
                          </div>
                        </div>
                        <div className="text-xs text-gray-600 font-mono">{suggestion.suggestedValue}</div>
                      </div>
                      <Button
                        onClick={() => applySuggestion(suggestion)}
                        variant="outline"
                        size="sm"
                        className="ml-2"
                      >
                        Apply
                      </Button>
                    </div>
                  ))}
                  {unappliedSuggestions.length > 3 && (
                    <p className="text-xs text-blue-600">...and {unappliedSuggestions.length - 3} more fields</p>
                  )}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Main Client Details Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Client Information
            {data.extractedPolicyData && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded flex items-center gap-1">
                <Brain className="h-3 w-3" />
                AI Enhanced
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ConfirmedFieldWrapper
              fieldPath="firstName"
              label="First Name"
              value={clientDetails.firstName || ''}
              placeholder="Enter first name"
              required={true}
              onChange={(value) => handleInputChange('firstName', value)}
              onConfirm={(value) => {
                console.log('✅ First name confirmed:', value);
                handleInputChange('firstName', value);
              }}
              onReject={(reason) => {
                console.log('❌ First name rejected:', reason);
                handleInputChange('firstName', '');
              }}
            />

            <ConfirmedFieldWrapper
              fieldPath="lastName"
              label="Last Name"
              value={clientDetails.lastName || ''}
              placeholder="Enter last name"
              required={true}
              onChange={(value) => handleInputChange('lastName', value)}
              onConfirm={(value) => {
                console.log('✅ Last name confirmed:', value);
                handleInputChange('lastName', value);
              }}
              onReject={(reason) => {
                console.log('❌ Last name rejected:', reason);
                handleInputChange('lastName', '');
              }}
            />
          </div>

          {/* Contact Information - Single Row Layout */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Contact Information</h4>
            <div className="flex gap-3 items-end">
              {/* Primary Email - Half Size */}
              <div className="flex-1 max-w-xs">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Email <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  value={clientDetails.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="h-9"
                  placeholder="email@example.com"
                  required
                />
              </div>

              {/* Phone Type Dropdown */}
              <div className="w-28">
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Type</label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm h-9 bg-white"
                  value={clientDetails.phoneType || 'Primary'}
                  onChange={(e) => handleInputChange('phoneType', e.target.value)}
                >
                  <option value="Primary">Primary</option>
                  <option value="Mobile">Mobile</option>
                  <option value="Home">Home</option>
                  <option value="Work">Work</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Phone Number */}
              <div className="flex-1 max-w-xs">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <Input
                  type="tel"
                  value={clientDetails.phone || ''}
                  onChange={(e) => handleInputChange('phone', formatPhoneNumber(e.target.value))}
                  className="h-9"
                  placeholder="(555) 123-4567"
                  required
                  {...getPhoneInputProps()}
                />
              </div>

              {/* Extension */}
              <div className="w-20">
                <label className="block text-sm font-medium text-gray-700 mb-1">Ext.</label>
                <Input
                  value={clientDetails.phoneExtension || ''}
                  onChange={(e) => handleInputChange('phoneExtension', formatPhoneExtension(e.target.value))}
                  className="h-9 text-sm"
                  placeholder="1234"
                  {...getPhoneExtensionInputProps()}
                />
              </div>

              {/* Add Phone Button */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-transparent">Add</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 text-sm h-9"
                  onClick={() => {
                    const newPhone = {
                      id: `phone_${Date.now()}`,
                      type: 'Secondary',
                      number: '',
                      extension: ''
                    };
                    setAdditionalPhones([...additionalPhones, newPhone]);
                  }}
                >
                  <Plus className="h-3 w-3" />
                  Add Phone
                </Button>
              </div>
            </div>
          </div>

          {/* Mailing Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Mailing Address *
              {aiSuggestions.some(s => s.field.includes('mailingAddress') && s.applied) && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded flex items-center gap-1">
                  <Brain className="h-3 w-3" />
                  From Policy
                </span>
              )}
            </label>
            <AddressAutocomplete
              value={clientDetails.mailingAddress}
              onChange={handleAddressChange}
              placeholder="Start typing address..."
            />
          </div>

          {/* Emergency Contact */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Emergency Contact (Optional)</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <Input
                  type="text"
                  value={clientDetails.emergencyContact.name}
                  onChange={(e) => handleInputChange('emergencyContact.name', e.target.value)}
                  placeholder="Emergency contact name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relationship
                </label>
                <Input
                  type="text"
                  value={clientDetails.emergencyContact.relationship}
                  onChange={(e) => handleInputChange('emergencyContact.relationship', e.target.value)}
                  placeholder="e.g., Spouse, Parent"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <Input
                    type="tel"
                    value={clientDetails.emergencyContact.phone}
                    onChange={(e) => handleInputChange('emergencyContact.phone', formatPhoneNumber(e.target.value))}
                    {...getPhoneInputProps()}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Extension
                  </label>
                  <Input
                    value={clientDetails.emergencyContact.phoneExtension}
                    onChange={(e) => handleInputChange('emergencyContact.phoneExtension', formatPhoneExtension(e.target.value))}
                    {...getPhoneExtensionInputProps()}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      {insights.length > 0 && (
        <Card className="border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <Eye className="h-5 w-5" />
              AI Insights & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.map((insight, index) => (
                <div key={index} className={`p-3 rounded-lg border ${getConfidenceColor(insight.confidence)}`}>
                  <div className="flex items-start gap-2">
                    {getConfidenceIcon(insight.confidence)}
                    <div className="flex-1">
                      <h5 className="font-medium text-sm">{insight.title}</h5>
                      <p className="text-sm mt-1">{insight.description}</p>
                      {insight.suggestedValue && (
                        <div className="mt-2 p-2 bg-white rounded border">
                          <p className="text-xs font-medium">Suggested: {insight.suggestedValue}</p>
                        </div>
                      )}
                      <p className="text-xs mt-1 opacity-75">Source: {insight.source}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Statistics */}
      {(data.extractedPolicyData || aiSuggestions.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-700">
                {aiSuggestions.filter(s => s.applied).length}
              </div>
              <div className="text-sm text-green-600">Fields Auto-Filled</div>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-700">
                {aiSuggestions.filter(s => s.confidence === 'high').length}
              </div>
              <div className="text-sm text-blue-600">High Confidence</div>
            </CardContent>
          </Card>
          
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-700">
                {Math.round(((aiSuggestions.filter(s => s.applied).length) / Math.max(aiSuggestions.length, 1)) * 100)}%
              </div>
              <div className="text-sm text-purple-600">Completion</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
