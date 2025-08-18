import React from 'react';
import { Building, Mail, Phone, MapPin, Globe, Users, DollarSign, FileText, TrendingUp } from 'lucide-react';

interface ReferralSourceFormData {
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  source_type: 'medical_provider' | 'legal_professional' | 'insurance_agent' | 'business_partner' | 'individual' | 'other';
  industry: string;
  company_size: 'individual' | 'small' | 'medium' | 'large' | 'enterprise';
  website: string;
  relationship_status: 'active' | 'inactive' | 'potential' | 'terminated';
  commission_rate: number;
  payment_terms: string;
  notes: string;
}

interface EnhancedReferralSourceFormProps {
  formData: ReferralSourceFormData;
  onChange: (field: keyof ReferralSourceFormData, value: any) => void;
  isSubmitting: boolean;
}

const SOURCE_TYPES = [
  { value: 'medical_provider', label: 'Medical Provider', description: 'Doctors, clinics, hospitals' },
  { value: 'legal_professional', label: 'Legal Professional', description: 'Other law firms, attorneys' },
  { value: 'insurance_agent', label: 'Insurance Agent', description: 'Insurance brokers and agents' },
  { value: 'business_partner', label: 'Business Partner', description: 'Strategic business partnerships' },
  { value: 'individual', label: 'Individual', description: 'Individual referral contacts' },
  { value: 'other', label: 'Other', description: 'Other types of referral sources' }
];

const COMPANY_SIZES = [
  { value: 'individual', label: 'Individual', description: 'Single person or freelancer' },
  { value: 'small', label: 'Small (1-50)', description: '1-50 employees' },
  { value: 'medium', label: 'Medium (51-250)', description: '51-250 employees' },
  { value: 'large', label: 'Large (251-1000)', description: '251-1000 employees' },
  { value: 'enterprise', label: 'Enterprise (1000+)', description: '1000+ employees' }
];

const RELATIONSHIP_STATUSES = [
  { value: 'active', label: 'Active', description: 'Currently sending referrals', color: 'text-green-600' },
  { value: 'potential', label: 'Potential', description: 'Prospective referral source', color: 'text-blue-600' },
  { value: 'inactive', label: 'Inactive', description: 'Not currently active', color: 'text-yellow-600' },
  { value: 'terminated', label: 'Terminated', description: 'Relationship ended', color: 'text-red-600' }
];

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export const EnhancedReferralSourceForm: React.FC<EnhancedReferralSourceFormProps> = ({
  formData,
  onChange,
  isSubmitting
}) => {
  return (
    <div className="space-y-8">
      {/* Basic Information */}
      <div>
        <div className="flex items-center mb-4">
          <Building className="h-5 w-5 text-purple-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organization/Source Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => onChange('name', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
              required
              disabled={isSubmitting}
              placeholder="Enter organization or source name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Contact Person
            </label>
            <input
              type="text"
              value={formData.contact_person}
              onChange={(e) => onChange('contact_person', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
              disabled={isSubmitting}
              placeholder="Enter contact person name"
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div>
        <div className="flex items-center mb-4">
          <Mail className="h-5 w-5 text-purple-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="h-4 w-4 inline mr-1" />
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => onChange('email', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
              disabled={isSubmitting}
              placeholder="contact@organization.com"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
              disabled={isSubmitting}
              placeholder="(555) 123-4567"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Globe className="h-4 w-4 inline mr-1" />
              Website
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => onChange('website', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
              disabled={isSubmitting}
              placeholder="https://www.organization.com"
            />
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div>
        <div className="flex items-center mb-4">
          <MapPin className="h-5 w-5 text-purple-600 mr-2" />
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
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                disabled={isSubmitting}
                placeholder="12345"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Business Information */}
      <div>
        <div className="flex items-center mb-4">
          <TrendingUp className="h-5 w-5 text-purple-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Business Information</h3>
        </div>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Source Type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SOURCE_TYPES.map(type => (
                <label key={type.value} className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="source_type"
                    value={type.value}
                    checked={formData.source_type === type.value}
                    onChange={(e) => onChange('source_type', e.target.value as any)}
                    className="mt-1 text-purple-600 focus:ring-purple-500"
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry
              </label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => onChange('industry', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                disabled={isSubmitting}
                placeholder="e.g., Healthcare, Legal Services, Insurance"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Size
              </label>
              <select
                value={formData.company_size}
                onChange={(e) => onChange('company_size', e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                disabled={isSubmitting}
              >
                {COMPANY_SIZES.map(size => (
                  <option key={size.value} value={size.value}>
                    {size.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Relationship & Financial Terms */}
      <div>
        <div className="flex items-center mb-4">
          <DollarSign className="h-5 w-5 text-purple-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Relationship & Financial Terms</h3>
        </div>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Relationship Status
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {RELATIONSHIP_STATUSES.map(status => (
                <label key={status.value} className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="relationship_status"
                    value={status.value}
                    checked={formData.relationship_status === status.value}
                    onChange={(e) => onChange('relationship_status', e.target.value as any)}
                    className="mt-1 text-purple-600 focus:ring-purple-500"
                    disabled={isSubmitting}
                  />
                  <div>
                    <div className={`font-medium ${status.color}`}>{status.label}</div>
                    <div className="text-sm text-gray-500">{status.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commission Rate (%)
              </label>
              <input
                type="number"
                value={formData.commission_rate}
                onChange={(e) => onChange('commission_rate', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                disabled={isSubmitting}
                min="0"
                max="100"
                step="0.1"
                placeholder="10.0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Terms
              </label>
              <input
                type="text"
                value={formData.payment_terms}
                onChange={(e) => onChange('payment_terms', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                disabled={isSubmitting}
                placeholder="e.g., Net 30, Upon settlement"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <div className="flex items-center mb-4">
          <FileText className="h-5 w-5 text-purple-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Notes</h3>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => onChange('notes', e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
            disabled={isSubmitting}
            placeholder="Add any additional notes about this referral source, such as preferred case types, communication preferences, or special arrangements..."
          />
        </div>
      </div>
    </div>
  );
};