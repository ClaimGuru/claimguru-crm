import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card';
import { Input } from '../../ui/Input';
import { Switch } from '../../ui/Switch';
import { AddressAutocomplete } from '../../ui/AddressAutocomplete';
import { formatPhoneNumber, formatPhoneExtension, getPhoneInputProps, getPhoneExtensionInputProps } from '../../../utils/phoneUtils';
import { 
  User, 
  MapPin, 
  Phone, 
  Mail,
  Users,
  Plus,
  X,
  Star
} from 'lucide-react';

interface ManualClientDetailsStepProps {
  data: any;
  onUpdate: (data: any) => void;
}

export const ManualClientDetailsStep: React.FC<ManualClientDetailsStepProps> = ({
  data,
  onUpdate
}) => {
  // Initialize data from root level (matching schema expectations)
  const [clientDetails, setClientDetails] = useState({
    clientType: data.clientType || 'individual',
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    businessName: data.businessName || '',
    primaryPhone: data.primaryPhone || '',
    phoneType: data.phoneType || 'cell', // Default to cell phone
    primaryEmail: data.primaryEmail || '',
    phoneNumbers: data.phoneNumbers || [
      { number: data.primaryPhone || '', type: data.phoneType || 'cell', extension: '', isPrimary: true }
    ],
    mailingAddress: {
      addressLine1: data.mailingAddress?.addressLine1 || '',
      addressLine2: data.mailingAddress?.addressLine2 || '',
      city: data.mailingAddress?.city || '',
      state: data.mailingAddress?.state || '',
      zipCode: data.mailingAddress?.zipCode || ''
    },
    hasCoInsured: data.hasCoInsured || false,
    coInsuredName: data.coInsuredName || '',
    coInsuredRelationship: data.coInsuredRelationship || '',
    coInsuredFirstName: data.coInsuredFirstName || '',
    coInsuredLastName: data.coInsuredLastName || '',
    coInsuredEmail: data.coInsuredEmail || '',
    coInsuredPhone: data.coInsuredPhone || '',
    coInsuredPhoneExtension: data.coInsuredPhoneExtension || ''
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    let processedValue = value;
    
    // Apply phone number formatting for phone fields
    if (field === 'coInsuredPhone' && typeof value === 'string') {
      processedValue = formatPhoneNumber(value);
    }
    if (field === 'coInsuredPhoneExtension' && typeof value === 'string') {
      processedValue = formatPhoneExtension(value);
    }
    
    const updatedDetails = {
      ...clientDetails,
      [field]: processedValue
    };
    setClientDetails(updatedDetails);
    updateWizardData(updatedDetails);
  };

  const handleSwitchChange = (field: string, checked: boolean) => {
    const updatedDetails = {
      ...clientDetails,
      [field]: checked
    };
    setClientDetails(updatedDetails);
    updateWizardData(updatedDetails);
  };

  const handleAddressAutocomplete = (address: string, details?: google.maps.places.PlaceResult) => {
    console.log('🏠 Address autocomplete triggered:', { 
      address, 
      hasDetails: !!details,
      detailsType: details ? 'PlaceResult' : 'Manual Input'
    });
    
    // Preserve existing address line 2 when updating
    let addressData = {
      addressLine1: address,
      addressLine2: clientDetails.mailingAddress.addressLine2 || '',
      city: clientDetails.mailingAddress.city || '',
      state: clientDetails.mailingAddress.state || '',
      zipCode: clientDetails.mailingAddress.zipCode || ''
    };

    // If we have place details, extract and populate all components
    if (details && details.address_components) {
      console.log('📍 Extracting address components from Google Places:', details.address_components);
      const components = details.address_components;
      
      const streetNumber = components.find(c => c.types.includes('street_number'))?.long_name || '';
      const street = components.find(c => c.types.includes('route'))?.long_name || '';
      const city = components.find(c => c.types.includes('locality'))?.long_name || 
                   components.find(c => c.types.includes('sublocality'))?.long_name || '';
      const state = components.find(c => c.types.includes('administrative_area_level_1'))?.short_name || '';
      const zipCode = components.find(c => c.types.includes('postal_code'))?.long_name || '';
      
      // Construct the address line 1 from components or fallback to formatted address
      const constructedAddress = `${streetNumber} ${street}`.trim();
      
      addressData = {
        addressLine1: constructedAddress || address, // Use constructed or fallback to formatted
        addressLine2: clientDetails.mailingAddress.addressLine2 || '', // Preserve existing
        city: city || clientDetails.mailingAddress.city || '',
        state: state || clientDetails.mailingAddress.state || '',
        zipCode: zipCode || clientDetails.mailingAddress.zipCode || ''
      };
      
      console.log('✅ Parsed address components:', {
        streetNumber,
        street,
        city,
        state,
        zipCode,
        finalAddressData: addressData
      });
    } else {
      console.log('📝 Using manual address input (no Google Places details)');
    }

    const updatedDetails = {
      ...clientDetails,
      mailingAddress: addressData
    };
    
    console.log('🔄 Updating client details with new address:', updatedDetails.mailingAddress);
    setClientDetails(updatedDetails);
    updateWizardData(updatedDetails);
  };

  const handleAddressFieldChange = (field: string, value: string) => {
    const updatedDetails = {
      ...clientDetails,
      mailingAddress: {
        ...clientDetails.mailingAddress,
        [field]: value
      }
    };
    setClientDetails(updatedDetails);
    updateWizardData(updatedDetails);
  };

  // Phone number management functions
  const handlePhoneNumberChange = (index: number, field: 'number' | 'type' | 'extension', value: string) => {
    const updatedPhoneNumbers = [...clientDetails.phoneNumbers];
    
    if (field === 'number') {
      // Apply phone number formatting
      const formattedValue = formatPhoneNumber(value);
      updatedPhoneNumbers[index] = {
        ...updatedPhoneNumbers[index],
        [field]: formattedValue
      };
    } else if (field === 'extension') {
      // Apply extension formatting
      const formattedValue = formatPhoneExtension(value);
      updatedPhoneNumbers[index] = {
        ...updatedPhoneNumbers[index],
        [field]: formattedValue
      };
    } else {
      updatedPhoneNumbers[index] = {
        ...updatedPhoneNumbers[index],
        [field]: value
      };
    }
    
    // Update primary phone if this is the primary number
    const updatedDetails = {
      ...clientDetails,
      phoneNumbers: updatedPhoneNumbers,
      primaryPhone: updatedPhoneNumbers.find(p => p.isPrimary)?.number || '',
      phoneType: updatedPhoneNumbers.find(p => p.isPrimary)?.type || 'cell'
    };
    
    setClientDetails(updatedDetails);
    updateWizardData(updatedDetails);
  };

  const addPhoneNumber = () => {
    const updatedDetails = {
      ...clientDetails,
      phoneNumbers: [
        ...clientDetails.phoneNumbers,
        { number: '', type: 'cell', extension: '', isPrimary: false }
      ]
    };
    setClientDetails(updatedDetails);
    updateWizardData(updatedDetails);
  };

  const removePhoneNumber = (index: number) => {
    if (clientDetails.phoneNumbers.length <= 1) return; // Keep at least one phone number
    
    const phoneToRemove = clientDetails.phoneNumbers[index];
    const updatedPhoneNumbers = clientDetails.phoneNumbers.filter((_, i) => i !== index);
    
    // If we're removing the primary phone, make the first remaining one primary
    if (phoneToRemove.isPrimary && updatedPhoneNumbers.length > 0) {
      updatedPhoneNumbers[0].isPrimary = true;
    }
    
    const updatedDetails = {
      ...clientDetails,
      phoneNumbers: updatedPhoneNumbers,
      primaryPhone: updatedPhoneNumbers.find(p => p.isPrimary)?.number || '',
      phoneType: updatedPhoneNumbers.find(p => p.isPrimary)?.type || 'cell'
    };
    
    setClientDetails(updatedDetails);
    updateWizardData(updatedDetails);
  };

  const setPrimaryPhone = (index: number) => {
    const updatedPhoneNumbers = clientDetails.phoneNumbers.map((phone, i) => ({
      ...phone,
      isPrimary: i === index
    }));
    
    const updatedDetails = {
      ...clientDetails,
      phoneNumbers: updatedPhoneNumbers,
      primaryPhone: updatedPhoneNumbers[index].number,
      phoneType: updatedPhoneNumbers[index].type
    };
    
    setClientDetails(updatedDetails);
    updateWizardData(updatedDetails);
  };

  // Sync local state with prop data changes
  useEffect(() => {
    // Ensure phone numbers have extension field (migration support)
    const phoneNumbers = (data.phoneNumbers || [
      { number: data.primaryPhone || '', type: data.phoneType || 'cell', isPrimary: true }
    ]).map(phone => ({
      ...phone,
      extension: phone.extension || '' // Add extension field if missing
    }));
    
    setClientDetails({
      clientType: data.clientType || 'individual',
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      businessName: data.businessName || '',
      primaryPhone: data.primaryPhone || '',
      phoneType: data.phoneType || 'cell',
      primaryEmail: data.primaryEmail || '',
      phoneNumbers: phoneNumbers,
      mailingAddress: {
        addressLine1: data.mailingAddress?.addressLine1 || '',
        addressLine2: data.mailingAddress?.addressLine2 || '',
        city: data.mailingAddress?.city || '',
        state: data.mailingAddress?.state || '',
        zipCode: data.mailingAddress?.zipCode || ''
      },
      hasCoInsured: data.hasCoInsured || false,
      coInsuredName: data.coInsuredName || '',
      coInsuredRelationship: data.coInsuredRelationship || '',
      coInsuredFirstName: data.coInsuredFirstName || '',
      coInsuredLastName: data.coInsuredLastName || '',
      coInsuredEmail: data.coInsuredEmail || '',
      coInsuredPhone: data.coInsuredPhone || '',
      coInsuredPhoneExtension: data.coInsuredPhoneExtension || ''
    });
  }, [data]);

  const updateWizardData = (details: any) => {
    // Update data at root level to match schema expectations
    const updatedData = {
      ...data,
      ...details
    };
    console.log('Updating wizard data:', updatedData);
    onUpdate(updatedData);
  };

  // Utility function to set nested field values
  const setFieldValue = (obj: any, path: string, value: any) => {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {};
      return current[key];
    }, obj);
    target[lastKey] = value;
  };

  return (
    <div className="space-y-6">
      {/* Main Client Details Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Client Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Client Type Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Client Type *
            </label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="individual"
                  checked={clientDetails.clientType === 'individual'}
                  onChange={(e) => handleInputChange('clientType', e.target.value)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">Individual/Residential</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="business"
                  checked={clientDetails.clientType === 'business'}
                  onChange={(e) => handleInputChange('clientType', e.target.value)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">Business/Commercial</span>
              </label>
            </div>
          </div>

          {/* Personal Information */}
          {clientDetails.clientType === 'individual' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <Input
                type="text"
                value={clientDetails.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="Enter first name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <Input
                type="text"
                value={clientDetails.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Enter last name"
                required
              />
            </div>
            </div>
          )}

          {/* Business Information */}
          {clientDetails.clientType === 'business' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Name *
              </label>
              <Input
                type="text"
                value={clientDetails.businessName || ''}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                placeholder="Enter business name"
                required
              />
            </div>
          )}

          {/* Contact Information */}
          <div className="space-y-4">
            {/* Primary Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Primary Email *
              </label>
              <Input
                type="email"
                value={clientDetails.primaryEmail}
                onChange={(e) => handleInputChange('primaryEmail', e.target.value)}
                placeholder="Enter email address"
                required
              />
            </div>

            {/* Phone Numbers Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Numbers *
                </label>
                <button
                  type="button"
                  onClick={addPhoneNumber}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-50 text-blue-600 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                >
                  <Plus className="h-3 w-3" />
                  Add Phone
                </button>
              </div>
              
              {/* Phone Number List */}
              <div className="space-y-2">
                {clientDetails.phoneNumbers.map((phone, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    {/* Primary Phone Indicator */}
                    <button
                      type="button"
                      onClick={() => setPrimaryPhone(index)}
                      className={`flex-shrink-0 p-1 rounded ${phone.isPrimary ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                      title={phone.isPrimary ? 'Primary Phone' : 'Set as Primary'}
                    >
                      <Star className={`h-4 w-4 ${phone.isPrimary ? 'fill-current' : ''}`} />
                    </button>
                    
                    {/* Phone Number Input */}
                    <div className="flex-1">
                      <Input
                        {...getPhoneInputProps()}
                        value={phone.number}
                        onChange={(e) => handlePhoneNumberChange(index, 'number', e.target.value)}
                        className="w-full"
                        required={phone.isPrimary}
                      />
                    </div>
                    
                    {/* Extension Input */}
                    <div className="w-20">
                      <Input
                        {...getPhoneExtensionInputProps()}
                        value={phone.extension || ''}
                        onChange={(e) => handlePhoneNumberChange(index, 'extension', e.target.value)}
                        className="w-full"
                        placeholder="Ext."
                      />
                    </div>
                    
                    {/* Phone Type Select */}
                    <div className="w-24">
                      <select
                        value={phone.type}
                        onChange={(e) => handlePhoneNumberChange(index, 'type', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                      >
                        <option value="cell">Cell</option>
                        <option value="home">Home</option>
                        <option value="office">Office</option>
                        <option value="work">Work</option>
                        <option value="business">Business</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    
                    {/* Remove Button */}
                    {clientDetails.phoneNumbers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePhoneNumber(index)}
                        className="flex-shrink-0 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                        title="Remove Phone Number"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Helper Text */}
              <p className="text-xs text-gray-500">
                Click the star (⭐) to set a phone number as primary. At least one phone number is required.
              </p>
            </div>
          </div>

          {/* Mailing Address - Optional for now */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Mailing Address
            </h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address (Address 1)
              </label>
              <AddressAutocomplete
                value={clientDetails.mailingAddress?.addressLine1 || ''}
                onChange={handleAddressAutocomplete}
                placeholder="Start typing street address..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apartment, Suite, Unit, etc. (Address 2)
              </label>
              <Input
                type="text"
                value={clientDetails.mailingAddress?.addressLine2 || ''}
                onChange={(e) => handleAddressFieldChange('addressLine2', e.target.value)}
                placeholder="Apt, Suite, Unit, Building, Floor, etc."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <Input
                  type="text"
                  value={clientDetails.mailingAddress?.city || ''}
                  onChange={(e) => handleAddressFieldChange('city', e.target.value)}
                  placeholder="City"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <Input
                  type="text"
                  value={clientDetails.mailingAddress?.state || ''}
                  onChange={(e) => handleAddressFieldChange('state', e.target.value)}
                  placeholder="State"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP Code
                </label>
                <Input
                  type="text"
                  value={clientDetails.mailingAddress?.zipCode || ''}
                  onChange={(e) => handleAddressFieldChange('zipCode', e.target.value)}
                  placeholder="ZIP Code"
                />
              </div>
            </div>
          </div>

          {/* Co-Insured Section */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <h4 className="text-sm font-medium text-gray-700">Co-Insured</h4>
              </div>
              <Switch
                checked={clientDetails.hasCoInsured}
                onChange={(checked) => handleSwitchChange('hasCoInsured', checked)}
              />
            </div>

            {clientDetails.hasCoInsured && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                {/* Co-Insured Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Co-Insured First Name *
                    </label>
                    <Input
                      type="text"
                      value={clientDetails.coInsuredFirstName}
                      onChange={(e) => {
                        const firstName = e.target.value;
                        const lastName = clientDetails.coInsuredLastName;
                        const fullName = `${firstName} ${lastName}`.trim();
                        
                        // Update all related fields at once
                        const updatedDetails = {
                          ...clientDetails,
                          coInsuredFirstName: firstName,
                          coInsuredName: fullName
                        };
                        setClientDetails(updatedDetails);
                        updateWizardData(updatedDetails);
                      }}
                      placeholder="First name"
                      required={clientDetails.hasCoInsured}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Co-Insured Last Name *
                    </label>
                    <Input
                      type="text"
                      value={clientDetails.coInsuredLastName}
                      onChange={(e) => {
                        const lastName = e.target.value;
                        const firstName = clientDetails.coInsuredFirstName;
                        const fullName = `${firstName} ${lastName}`.trim();
                        
                        // Update all related fields at once
                        const updatedDetails = {
                          ...clientDetails,
                          coInsuredLastName: lastName,
                          coInsuredName: fullName
                        };
                        setClientDetails(updatedDetails);
                        updateWizardData(updatedDetails);
                      }}
                      placeholder="Last name"
                      required={clientDetails.hasCoInsured}
                    />
                  </div>
                </div>

                {/* Co-Insured Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Co-Insured Email *
                    </label>
                    <Input
                      type="email"
                      value={clientDetails.coInsuredEmail}
                      onChange={(e) => handleInputChange('coInsuredEmail', e.target.value)}
                      placeholder="Email address"
                      required={clientDetails.hasCoInsured}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Co-Insured Phone *
                      </label>
                      <Input
                        {...getPhoneInputProps()}
                        value={clientDetails.coInsuredPhone}
                        onChange={(e) => handleInputChange('coInsuredPhone', e.target.value)}
                        required={clientDetails.hasCoInsured}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Extension
                      </label>
                      <Input
                        value={clientDetails.coInsuredPhoneExtension}
                        onChange={(e) => handleInputChange('coInsuredPhoneExtension', e.target.value)}
                        {...getPhoneExtensionInputProps()}
                      />
                    </div>
                  </div>
                </div>

                {/* Relationship */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Relationship to Primary Insured *
                  </label>
                  <select
                    value={clientDetails.coInsuredRelationship}
                    onChange={(e) => handleInputChange('coInsuredRelationship', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required={clientDetails.hasCoInsured}
                  >
                    <option value="">Select relationship</option>
                    <option value="spouse">Spouse</option>
                    <option value="partner">Partner</option>
                    <option value="parent">Parent</option>
                    <option value="child">Child</option>
                    <option value="sibling">Sibling</option>
                    <option value="business_partner">Business Partner</option>
                    <option value="co_owner">Co-Owner</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};