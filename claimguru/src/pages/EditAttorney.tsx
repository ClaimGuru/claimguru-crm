import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useToast } from '../hooks/useToast';
import { EnhancedAttorneyForm } from '../components/forms/EnhancedAttorneyForm';
import { ArrowLeft, UserCheck, Loader } from 'lucide-react';

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

const EditAttorney: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success: showSuccess, error: showError } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [attorney, setAttorney] = useState<any>(null);

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

  useEffect(() => {
    const fetchAttorney = async () => {
      if (!id) {
        showError('Attorney ID is required');
        navigate('/crm');
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('rolodex_attorneys')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching attorney:', error);
          showError('Failed to load attorney data');
          navigate('/crm');
          return;
        }

        if (data) {
          setAttorney(data);
          setFormData({
            first_name: data.first_name || '',
            last_name: data.last_name || '',
            email: data.email || '',
            phone: data.phone || '',
            address_line1: data.address_line1 || '',
            address_line2: data.address_line2 || '',
            city: data.city || '',
            state: data.state || '',
            zip_code: data.zip_code || '',
            country: data.country || 'US',
            bar_number: data.bar_number || '',
            law_firm: data.law_firm || '',
            practice_areas: data.practice_areas || [],
            years_experience: data.years_experience || 0,
            hourly_rate: data.hourly_rate || 0,
            relationship_type: data.relationship_type || 'potential',
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

    fetchAttorney();
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!id) {
      showError('Attorney ID is required');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare attorney data for update
      const attorneyData = {
        ...formData,
        practice_areas: formData.practice_areas.length > 0 ? formData.practice_areas : null
      };

      const { data, error } = await supabase
        .from('rolodex_attorneys')
        .update(attorneyData)
        .eq('id', id)
        .select();

      if (error) {
        console.error('Error updating attorney:', error);
        showError(`Failed to update attorney: ${error.message}`);
        return;
      }

      showSuccess('Attorney updated successfully!');
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading attorney data...</p>
        </div>
      </div>
    );
  }

  if (!attorney) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Attorney not found</p>
          <button
            onClick={() => navigate('/crm')}
            className="mt-4 text-blue-600 hover:text-blue-800"
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
            <div className="flex items-center justify-center w-12 h-12 bg-green-600 rounded-lg mr-4">
              <UserCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Edit Attorney: {attorney.first_name} {attorney.last_name}
              </h1>
              <p className="text-gray-600 mt-1">
                Update attorney information and relationship details
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
                  className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Updating...' : 'Update Attorney'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditAttorney;