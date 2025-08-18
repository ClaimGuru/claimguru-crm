/**
 * EDIT VENDOR PAGE
 * 
 * Dedicated page for editing existing vendors in the CRM system
 * Uses the comprehensive EnhancedVendorForm component
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ArrowLeft, Building, Edit } from 'lucide-react';
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

interface Vendor {
  id: string;
  organization_id: string;
  company_type: string;
  company_name: string;
  contact_first_name: string;
  contact_last_name: string;
  email?: string;
  phone_1?: string;
  phone_2?: string;
  website?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  license_number?: string;
  insurance_info?: string;
  w9_on_file?: boolean;
  preferred_vendor?: boolean;
  rating?: number;
  specialties?: string[];
  service_areas?: string[];
  notes?: string;
  is_active?: boolean;
  can_file_claim_via_email?: boolean;
  created_at: string;
  updated_at: string;
}

export function EditVendor() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { userProfile } = useAuth();
  const { success, error } = useToast();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [categories, setCategories] = useState<VendorCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id && userProfile?.organization_id) {
      loadVendor();
      loadCategories();
    }
  }, [id, userProfile?.organization_id]);

  const loadVendor = async () => {
    if (!id || !userProfile?.organization_id) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', id)
        .eq('organization_id', userProfile.organization_id)
        .maybeSingle();

      if (fetchError) throw fetchError;
      
      if (!data) {
        error('Vendor not found');
        navigate('/vendors');
        return;
      }

      setVendor(data);
    } catch (err) {
      console.error('Error loading vendor:', err);
      error('Error loading vendor details');
      navigate('/vendors');
    }
  };

  const loadCategories = async () => {
    if (!userProfile?.organization_id) return;

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
    if (!userProfile?.organization_id || !id) {
      error('Unable to update vendor');
      return;
    }

    setSaving(true);
    try {
      // Validate required fields
      if (!vendorData.company_name || !vendorData.contact_first_name || !vendorData.contact_last_name) {
        error('Please fill in all required fields');
        return;
      }

      // Update existing vendor
      const { data, error: updateError } = await supabase
        .from('vendors')
        .update({
          ...vendorData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('organization_id', userProfile.organization_id)
        .select()
        .single();

      if (updateError) throw updateError;

      success('Vendor updated successfully');
      
      // Navigate back to vendors list
      navigate('/vendors');
    } catch (err) {
      console.error('Error updating vendor:', err);
      error('Error updating vendor. Please try again.');
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

  if (!vendor) {
    return (
      <div className="p-6 text-center">
        <div className="text-gray-500">Vendor not found</div>
        <Button onClick={handleCancel} className="mt-4">
          Back to Vendors
        </Button>
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
          <div className="p-2 bg-green-100 rounded-lg">
            <Edit className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Vendor</h1>
            <p className="text-gray-600">Update vendor information and settings</p>
          </div>
        </div>
      </div>

      {/* Vendor Info Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-100 rounded-lg">
              <Building className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{vendor.company_name}</h3>
              <p className="text-gray-600">
                {vendor.contact_first_name} {vendor.contact_last_name}
                {vendor.company_type && ` • ${vendor.company_type}`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Container */}
      <Card>
        <CardContent className="p-6">
          {saving && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <LoadingSpinner className="h-5 w-5" />
                <span className="text-blue-700">Updating vendor...</span>
              </div>
            </div>
          )}
          
          <EnhancedVendorForm
            vendor={vendor}
            categories={categories}
            onSave={handleSaveVendor}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Vendor Update Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Data Integrity</h4>
              <ul className="space-y-1">
                <li>• Verify contact information is current</li>
                <li>• Update licensing and insurance details</li>
                <li>• Confirm service areas are accurate</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Performance Tracking</h4>
              <ul className="space-y-1">
                <li>• Update vendor status based on recent performance</li>
                <li>• Adjust preferred vendor status as needed</li>
                <li>• Review and update specialties</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default EditVendor;