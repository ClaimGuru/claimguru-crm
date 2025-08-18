/**
 * ENHANCED VENDOR FORM COMPONENT
 * 
 * Comprehensive vendor form with categorization, specialties, equipment,
 * service areas, and performance tracking setup
 */

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { 
  Building, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Globe,
  FileText,
  Star,
  Tag,
  Settings,
  Plus,
  X,
  DollarSign,
  Calendar,
  Award
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface VendorCategory {
  id: string;
  name: string;
  code: string;
  description: string;
}

interface VendorSpecialty {
  id: string;
  name: string;
  code: string;
  description: string;
}

interface ServiceArea {
  id: string;
  name: string;
  area_type: string;
  area_data: any;
}

interface EnhancedVendorFormProps {
  vendor?: any;
  categories: VendorCategory[];
  onSave: (data: any) => void;
  onCancel: () => void;
}

export function EnhancedVendorForm({ vendor, categories, onSave, onCancel }: EnhancedVendorFormProps) {
  const { userProfile } = useAuth();
  const [formData, setFormData] = useState({
    // Basic Information
    company_name: '',
    company_type: '',
    contact_first_name: '',
    contact_last_name: '',
    email: '',
    phone_1: '',
    phone_2: '',
    website: '',
    
    // Address
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'United States',
    
    // Business Details
    license_number: '',
    insurance_info: '',
    w9_on_file: false,
    preferred_vendor: false,
    rating: 0,
    
    // Enhanced Features
    specialties: [] as string[],
    service_areas: [] as string[],
    notes: '',
    is_active: true,
    can_file_claim_via_email: false
  });

  const [specialties, setSpecialties] = useState<VendorSpecialty[]>([]);
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([]);
  const [newSpecialty, setNewSpecialty] = useState('');
  const [selectedServiceAreas, setSelectedServiceAreas] = useState<string[]>([]);

  useEffect(() => {
    if (vendor) {
      setFormData({
        company_name: vendor.company_name || '',
        company_type: vendor.company_type || '',
        contact_first_name: vendor.contact_first_name || '',
        contact_last_name: vendor.contact_last_name || '',
        email: vendor.email || '',
        phone_1: vendor.phone_1 || '',
        phone_2: vendor.phone_2 || '',
        website: vendor.website || '',
        address_line_1: vendor.address_line_1 || '',
        address_line_2: vendor.address_line_2 || '',
        city: vendor.city || '',
        state: vendor.state || '',
        zip_code: vendor.zip_code || '',
        country: vendor.country || 'United States',
        license_number: vendor.license_number || '',
        insurance_info: vendor.insurance_info || '',
        w9_on_file: vendor.w9_on_file || false,
        preferred_vendor: vendor.preferred_vendor || false,
        rating: vendor.rating || 0,
        specialties: vendor.specialties || [],
        service_areas: vendor.service_areas || [],
        notes: vendor.notes || '',
        is_active: vendor.is_active !== false,
        can_file_claim_via_email: vendor.can_file_claim_via_email || false
      });
      setSelectedServiceAreas(vendor.service_areas || []);
    }
  }, [vendor]);

  useEffect(() => {
    loadSpecialties();
    loadServiceAreas();
  }, [formData.company_type, userProfile?.organization_id]);

  const loadSpecialties = async () => {
    if (!formData.company_type || !userProfile?.organization_id) return;

    try {
      const { data, error } = await supabase
        .from('vendor_specialties')
        .select(`
          id, name, code, description,
          vendor_categories!inner(code)
        `)
        .eq('organization_id', userProfile.organization_id)
        .eq('vendor_categories.code', formData.company_type)
        .eq('is_active', true);

      if (error) throw error;
      setSpecialties(data || []);
    } catch (error) {
      console.error('Error loading specialties:', error);
    }
  };

  const loadServiceAreas = async () => {
    if (!userProfile?.organization_id) return;

    try {
      const { data, error } = await supabase
        .from('service_areas')
        .select('*')
        .eq('organization_id', userProfile.organization_id)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setServiceAreas(data || []);
    } catch (error) {
      console.error('Error loading service areas:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      service_areas: selectedServiceAreas
    });
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSpecialty = () => {
    if (newSpecialty.trim() && !formData.specialties.includes(newSpecialty.trim())) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty.trim()]
      }));
      setNewSpecialty('');
    }
  };

  const removeSpecialty = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter(s => s !== specialty)
    }));
  };

  const toggleServiceArea = (areaId: string) => {
    setSelectedServiceAreas(prev => 
      prev.includes(areaId) 
        ? prev.filter(id => id !== areaId)
        : [...prev, areaId]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          {vendor ? 'Edit Vendor' : 'Add New Vendor'}
        </h2>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {vendor ? 'Update Vendor' : 'Create Vendor'}
          </Button>
        </div>
      </div>

      {/* Company Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Building className="h-5 w-5" />
          Company Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name *
            </label>
            <Input
              value={formData.company_name}
              onChange={(e) => handleChange('company_name', e.target.value)}
              placeholder="Enter company name"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              value={formData.company_type}
              onChange={(e) => handleChange('company_type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            >
              <option value="">Select category...</option>
              {categories.map(category => (
                <option key={category.id} value={category.code}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="url"
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="https://company-website.com"
                className="pl-10"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              License Number
            </label>
            <Input
              value={formData.license_number}
              onChange={(e) => handleChange('license_number', e.target.value)}
              placeholder="Enter license number"
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="h-5 w-5" />
          Contact Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name *
            </label>
            <Input
              value={formData.contact_first_name}
              onChange={(e) => handleChange('contact_first_name', e.target.value)}
              placeholder="Enter first name"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name *
            </label>
            <Input
              value={formData.contact_last_name}
              onChange={(e) => handleChange('contact_last_name', e.target.value)}
              placeholder="Enter last name"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Phone *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="tel"
                value={formData.phone_1}
                onChange={(e) => handleChange('phone_1', e.target.value)}
                placeholder="(555) 123-4567"
                className="pl-10"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secondary Phone
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="tel"
                value={formData.phone_2}
                onChange={(e) => handleChange('phone_2', e.target.value)}
                placeholder="(555) 123-4567"
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="contact@company.com"
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Address Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address Line 1
            </label>
            <Input
              value={formData.address_line_1}
              onChange={(e) => handleChange('address_line_1', e.target.value)}
              placeholder="Street address"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address Line 2
            </label>
            <Input
              value={formData.address_line_2}
              onChange={(e) => handleChange('address_line_2', e.target.value)}
              placeholder="Apartment, suite, etc."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <Input
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder="City"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State
            </label>
            <Input
              value={formData.state}
              onChange={(e) => handleChange('state', e.target.value)}
              placeholder="State"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ZIP Code
            </label>
            <Input
              value={formData.zip_code}
              onChange={(e) => handleChange('zip_code', e.target.value)}
              placeholder="12345"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country
            </label>
            <Input
              value={formData.country}
              onChange={(e) => handleChange('country', e.target.value)}
              placeholder="United States"
            />
          </div>
        </div>
      </div>

      {/* Specialties */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Tag className="h-5 w-5" />
          Specialties
        </h3>
        
        {specialties.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Specialties
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {specialties.map(specialty => (
                <label key={specialty.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.specialties.includes(specialty.name)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData(prev => ({
                          ...prev,
                          specialties: [...prev.specialties, specialty.name]
                        }));
                      } else {
                        removeSpecialty(specialty.name);
                      }
                    }}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">{specialty.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex gap-2">
          <Input
            value={newSpecialty}
            onChange={(e) => setNewSpecialty(e.target.value)}
            placeholder="Add custom specialty"
            className="flex-1"
          />
          <Button type="button" onClick={addSpecialty} variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {formData.specialties.length > 0 && (
          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              {formData.specialties.map((specialty, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800"
                >
                  {specialty}
                  <button
                    type="button"
                    onClick={() => removeSpecialty(specialty)}
                    className="ml-2 text-indigo-600 hover:text-indigo-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Service Areas */}
      {serviceAreas.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Service Areas
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {serviceAreas.map(area => (
              <label key={area.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedServiceAreas.includes(area.id)}
                  onChange={() => toggleServiceArea(area.id)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">{area.name}</span>
                <span className="text-xs text-gray-500 capitalize">({area.area_type})</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Settings and Preferences */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Settings & Preferences
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.preferred_vendor}
                onChange={(e) => handleChange('preferred_vendor', e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">Preferred vendor</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.w9_on_file}
                onChange={(e) => handleChange('w9_on_file', e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">W9 on file</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.can_file_claim_via_email}
                onChange={(e) => handleChange('can_file_claim_via_email', e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">Can file claims via email</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => handleChange('is_active', e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">Active vendor</span>
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating (1-5)
            </label>
            <select
              value={formData.rating}
              onChange={(e) => handleChange('rating', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value={0}>No rating</option>
              <option value={1}>1 Star</option>
              <option value={2}>2 Stars</option>
              <option value={3}>3 Stars</option>
              <option value={4}>4 Stars</option>
              <option value={5}>5 Stars</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Notes & Additional Information
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Insurance Information
            </label>
            <textarea
              value={formData.insurance_info}
              onChange={(e) => handleChange('insurance_info', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Insurance details, policy numbers, coverage amounts..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              General Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Additional notes about this vendor..."
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {vendor ? 'Update Vendor' : 'Create Vendor'}
        </Button>
      </div>
    </form>
  );
}