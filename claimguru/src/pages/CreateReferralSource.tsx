import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useToast } from '../hooks/useToast';
import { EnhancedReferralSourceForm } from '../components/forms/EnhancedReferralSourceForm';
import { ArrowLeft, Users } from 'lucide-react';

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

const CreateReferralSource: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success: showSuccess, error: showError } = useToast();

  const [formData, setFormData] = useState<ReferralSourceFormData>({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'US',
    source_type: 'other',
    industry: '',
    company_size: 'small',
    website: '',
    relationship_status: 'potential',
    commission_rate: 0,
    payment_terms: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get current user to get organization_id
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        showError('You must be logged in to create a referral source');
        return;
      }

      // Prepare referral source data for insertion
      const referralSourceData = {
        ...formData,
        organization_id: user.user_metadata?.organization_id || '1' // Default fallback
      };

      const { data, error } = await supabase
        .from('rolodex_referral_sources')
        .insert([referralSourceData])
        .select();

      if (error) {
        console.error('Error creating referral source:', error);
        showError(`Failed to create referral source: ${error.message}`);
        return;
      }

      showSuccess('Referral source created successfully!');
      navigate('/crm'); // Navigate back to CRM main page
    } catch (err) {
      console.error('Unexpected error:', err);
      showError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ReferralSourceFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/crm')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to CRM
          </button>
          
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-600 rounded-lg mr-4">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Referral Source</h1>
              <p className="text-gray-600 mt-1">
                Add a new referral source to your professional network
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              <EnhancedReferralSourceForm
                formData={formData}
                onChange={handleInputChange}
                isSubmitting={isSubmitting}
              />
              
              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate('/crm')}
                  className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Creating...' : 'Create Referral Source'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateReferralSource;