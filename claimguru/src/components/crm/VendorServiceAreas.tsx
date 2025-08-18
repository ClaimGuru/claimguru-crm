/**
 * VENDOR SERVICE AREAS COMPONENT
 * 
 * Manage vendor service areas, travel charges, response times,
 * and geographic coverage
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { 
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Clock,
  DollarSign,
  Target,
  Star,
  Search,
  Save,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface VendorServiceAreasProps {
  vendor: any;
  onBack: () => void;
}

interface ServiceArea {
  id: string;
  name: string;
  area_type: string;
  area_data: any;
}

interface VendorServiceArea {
  id: string;
  vendor_id: string;
  service_area_id: string;
  travel_charge?: number;
  response_time_hours?: number;
  is_primary_area: boolean;
  service_areas: ServiceArea;
}

interface ServiceAreaAssignment {
  service_area_id: string;
  travel_charge: number;
  response_time_hours: number;
  is_primary_area: boolean;
}

export function VendorServiceAreas({ vendor, onBack }: VendorServiceAreasProps) {
  const { userProfile } = useAuth();
  const [vendorServiceAreas, setVendorServiceAreas] = useState<VendorServiceArea[]>([]);
  const [availableAreas, setAvailableAreas] = useState<ServiceArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingArea, setEditingArea] = useState<VendorServiceArea | null>(null);
  const [formData, setFormData] = useState<ServiceAreaAssignment>({
    service_area_id: '',
    travel_charge: 0,
    response_time_hours: 24,
    is_primary_area: false
  });

  useEffect(() => {
    loadServiceAreas();
    loadAvailableAreas();
  }, [vendor.id]);

  const loadServiceAreas = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vendor_service_areas')
        .select(`
          *,
          service_areas!inner(
            id, name, area_type, area_data
          )
        `)
        .eq('vendor_id', vendor.id);

      if (error) throw error;
      setVendorServiceAreas(data || []);
    } catch (error) {
      console.error('Error loading vendor service areas:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableAreas = async () => {
    if (!userProfile?.organization_id) return;

    try {
      const { data, error } = await supabase
        .from('service_areas')
        .select('*')
        .eq('organization_id', userProfile.organization_id)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setAvailableAreas(data || []);
    } catch (error) {
      console.error('Error loading available service areas:', error);
    }
  };

  const handleAddServiceArea = () => {
    setEditingArea(null);
    setFormData({
      service_area_id: '',
      travel_charge: 0,
      response_time_hours: 24,
      is_primary_area: false
    });
    setShowAddForm(true);
  };

  const handleEditServiceArea = (area: VendorServiceArea) => {
    setEditingArea(area);
    setFormData({
      service_area_id: area.service_area_id,
      travel_charge: area.travel_charge || 0,
      response_time_hours: area.response_time_hours || 24,
      is_primary_area: area.is_primary_area
    });
    setShowAddForm(true);
  };

  const handleSaveServiceArea = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingArea) {
        // Update existing service area assignment
        const { error } = await supabase
          .from('vendor_service_areas')
          .update({
            travel_charge: formData.travel_charge,
            response_time_hours: formData.response_time_hours,
            is_primary_area: formData.is_primary_area
          })
          .eq('id', editingArea.id);

        if (error) throw error;
      } else {
        // Create new service area assignment
        const { error } = await supabase
          .from('vendor_service_areas')
          .insert({
            vendor_id: vendor.id,
            organization_id: userProfile?.organization_id,
            service_area_id: formData.service_area_id,
            travel_charge: formData.travel_charge,
            response_time_hours: formData.response_time_hours,
            is_primary_area: formData.is_primary_area
          });

        if (error) throw error;
      }

      await loadServiceAreas();
      setShowAddForm(false);
      setEditingArea(null);
    } catch (error) {
      console.error('Error saving service area:', error);
    }
  };

  const handleDeleteServiceArea = async (areaId: string) => {
    if (!confirm('Are you sure you want to remove this service area?')) return;

    try {
      const { error } = await supabase
        .from('vendor_service_areas')
        .delete()
        .eq('id', areaId);

      if (error) throw error;
      await loadServiceAreas();
    } catch (error) {
      console.error('Error deleting service area:', error);
    }
  };

  const getAreaDescription = (area: ServiceArea) => {
    switch (area.area_type) {
      case 'city':
        return `City: ${area.area_data.city}, ${area.area_data.state}`;
      case 'county':
        return `County: ${area.area_data.county}, ${area.area_data.state}`;
      case 'state':
        return `State: ${area.area_data.state}`;
      case 'zip_code':
        return `ZIP: ${area.area_data.zip_codes?.join(', ') || 'Multiple ZIP codes'}`;
      case 'radius':
        return `${area.area_data.radius_miles} mile radius from ${area.area_data.center?.lat}, ${area.area_data.center?.lng}`;
      default:
        return area.area_type;
    }
  };

  const getAssignedAreaIds = () => vendorServiceAreas.map(vsa => vsa.service_area_id);
  const unassignedAreas = availableAreas.filter(area => !getAssignedAreaIds().includes(area.id));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  if (showAddForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button onClick={() => setShowAddForm(false)} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-bold text-gray-900">
            {editingArea ? 'Edit Service Area' : 'Add Service Area'}
          </h2>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSaveServiceArea} className="space-y-6">
              {!editingArea && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Area *
                  </label>
                  <select
                    value={formData.service_area_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, service_area_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a service area...</option>
                    {unassignedAreas.map(area => (
                      <option key={area.id} value={area.id}>
                        {area.name} ({getAreaDescription(area)})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Travel Charge ($)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.travel_charge}
                      onChange={(e) => setFormData(prev => ({ ...prev, travel_charge: parseFloat(e.target.value) || 0 }))}
                      className="pl-10"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Response Time (Hours)
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="number"
                      min="1"
                      value={formData.response_time_hours}
                      onChange={(e) => setFormData(prev => ({ ...prev, response_time_hours: parseInt(e.target.value) || 24 }))}
                      className="pl-10"
                      placeholder="24"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.is_primary_area}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_primary_area: e.target.checked }))}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">Primary service area</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Primary areas are prioritized and may have reduced travel charges
                </p>
              </div>
              
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  {editingArea ? 'Update' : 'Add'} Service Area
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button onClick={onBack} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Service Areas</h1>
            <p className="text-gray-600">{vendor.company_name}</p>
          </div>
        </div>
        
        <Button onClick={handleAddServiceArea} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Service Area
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Areas</p>
                <p className="text-2xl font-bold text-gray-900">{vendorServiceAreas.length}</p>
              </div>
              <Target className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Primary Areas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {vendorServiceAreas.filter(vsa => vsa.is_primary_area).length}
                </p>
              </div>
              <Star className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Response</p>
                <p className="text-2xl font-bold text-gray-900">
                  {vendorServiceAreas.length > 0 
                    ? Math.round(vendorServiceAreas.reduce((sum, vsa) => sum + (vsa.response_time_hours || 0), 0) / vendorServiceAreas.length)
                    : 0}h
                </p>
              </div>
              <Clock className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Travel Charge</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${vendorServiceAreas.length > 0 
                    ? Math.round(vendorServiceAreas.reduce((sum, vsa) => sum + (vsa.travel_charge || 0), 0) / vendorServiceAreas.length)
                    : 0}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Areas List */}
      {vendorServiceAreas.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {vendorServiceAreas.map(vsa => (
            <Card key={vsa.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {vsa.service_areas.name}
                      </h3>
                      {vsa.is_primary_area && (
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 capitalize">
                      {getAreaDescription(vsa.service_areas)}
                    </p>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      onClick={() => handleEditServiceArea(vsa)}
                      variant="outline"
                      size="sm"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      onClick={() => handleDeleteServiceArea(vsa.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Response Time</p>
                      <p className="font-medium">{vsa.response_time_hours || 'N/A'} hours</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Travel Charge</p>
                      <p className="font-medium">
                        {vsa.travel_charge ? `$${vsa.travel_charge.toFixed(2)}` : 'No charge'}
                      </p>
                    </div>
                  </div>
                </div>
                
                {vsa.is_primary_area && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-yellow-700">Primary Service Area</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No service areas assigned</h3>
            <p className="text-gray-600 mb-4">
              Define the geographic areas this vendor can serve
            </p>
            <Button onClick={handleAddServiceArea}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Service Area
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}