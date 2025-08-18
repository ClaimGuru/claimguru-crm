/**
 * ENHANCED VENDOR MANAGEMENT COMPONENT
 * 
 * Comprehensive vendor management with categorization, specialties,
 * performance metrics, equipment tracking, and service area management
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { 
  Plus,
  Search,
  Filter,
  Building,
  Star,
  MapPin,
  Phone,
  Mail,
  BarChart3,
  Settings,
  Edit,
  Eye,
  Trash2,
  Award,
  Wrench,
  Target
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { EnhancedVendorForm } from './EnhancedVendorForm';
import { VendorDetails } from './VendorDetails';
import { VendorPerformanceMetrics } from './VendorPerformanceMetrics';
import { VendorEquipmentManager } from './VendorEquipmentManager';
import { VendorServiceAreas } from './VendorServiceAreas';

interface Vendor {
  id: string;
  organization_id: string;
  company_type: string;
  company_name: string;
  contact_first_name: string;
  contact_last_name: string;
  email: string;
  phone_1: string;
  phone_2?: string;
  website?: string;
  address_line_1?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  specialties?: string[];
  service_areas?: string[];
  rating?: number;
  preferred_vendor: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface VendorCategory {
  id: string;
  name: string;
  code: string;
  description: string;
}

type ViewMode = 'list' | 'form' | 'details' | 'performance' | 'equipment' | 'service_areas';

export function VendorManagement() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [categories, setCategories] = useState<VendorCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showPreferredOnly, setShowPreferredOnly] = useState(false);

  useEffect(() => {
    loadVendors();
    loadCategories();
  }, [userProfile?.organization_id]);

  const loadVendors = async () => {
    if (!userProfile?.organization_id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('organization_id', userProfile.organization_id)
        .order('company_name');

      if (error) throw error;
      setVendors(data || []);
    } catch (error) {
      console.error('Error loading vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    if (!userProfile?.organization_id) return;

    try {
      const { data, error } = await supabase
        .from('vendor_categories')
        .select('*')
        .eq('organization_id', userProfile.organization_id)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading vendor categories:', error);
    }
  };

  const handleCreateVendor = () => {
    navigate('/vendors/new');
  };

  const handleEditVendor = (vendor: Vendor) => {
    navigate(`/vendors/${vendor.id}/edit`);
  };

  const handleViewVendor = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setViewMode('details');
  };

  const handleViewPerformance = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setViewMode('performance');
  };

  const handleViewEquipment = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setViewMode('equipment');
  };

  const handleViewServiceAreas = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setViewMode('service_areas');
  };

  const handleSaveVendor = async (vendorData: any) => {
    try {
      if (selectedVendor) {
        // Update existing vendor
        const { error } = await supabase
          .from('vendors')
          .update({
            ...vendorData,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedVendor.id);

        if (error) throw error;
      } else {
        // Create new vendor
        const { error } = await supabase
          .from('vendors')
          .insert({
            ...vendorData,
            organization_id: userProfile?.organization_id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      await loadVendors();
      setViewMode('list');
      setSelectedVendor(null);
    } catch (error) {
      console.error('Error saving vendor:', error);
    }
  };

  const handleDeleteVendor = async (vendorId: string) => {
    if (!confirm('Are you sure you want to delete this vendor?')) return;

    try {
      const { error } = await supabase
        .from('vendors')
        .delete()
        .eq('id', vendorId);

      if (error) throw error;
      await loadVendors();
    } catch (error) {
      console.error('Error deleting vendor:', error);
    }
  };

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         `${vendor.contact_first_name} ${vendor.contact_last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || vendor.company_type === selectedCategory;
    const matchesPreferred = !showPreferredOnly || vendor.preferred_vendor;
    
    return matchesSearch && matchesCategory && matchesPreferred;
  });

  if (viewMode === 'form') {
    return (
      <EnhancedVendorForm
        vendor={selectedVendor}
        categories={categories}
        onSave={handleSaveVendor}
        onCancel={() => setViewMode('list')}
      />
    );
  }

  if (viewMode === 'details' && selectedVendor) {
    return (
      <VendorDetails
        vendor={selectedVendor}
        onEdit={() => setViewMode('form')}
        onBack={() => setViewMode('list')}
      />
    );
  }

  if (viewMode === 'performance' && selectedVendor) {
    return (
      <VendorPerformanceMetrics
        vendor={selectedVendor}
        onBack={() => setViewMode('list')}
      />
    );
  }

  if (viewMode === 'equipment' && selectedVendor) {
    return (
      <VendorEquipmentManager
        vendor={selectedVendor}
        onBack={() => setViewMode('list')}
      />
    );
  }

  if (viewMode === 'service_areas' && selectedVendor) {
    return (
      <VendorServiceAreas
        vendor={selectedVendor}
        onBack={() => setViewMode('list')}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Vendor Management</h2>
          <p className="text-gray-600">Manage vendor relationships, performance, and capabilities</p>
        </div>
        <Button onClick={handleCreateVendor} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Vendor
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search vendors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.code}>
                  {category.name}
                </option>
              ))}
            </select>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showPreferredOnly}
                onChange={(e) => setShowPreferredOnly(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">Preferred vendors only</span>
            </label>

            <div className="text-sm text-gray-600">
              {filteredVendors.length} vendor{filteredVendors.length !== 1 ? 's' : ''}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vendor List */}
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner className="h-8 w-8" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredVendors.map(vendor => (
            <Card key={vendor.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {vendor.company_name}
                      </h3>
                      {vendor.preferred_vendor && (
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {vendor.contact_first_name} {vendor.contact_last_name}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {vendor.company_type?.replace('_', ' ')}
                    </p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    vendor.is_active ? 'bg-green-400' : 'bg-gray-400'
                  }`} />
                </div>

                <div className="space-y-2 mb-4">
                  {vendor.phone_1 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-3 w-3" />
                      <span>{vendor.phone_1}</span>
                    </div>
                  )}
                  {vendor.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{vendor.email}</span>
                    </div>
                  )}
                  {vendor.city && vendor.state && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-3 w-3" />
                      <span>{vendor.city}, {vendor.state}</span>
                    </div>
                  )}
                </div>

                {vendor.specialties && vendor.specialties.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {vendor.specialties.slice(0, 3).map((specialty, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                        >
                          {specialty}
                        </span>
                      ))}
                      {vendor.specialties.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                          +{vendor.specialties.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {vendor.rating && (
                  <div className="flex items-center gap-1 mb-4">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{vendor.rating.toFixed(1)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    <Button
                      onClick={() => handleViewVendor(vendor)}
                      variant="outline"
                      size="sm"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button
                      onClick={() => handleEditVendor(vendor)}
                      variant="outline"
                      size="sm"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      onClick={() => handleViewPerformance(vendor)}
                      variant="outline"
                      size="sm"
                      title="Performance Metrics"
                    >
                      <BarChart3 className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      onClick={() => handleViewEquipment(vendor)}
                      variant="outline"
                      size="sm"
                      title="Equipment & Capabilities"
                    >
                      <Wrench className="h-3 w-3" />
                    </Button>
                    <Button
                      onClick={() => handleViewServiceAreas(vendor)}
                      variant="outline"
                      size="sm"
                      title="Service Areas"
                    >
                      <Target className="h-3 w-3" />
                    </Button>
                    <Button
                      onClick={() => handleDeleteVendor(vendor.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredVendors.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No vendors found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedCategory !== 'all' || showPreferredOnly
                ? 'No vendors match your search criteria'
                : 'Get started by adding your first vendor'}
            </p>
            {!searchTerm && selectedCategory === 'all' && !showPreferredOnly && (
              <Button onClick={handleCreateVendor}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Vendor
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}