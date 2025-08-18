/**
 * CREATE VENDOR PAGE
 * 
 * Dedicated page for creating new vendors in the CRM system
 * Uses the comprehensive EnhancedVendorForm component
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ArrowLeft, Building } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { EnhancedVendorForm } from '../components/crm/EnhancedVendorForm';
import { useToast } from '../hooks/useToast';

interface VendorCategory {
  id: string;
  name: string;
  code: string;
  description: string;
}

export function CreateVendor() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { success, error } = useToast();
  const [categories, setCategories] = useState<VendorCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCategories();
  }, [userProfile?.organization_id]);

  const loadCategories = async () => {
    if (!userProfile?.organization_id) return;

    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('vendor_categories')
        .select('*')
        .eq('organization_id', userProfile.organization_id)
        .eq('is_active', true)
        .order('name');

      if (fetchError) throw fetchError;
      setCategories(data || []);
    } catch (err) {
      console.error('Error loading vendor categories:', err);
      error('Error loading vendor categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveVendor = async (vendorData: any) => {
    if (!userProfile?.organization_id) {
      error('Organization not found');
      return;
    }

    setSaving(true);
    try {
      // Validate required fields
      if (!vendorData.company_name || !vendorData.contact_first_name || !vendorData.contact_last_name) {
        error('Please fill in all required fields');
        return;
      }

      // Create new vendor
      const { data, error: insertError } = await supabase
        .from('vendors')
        .insert({
          ...vendorData,
          organization_id: userProfile.organization_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) throw insertError;

      success('Vendor created successfully');
      
      // Navigate back to vendors list or to the created vendor's detail page
      navigate('/vendors');
    } catch (err) {
      console.error('Error creating vendor:', err);
      error('Error creating vendor. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/vendors');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCancel}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Vendors
        </Button>
        
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Building className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Vendor</h1>
            <p className="text-gray-600">Add a new vendor to your CRM system</p>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <Card>
        <CardContent className="p-6">
          {saving && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <LoadingSpinner className="h-5 w-5" />
                <span className="text-blue-700">Creating vendor...</span>
              </div>
            </div>
          )}
          
          <EnhancedVendorForm
            vendor={null} // No existing vendor for creation
            categories={categories}
            onSave={handleSaveVendor}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tips for Adding Vendors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Required Information</h4>
              <ul className="space-y-1">
                <li>• Company name and category</li>
                <li>• Primary contact information</li>
                <li>• Phone number for communication</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Additional Details</h4>
              <ul className="space-y-1">
                <li>• Add specialties to help with vendor matching</li>
                <li>• Include service areas for location-based assignments</li>
                <li>• Mark as preferred vendor if applicable</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CreateVendor;