import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useToast } from '../hooks/useToast';
import { EnhancedReferralSourceForm } from '../components/forms/EnhancedReferralSourceForm';
import { ArrowLeft, Users, Loader } from 'lucide-react';

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

const EditReferralSource: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success: showSuccess, error: showError } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [referralSource, setReferralSource] = useState<any>(null);

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

  useEffect(() => {
    const fetchReferralSource = async () => {
      if (!id) {
        showError('Referral source ID is required');
        navigate('/crm');
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('rolodex_referral_sources')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching referral source:', error);
          showError('Failed to load referral source data');
          navigate('/crm');
          return;
        }

        if (data) {
          setReferralSource(data);
          setFormData({
            name: data.name || '',
            contact_person: data.contact_person || '',
            email: data.email || '',
            phone: data.phone || '',
            address_line1: data.address_line1 || '',
            address_line2: data.address_line2 || '',
            city: data.city || '',
            state: data.state || '',
            zip_code: data.zip_code || '',
            country: data.country || 'US',
            source_type: data.source_type || 'other',
            industry: data.industry || '',
            company_size: data.company_size || 'small',
            website: data.website || '',
            relationship_status: data.relationship_status || 'potential',
            commission_rate: data.commission_rate || 0,
            payment_terms: data.payment_terms || '',
            notes: data.notes || ''
          });
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        showError('An unexpected error occurred');
        navigate('/crm');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReferralSource();
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!id) {
      showError('Referral source ID is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('rolodex_referral_sources')
        .update(formData)
        .eq('id', id)
        .select();

      if (error) {
        console.error('Error updating referral source:', error);
        showError(`Failed to update referral source: ${error.message}`);
        return;
      }

      showSuccess('Referral source updated successfully!');
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading referral source data...</p>
        </div>
      </div>
    );
  }

  if (!referralSource) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Referral source not found</p>
          <button
            onClick={() => navigate('/crm')}
            className="mt-4 text-purple-600 hover:text-purple-800"
          >
            Return to CRM
          </button>
        </div>
      </div>
    );
  }

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
            <div className="flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-lg mr-4">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Edit Referral Source: {referralSource.name}
              </h1>
              <p className="text-gray-600 mt-1">
                Update referral source information and relationship details
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
                  className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Updating...' : 'Update Referral Source'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditReferralSource;