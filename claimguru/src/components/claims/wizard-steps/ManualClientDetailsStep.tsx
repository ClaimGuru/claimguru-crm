import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card';
import { Input } from '../../ui/Input';
import { AddressAutocomplete } from '../../ui/AddressAutocomplete';
import { 
  User, 
  MapPin, 
  Phone, 
  Mail
} from 'lucide-react';

interface ManualClientDetailsStepProps {
  data: any;
  onUpdate: (data: any) => void;
}

export const ManualClientDetailsStep: React.FC<ManualClientDetailsStepProps> = ({
  data,
  onUpdate
}) => {
  const [clientDetails, setClientDetails] = useState({
    firstName: '',
    lastName: '',
    phone: '',
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
      phone: ''
    },
    ...data.clientDetails
  });

  const handleInputChange = (field: string, value: string) => {
    const updatedDetails = { ...clientDetails };
    setFieldValue(updatedDetails, field, value);
    setClientDetails(updatedDetails);
    updateWizardData(updatedDetails);
  };

  const handleAddressChange = (address: string, details?: google.maps.places.PlaceResult) => {
    // Parse the address or use details if available
    let addressData = {
      addressLine1: address,
      addressLine2: '',
      city: '',
      state: '',
      zipCode: ''
    };

    // If we have place details, extract components
    if (details && details.address_components) {
      const components = details.address_components;
      const streetNumber = components.find(c => c.types.includes('street_number'))?.long_name || '';
      const street = components.find(c => c.types.includes('route'))?.long_name || '';
      const city = components.find(c => c.types.includes('locality'))?.long_name || '';
      const state = components.find(c => c.types.includes('administrative_area_level_1'))?.short_name || '';
      const zipCode = components.find(c => c.types.includes('postal_code'))?.long_name || '';
      
      addressData = {
        addressLine1: `${streetNumber} ${street}`.trim(),
        addressLine2: '',
        city: city,
        state: state,
        zipCode: zipCode
      };
    }

    const updatedDetails = {
      ...clientDetails,
      mailingAddress: addressData
    };
    setClientDetails(updatedDetails);
    updateWizardData(updatedDetails);
  };

  const updateWizardData = (details: any) => {
    onUpdate({
      ...data,
      clientDetails: details
    });
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
          {/* Personal Information */}
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

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number *
              </label>
              <Input
                type="tel"
                value={clientDetails.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(555) 123-4567"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </label>
              <Input
                type="email"
                value={clientDetails.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter email address"
              />
            </div>
          </div>

          {/* Mailing Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Mailing Address *
            </label>
            <AddressAutocomplete
              value={clientDetails.mailingAddress?.addressLine1 || ''}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <Input
                  type="tel"
                  value={clientDetails.emergencyContact.phone}
                  onChange={(e) => handleInputChange('emergencyContact.phone', e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};