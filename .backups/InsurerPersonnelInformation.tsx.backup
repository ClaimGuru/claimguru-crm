import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { AddressAutocomplete } from '../../ui/AddressAutocomplete';
import { 
  Users, 
  Plus, 
  X, 
  User, 
  Phone, 
  Mail, 
  Building, 
  MapPin, 
  Award,
  Briefcase,
  Shield,
  AlertCircle,
  CheckCircle,
  Star
} from 'lucide-react';
import { 
  formatPhoneNumber, 
  formatPhoneExtension, 
  getPhoneInputProps, 
  getPhoneExtensionInputProps,
  combinePhoneWithExtension
} from '../../../utils/phoneUtils';

interface License {
  id: string;
  licenseNumber: string;
  licenseState: string;
  licenseType: string;
}

interface PhoneNumber {
  number: string;
  type: string;
  extension: string;
  isPrimary: boolean;
}

interface PersonnelMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string; // Legacy field for backward compatibility
  phoneExtension: string; // Legacy field for backward compatibility
  phoneNumbers: PhoneNumber[];
  personnelType: string;
  vendorSubType: string;
  licenses: License[];
  title: string;
  department: string;
  notes: string;
}

interface InsurerPersonnelInformationProps {
  data: PersonnelMember[];
  onUpdate: (personnel: PersonnelMember[]) => void;
  insurerName?: string;
}

export const InsurerPersonnelInformation: React.FC<InsurerPersonnelInformationProps> = ({
  data = [],
  onUpdate,
  insurerName = 'this insurer'
}) => {
  const [personnel, setPersonnel] = useState<PersonnelMember[]>(data);

  useEffect(() => {
    onUpdate(personnel);
  }, [personnel, onUpdate]);

  // Backward compatibility: Ensure all personnel have phoneNumbers array
  useEffect(() => {
    const needsUpdate = personnel.some(member => !member.phoneNumbers || member.phoneNumbers.length === 0);
    
    if (needsUpdate) {
      const updatedPersonnel = personnel.map(member => {
        if (!member.phoneNumbers || member.phoneNumbers.length === 0) {
          return {
            ...member,
            phoneNumbers: [
              { 
                number: member.phoneNumber || '', 
                type: 'work', 
                extension: member.phoneExtension || '', 
                isPrimary: true 
              }
            ]
          };
        }
        return member;
      });
      
      setPersonnel(updatedPersonnel);
    }
  }, []);

  const personnelTypes = [
    'Supervisor',
    'Manager', 
    'Team Lead',
    'Field Adjuster',
    'Desk Adjuster',
    'Building Consultant',
    'Expert',
    'Engineer',
    'Vendor'
  ];

  const vendorSubTypes = [
    'Ladder Assist',
    'Photographer',
    'Drone Operator',
    'Water Mitigation',
    'Restoration',
    'Contractor',
    'Public Adjuster',
    'Attorney',
    'Forensic Accountant',
    'Loss Consultant',
    'Structural Engineer',
    'Environmental Specialist',
    'Security Services',
    'Cleaning Services',
    'Board-up Services',
    'Roofer',
    'HVAC Specialist',
    'Electrician',
    'Plumber',
    'Flooring Specialist',
    'Damage Assessment'
  ];

  const licenseTypes = [
    'Adjuster License',
    'Public Adjuster License',
    'Contractor License',
    'Professional Engineer',
    'Architect License',
    'Real Estate License',
    'Insurance Producer',
    'Professional License',
    'Trade License',
    'Certification',
    'Other'
  ];

  const usStates = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  const phoneTypes = [
    'cell',
    'work',
    'home',
    'office',
    'fax',
    'other'
  ];

  const addPersonnelMember = () => {
    const newMember: PersonnelMember = {
      id: Date.now().toString(),
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '', // Legacy field
      phoneExtension: '', // Legacy field
      phoneNumbers: [
        { number: '', type: 'work', extension: '', isPrimary: true }
      ],
      personnelType: '',
      vendorSubType: '',
      licenses: [],
      title: '',
      department: '',
      notes: ''
    };
    setPersonnel([...personnel, newMember]);
  };

  const removePersonnelMember = (id: string) => {
    setPersonnel(personnel.filter(member => member.id !== id));
  };

  const updatePersonnelMember = (id: string, field: keyof PersonnelMember, value: any) => {
    setPersonnel(personnel.map(member => 
      member.id === id ? { ...member, [field]: value } : member
    ));
  };

  // Phone number management functions
  const handlePhoneNumberChange = (memberId: string, index: number, field: 'number' | 'type' | 'extension', value: string) => {
    setPersonnel(personnel.map(member => {
      if (member.id !== memberId) return member;
      
      const updatedPhoneNumbers = [...member.phoneNumbers];
      
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
      
      // Update legacy fields for backward compatibility
      const primaryPhone = updatedPhoneNumbers.find(p => p.isPrimary);
      
      return {
        ...member,
        phoneNumbers: updatedPhoneNumbers,
        phoneNumber: primaryPhone?.number || '',
        phoneExtension: primaryPhone?.extension || ''
      };
    }));
  };

  const addPhoneNumber = (memberId: string) => {
    setPersonnel(personnel.map(member => {
      if (member.id !== memberId) return member;
      
      return {
        ...member,
        phoneNumbers: [
          ...member.phoneNumbers,
          { number: '', type: 'work', extension: '', isPrimary: false }
        ]
      };
    }));
  };

  const removePhoneNumber = (memberId: string, index: number) => {
    setPersonnel(personnel.map(member => {
      if (member.id !== memberId) return member;
      
      if (member.phoneNumbers.length <= 1) return member; // Keep at least one phone number
      
      const phoneToRemove = member.phoneNumbers[index];
      const updatedPhoneNumbers = member.phoneNumbers.filter((_, i) => i !== index);
      
      // If we're removing the primary phone, make the first remaining one primary
      if (phoneToRemove.isPrimary && updatedPhoneNumbers.length > 0) {
        updatedPhoneNumbers[0].isPrimary = true;
      }
      
      // Update legacy fields for backward compatibility
      const primaryPhone = updatedPhoneNumbers.find(p => p.isPrimary);
      
      return {
        ...member,
        phoneNumbers: updatedPhoneNumbers,
        phoneNumber: primaryPhone?.number || '',
        phoneExtension: primaryPhone?.extension || ''
      };
    }));
  };

  const setPrimaryPhone = (memberId: string, index: number) => {
    setPersonnel(personnel.map(member => {
      if (member.id !== memberId) return member;
      
      const updatedPhoneNumbers = member.phoneNumbers.map((phone, i) => ({
        ...phone,
        isPrimary: i === index
      }));
      
      return {
        ...member,
        phoneNumbers: updatedPhoneNumbers,
        phoneNumber: updatedPhoneNumbers[index].number,
        phoneExtension: updatedPhoneNumbers[index].extension
      };
    }));
  };

  const addLicense = (memberId: string) => {
    const newLicense: License = {
      id: Date.now().toString(),
      licenseNumber: '',
      licenseState: '',
      licenseType: ''
    };
    
    setPersonnel(personnel.map(member => 
      member.id === memberId 
        ? { ...member, licenses: [...member.licenses, newLicense] }
        : member
    ));
  };

  const removeLicense = (memberId: string, licenseId: string) => {
    setPersonnel(personnel.map(member => 
      member.id === memberId 
        ? { ...member, licenses: member.licenses.filter(license => license.id !== licenseId) }
        : member
    ));
  };

  const updateLicense = (memberId: string, licenseId: string, field: keyof License, value: string) => {
    setPersonnel(personnel.map(member => 
      member.id === memberId 
        ? {
            ...member,
            licenses: member.licenses.map(license => 
              license.id === licenseId ? { ...license, [field]: value } : license
            )
          }
        : member
    ));
  };

  const getPersonnelSummary = () => {
    const typeCount = personnel.reduce((acc, member) => {
      const type = member.personnelType || 'Unspecified';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(typeCount).map(([type, count]) => `${count} ${type}${count > 1 ? 's' : ''}`).join(', ');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Insurer's Personnel Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Information Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Personnel Contact Management</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Add all personnel from {insurerName} who will be involved in this claim. This information will be stored in your contacts 
                    and automatically associated with {insurerName} for pattern analysis and future reference.
                  </p>
                </div>
              </div>
            </div>

            {/* Summary */}
            {personnel.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-900">
                    {personnel.length} Personnel Added: {getPersonnelSummary()}
                  </span>
                </div>
              </div>
            )}

            {/* Personnel List */}
            {personnel.map((member, index) => (
              <Card key={member.id} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5 text-green-600" />
                      Personnel #{index + 1}
                      {member.firstName && member.lastName && (
                        <span className="text-gray-600 font-normal">
                          - {member.firstName} {member.lastName}
                        </span>
                      )}
                    </CardTitle>
                    <Button
                      onClick={() => removePersonnelMember(member.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Basic Information */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-600" />
                      Basic Information
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          First Name *
                        </label>
                        <Input
                          value={member.firstName}
                          onChange={(e) => updatePersonnelMember(member.id, 'firstName', e.target.value)}
                          placeholder="First name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name *
                        </label>
                        <Input
                          value={member.lastName}
                          onChange={(e) => updatePersonnelMember(member.id, 'lastName', e.target.value)}
                          placeholder="Last name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address *
                        </label>
                        <Input
                          type="email"
                          value={member.email}
                          onChange={(e) => updatePersonnelMember(member.id, 'email', e.target.value)}
                          placeholder="email@company.com"
                          required
                        />
                      </div>
                      {/* Phone Numbers Section */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Phone Numbers *
                        </label>
                        
                        {/* Primary Phone Display */}
                        {member.phoneNumbers && member.phoneNumbers.length > 0 && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Phone className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-900">Primary Contact</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="text-sm text-blue-800">
                                <span className="font-medium">Phone:</span> {member.phoneNumbers.find(p => p.isPrimary)?.number || 'Not set'}
                              </div>
                              <div className="text-sm text-blue-800">
                                <span className="font-medium">Type:</span> {member.phoneNumbers.find(p => p.isPrimary)?.type || 'Not set'}
                              </div>
                            </div>
                            {member.phoneNumbers.find(p => p.isPrimary)?.extension && (
                              <div className="text-sm text-blue-800 mt-1">
                                <span className="font-medium">Extension:</span> {member.phoneNumbers.find(p => p.isPrimary)?.extension}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Phone Numbers List */}
                        <div className="space-y-3">
                          {member.phoneNumbers?.map((phone, phoneIndex) => (
                            <div key={phoneIndex} className="border border-gray-200 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-3">
                                {/* Primary Phone Star */}
                                <button
                                  type="button"
                                  onClick={() => setPrimaryPhone(member.id, phoneIndex)}
                                  className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                                    phone.isPrimary 
                                      ? 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500' 
                                      : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                                  }`}
                                  title={phone.isPrimary ? 'Primary phone' : 'Click to make primary'}
                                >
                                  <Star className={`h-3 w-3 ${phone.isPrimary ? 'fill-current' : ''}`} />
                                </button>

                                {/* Phone Number Input */}
                                <div className="flex-1">
                                  <Input
                                    value={phone.number}
                                    onChange={(e) => handlePhoneNumberChange(member.id, phoneIndex, 'number', e.target.value)}
                                    {...getPhoneInputProps()}
                                    placeholder="Phone number"
                                  />
                                </div>

                                {/* Extension Input */}
                                <div className="w-20">
                                  <Input
                                    value={phone.extension}
                                    onChange={(e) => handlePhoneNumberChange(member.id, phoneIndex, 'extension', e.target.value)}
                                    {...getPhoneExtensionInputProps()}
                                    placeholder="Ext"
                                  />
                                </div>

                                {/* Phone Type Select */}
                                <div className="w-24">
                                  <select
                                    value={phone.type}
                                    onChange={(e) => handlePhoneNumberChange(member.id, phoneIndex, 'type', e.target.value)}
                                    className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                  >
                                    {phoneTypes.map(type => (
                                      <option key={type} value={type}>
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {/* Remove Phone Button */}
                                {member.phoneNumbers.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removePhoneNumber(member.id, phoneIndex)}
                                    className="flex-shrink-0 p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                                    title="Remove phone number"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                )}
                              </div>

                              {/* Labels Row */}
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <div className="flex-shrink-0 w-6"></div>
                                <div className="flex-1">Phone Number {phone.isPrimary && '(Primary)'}</div>
                                <div className="w-20 text-center">Extension</div>
                                <div className="w-24 text-center">Type</div>
                                {member.phoneNumbers.length > 1 && <div className="flex-shrink-0 w-10"></div>}
                              </div>
                            </div>
                          ))}

                          {/* Add Phone Button Row */}
                          <div className="flex items-center gap-2 p-3">
                            <div className="flex-shrink-0 w-6"></div>
                            <div className="flex-1"></div>
                            <div className="w-20"></div>
                            <div className="w-24"></div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => addPhoneNumber(member.id)}
                                className="flex items-center gap-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                              >
                                <Plus className="h-3 w-3" />
                                Add Phone
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Role Information */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h5 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-purple-600" />
                      Role & Position
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Personnel Type *
                        </label>
                        <select
                          value={member.personnelType || ''}
                          onChange={(e) => {
                            const selectedValue = e.target.value;
                            console.log('Personnel type selected:', selectedValue);
                            updatePersonnelMember(member.id, 'personnelType', selectedValue);
                            if (selectedValue !== 'Vendor') {
                              updatePersonnelMember(member.id, 'vendorSubType', '');
                            }
                          }}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 bg-white appearance-none"
                          style={{ minHeight: '40px', cursor: 'pointer' }}
                          required
                        >
                          <option value="">Select personnel type</option>
                          {personnelTypes.map((type, index) => (
                            <option key={`${type}-${index}`} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Vendor Specialty {member.personnelType === 'Vendor' ? '*' : '(if applicable)'}
                        </label>
                        <select
                          value={member.vendorSubType || ''}
                          onChange={(e) => {
                            const selectedValue = e.target.value;
                            console.log('Vendor specialty selected:', selectedValue);
                            updatePersonnelMember(member.id, 'vendorSubType', selectedValue);
                          }}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 bg-white appearance-none"
                          style={{ minHeight: '40px', cursor: 'pointer' }}
                          required={member.personnelType === 'Vendor'}
                          disabled={!member.personnelType || member.personnelType === ''}
                        >
                          <option value="">Select vendor specialty</option>
                          {vendorSubTypes.map((subType, index) => (
                            <option key={`${subType}-${index}`} value={subType}>
                              {subType}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Job Title
                        </label>
                        <Input
                          value={member.title}
                          onChange={(e) => updatePersonnelMember(member.id, 'title', e.target.value)}
                          placeholder="Senior Adjuster, Claims Manager, etc."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Department
                        </label>
                        <Input
                          value={member.department}
                          onChange={(e) => updatePersonnelMember(member.id, 'department', e.target.value)}
                          placeholder="Claims, Field Operations, etc."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Licenses Section */}
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium text-gray-800 flex items-center gap-2">
                        <Award className="h-4 w-4 text-orange-600" />
                        Professional Licenses & Certifications
                      </h5>
                      <Button
                        onClick={() => addLicense(member.id)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        Add License
                      </Button>
                    </div>

                    {member.licenses.length === 0 ? (
                      <p className="text-sm text-gray-600 italic">
                        No licenses added. Click "Add License" to add professional licenses or certifications.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {member.licenses.map((license, licenseIndex) => (
                          <div key={license.id} className="bg-white p-3 rounded border">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">
                                License #{licenseIndex + 1}
                              </span>
                              <Button
                                onClick={() => removeLicense(member.id, license.id)}
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  License Type
                                </label>
                                <select
                                  value={license.licenseType}
                                  onChange={(e) => updateLicense(member.id, license.id, 'licenseType', e.target.value)}
                                  className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500"
                                >
                                  <option value="">Select type</option>
                                  {licenseTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  License Number
                                </label>
                                <Input
                                  value={license.licenseNumber}
                                  onChange={(e) => updateLicense(member.id, license.id, 'licenseNumber', e.target.value)}
                                  placeholder="License number"
                                  className="text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  State
                                </label>
                                <select
                                  value={license.licenseState}
                                  onChange={(e) => updateLicense(member.id, license.id, 'licenseState', e.target.value)}
                                  className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500"
                                >
                                  <option value="">Select state</option>
                                  {usStates.map(state => (
                                    <option key={state} value={state}>{state}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Additional Notes */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h5 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-green-600" />
                      Additional Information
                    </h5>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes & Special Instructions
                      </label>
                      <textarea
                        value={member.notes}
                        onChange={(e) => updatePersonnelMember(member.id, 'notes', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                        rows={3}
                        placeholder="Any additional notes, special instructions, or important details about this personnel member..."
                      />
                    </div>
                  </div>

                  {/* Contact Summary */}
                  {member.firstName && member.lastName && member.phoneNumber && (
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <h6 className="font-medium text-gray-800 text-sm mb-1">Contact Summary:</h6>
                      <p className="text-sm text-gray-700">
                        {member.firstName} {member.lastName}
                        {member.title && ` - ${member.title}`}
                        {member.personnelType && ` (${member.personnelType}${member.vendorSubType ? ` - ${member.vendorSubType}` : ''})`}
                      </p>
                      <p className="text-sm text-gray-600">
                        📞 {combinePhoneWithExtension(member.phoneNumber, member.phoneExtension)}
                        {member.email && ` • ✉️ ${member.email}`}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {/* Add Personnel Button */}
            <div className="text-center py-6">
              <Button
                onClick={addPersonnelMember}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Personnel Member
              </Button>
            </div>

            {/* Footer Information */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-gray-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900">Data Management & Analytics</h4>
                  <p className="text-sm text-gray-700 mt-1">
                    All personnel information is automatically:
                  </p>
                  <ul className="text-sm text-gray-600 mt-2 space-y-1">
                    <li>• Stored in your contacts database with {insurerName} association</li>
                    <li>• Available for pattern analysis across multiple claims</li>
                    <li>• Linked to other claims if the same personnel work on different cases</li>
                    <li>• Used for adjuster performance and insurer relationship tracking</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};