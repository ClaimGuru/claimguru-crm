import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useToast } from '../hooks/useToast';
import { EnhancedAttorneyForm } from '../components/forms/EnhancedAttorneyForm';
import { ArrowLeft, UserPlus } from 'lucide-react';

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

const CreateAttorney: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success: showSuccess, error: showError } = useToast();

  const [formData, setFormData] = useState<AttorneyFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'US',
    bar_number: '',
    law_firm: '',
    practice_areas: [],
    years_experience: 0,
    hourly_rate: 0,
    relationship_type: 'potential',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get current user to get organization_id
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        showError('You must be logged in to create an attorney');
        return;
      }

      // Prepare attorney data for insertion
      const attorneyData = {
        ...formData,
        organization_id: user.user_metadata?.organization_id || '1', // Default fallback
        practice_areas: formData.practice_areas.length > 0 ? formData.practice_areas : null
      };

      const { data, error } = await supabase
        .from('rolodex_attorneys')
        .insert([attorneyData])
        .select();

      if (error) {
        console.error('Error creating attorney:', error);
        showError(`Failed to create attorney: ${error.message}`);
        return;
      }

      showSuccess('Attorney created successfully!');
      navigate('/crm'); // Navigate back to CRM main page
    } catch (err) {
      console.error('Unexpected error:', err);
      showError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof AttorneyFormData, value: any) => {
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
            <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-lg mr-4">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Attorney</h1>
              <p className="text-gray-600 mt-1">
                Add a new attorney to your legal network
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              <EnhancedAttorneyForm
                formData={formData}
                onChange={handleInputChange}
                isSubmitting={isSubmitting}
              />
              
              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate('/crm')}
                  className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Creating...' : 'Create Attorney'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAttorney;