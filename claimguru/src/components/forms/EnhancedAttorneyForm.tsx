import React from 'react';
import { User, Mail, Phone, MapPin, Building, Scale, Clock, DollarSign, Users, FileText } from 'lucide-react';

interface AttorneyFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  bar_number: string;
  law_firm: string;
  practice_areas: string[];
  years_experience: number;
  hourly_rate: number;
  relationship_type: 'partner' | 'preferred' | 'occasional' | 'potential';
  notes: string;
}

interface EnhancedAttorneyFormProps {
  formData: AttorneyFormData;
  onChange: (field: keyof AttorneyFormData, value: any) => void;
  isSubmitting: boolean;
}

const PRACTICE_AREAS = [
  'Personal Injury',
  'Workers Compensation',
  'Medical Malpractice',
  'Product Liability',
  'Insurance Defense',
  'Civil Litigation',
  'Employment Law',
  'Real Estate Law',
  'Corporate Law',
  'Family Law',
  'Criminal Defense',
  'Immigration Law',
  'Bankruptcy Law',
  'Estate Planning',
  'Intellectual Property',
  'Environmental Law',
  'Tax Law',
  'Securities Law'
];

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const RELATIONSHIP_TYPES = [
  { value: 'partner', label: 'Partner', description: 'Strategic partner with ongoing collaboration' },
  { value: 'preferred', label: 'Preferred', description: 'Trusted attorney with priority referrals' },
  { value: 'occasional', label: 'Occasional', description: 'Occasional referrals based on case type' },
  { value: 'potential', label: 'Potential', description: 'Prospective attorney for future referrals' }
];

export const EnhancedAttorneyForm: React.FC<EnhancedAttorneyFormProps> = ({
  formData,
  onChange,
  isSubmitting
}) => {
  const handlePracticeAreaChange = (area: string, checked: boolean) => {
    const currentAreas = formData.practice_areas || [];
    if (checked) {
      onChange('practice_areas', [...currentAreas, area]);
    } else {
      onChange('practice_areas', currentAreas.filter(a => a !== area));
    }
  };

  return (
    <div className="space-y-8">
      {/* Personal Information */}
      <div>
        <div className="flex items-center mb-4">
          <User className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name *
            </label>
            <input
              type="text"
              value={formData.first_name}
              onChange={(e) => onChange('first_name', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              required
              disabled={isSubmitting}
              placeholder="Enter first name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              value={formData.last_name}
              onChange={(e) => onChange('last_name', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              required
              disabled={isSubmitting}
              placeholder="Enter last name"
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div>
        <div className="flex items-center mb-4">
          <Mail className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="h-4 w-4 inline mr-1" />
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => onChange('email', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              required
              disabled={isSubmitting}
              placeholder="attorney@lawfirm.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="h-4 w-4 inline mr-1" />
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => onChange('phone', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              disabled={isSubmitting}
              placeholder="(555) 123-4567"
            />
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div>
        <div className="flex items-center mb-4">
          <MapPin className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Address</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address Line 1
            </label>
            <input
              type="text"
              value={formData.address_line1}
              onChange={(e) => onChange('address_line1', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              disabled={isSubmitting}
              placeholder="123 Main Street"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address Line 2
            </label>
            <input
              type="text"
              value={formData.address_line2}
              onChange={(e) => onChange('address_line2', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              disabled={isSubmitting}
              placeholder="Suite 100 (optional)"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => onChange('city', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                disabled={isSubmitting}
                placeholder="City"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <select
                value={formData.state}
                onChange={(e) => onChange('state', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                disabled={isSubmitting}
              >
                <option value="">Select State</option>
                {US_STATES.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ZIP Code
              </label>
              <input
                type="text"
                value={formData.zip_code}
                onChange={(e) => onChange('zip_code', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                disabled={isSubmitting}
                placeholder="12345"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Professional Information */}
      <div>
        <div className="flex items-center mb-4">
          <Scale className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Professional Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building className="h-4 w-4 inline mr-1" />
              Law Firm
            </label>
            <input
              type="text"
              value={formData.law_firm}
              onChange={(e) => onChange('law_firm', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              disabled={isSubmitting}
              placeholder="Smith & Associates Law Firm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Scale className="h-4 w-4 inline mr-1" />
              Bar Number
            </label>
            <input
              type="text"
              value={formData.bar_number}
              onChange={(e) => onChange('bar_number', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              disabled={isSubmitting}
              placeholder="123456"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="h-4 w-4 inline mr-1" />
              Years of Experience
            </label>
            <input
              type="number"
              value={formData.years_experience}
              onChange={(e) => onChange('years_experience', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              disabled={isSubmitting}
              min="0"
              max="70"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="h-4 w-4 inline mr-1" />
              Hourly Rate ($)
            </label>
            <input
              type="number"
              value={formData.hourly_rate}
              onChange={(e) => onChange('hourly_rate', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              disabled={isSubmitting}
              min="0"
              step="0.01"
              placeholder="350.00"
            />
          </div>
        </div>
      </div>

      {/* Practice Areas */}
      <div>
        <div className="flex items-center mb-4">
          <Scale className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Practice Areas</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {PRACTICE_AREAS.map(area => (
            <label key={area} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.practice_areas?.includes(area) || false}
                onChange={(e) => handlePracticeAreaChange(area, e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={isSubmitting}
              />
              <span className="text-sm text-gray-700">{area}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Relationship & Notes */}
      <div>
        <div className="flex items-center mb-4">
          <Users className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Relationship & Notes</h3>
        </div>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Relationship Type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {RELATIONSHIP_TYPES.map(type => (
                <label key={type.value} className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="relationship_type"
                    value={type.value}
                    checked={formData.relationship_type === type.value}
                    onChange={(e) => onChange('relationship_type', e.target.value as any)}
                    className="mt-1 text-blue-600 focus:ring-blue-500"
                    disabled={isSubmitting}
                  />
                  <div>
                    <div className="font-medium text-gray-900">{type.label}</div>
                    <div className="text-sm text-gray-500">{type.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="h-4 w-4 inline mr-1" />
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => onChange('notes', e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              disabled={isSubmitting}
              placeholder="Add any additional notes about this attorney, such as specializations, referral preferences, or communication notes..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};