/**
 * VENDOR EQUIPMENT MANAGER COMPONENT
 * 
 * Manage vendor equipment, capabilities, certifications,
 * and maintenance schedules
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
  Wrench,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Award,
  Settings,
  Search,
  Filter
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface VendorEquipmentManagerProps {
  vendor: any;
  onBack: () => void;
}

interface Equipment {
  id: string;
  equipment_type: string;
  equipment_name: string;
  model?: string;
  manufacturer?: string;
  capacity?: string;
  certification_required: boolean;
  certification_details?: string;
  last_maintenance_date?: string;
  next_maintenance_date?: string;
  is_operational: boolean;
  created_at: string;
  updated_at: string;
}

interface EquipmentForm {
  equipment_type: string;
  equipment_name: string;
  model: string;
  manufacturer: string;
  capacity: string;
  certification_required: boolean;
  certification_details: string;
  last_maintenance_date: string;
  next_maintenance_date: string;
  is_operational: boolean;
}

export function VendorEquipmentManager({ vendor, onBack }: VendorEquipmentManagerProps) {
  const { userProfile } = useAuth();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [formData, setFormData] = useState<EquipmentForm>({
    equipment_type: '',
    equipment_name: '',
    model: '',
    manufacturer: '',
    capacity: '',
    certification_required: false,
    certification_details: '',
    last_maintenance_date: '',
    next_maintenance_date: '',
    is_operational: true
  });

  const equipmentTypes = [
    'Construction Equipment',
    'Drying Equipment',
    'Testing Equipment',
    'Safety Equipment',
    'Measurement Tools',
    'Power Tools',
    'Vehicles',
    'Specialty Equipment',
    'Other'
  ];

  useEffect(() => {
    loadEquipment();
  }, [vendor.id]);

  const loadEquipment = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vendor_equipment')
        .select('*')
        .eq('vendor_id', vendor.id)
        .order('equipment_name');

      if (error) throw error;
      setEquipment(data || []);
    } catch (error) {
      console.error('Error loading equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEquipment = () => {
    setEditingEquipment(null);
    setFormData({
      equipment_type: '',
      equipment_name: '',
      model: '',
      manufacturer: '',
      capacity: '',
      certification_required: false,
      certification_details: '',
      last_maintenance_date: '',
      next_maintenance_date: '',
      is_operational: true
    });
    setShowForm(true);
  };

  const handleEditEquipment = (item: Equipment) => {
    setEditingEquipment(item);
    setFormData({
      equipment_type: item.equipment_type,
      equipment_name: item.equipment_name,
      model: item.model || '',
      manufacturer: item.manufacturer || '',
      capacity: item.capacity || '',
      certification_required: item.certification_required,
      certification_details: item.certification_details || '',
      last_maintenance_date: item.last_maintenance_date || '',
      next_maintenance_date: item.next_maintenance_date || '',
      is_operational: item.is_operational
    });
    setShowForm(true);
  };

  const handleSaveEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingEquipment) {
        // Update existing equipment
        const { error } = await supabase
          .from('vendor_equipment')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingEquipment.id);

        if (error) throw error;
      } else {
        // Create new equipment
        const { error } = await supabase
          .from('vendor_equipment')
          .insert({
            ...formData,
            vendor_id: vendor.id,
            organization_id: userProfile?.organization_id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      await loadEquipment();
      setShowForm(false);
      setEditingEquipment(null);
    } catch (error) {
      console.error('Error saving equipment:', error);
    }
  };

  const handleDeleteEquipment = async (equipmentId: string) => {
    if (!confirm('Are you sure you want to delete this equipment?')) return;

    try {
      const { error } = await supabase
        .from('vendor_equipment')
        .delete()
        .eq('id', equipmentId);

      if (error) throw error;
      await loadEquipment();
    } catch (error) {
      console.error('Error deleting equipment:', error);
    }
  };

  const getMaintenanceStatus = (item: Equipment) => {
    if (!item.next_maintenance_date) return null;
    
    const nextDate = new Date(item.next_maintenance_date);
    const today = new Date();
    const diffDays = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { status: 'overdue', text: 'Overdue', color: 'text-red-600 bg-red-100' };
    if (diffDays <= 7) return { status: 'due_soon', text: 'Due Soon', color: 'text-yellow-600 bg-yellow-100' };
    if (diffDays <= 30) return { status: 'upcoming', text: 'Upcoming', color: 'text-blue-600 bg-blue-100' };
    return { status: 'current', text: 'Current', color: 'text-green-600 bg-green-100' };
  };

  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = item.equipment_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.equipment_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.manufacturer && item.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || item.equipment_type === filterType;
    
    return matchesSearch && matchesType;
  });

  const uniqueTypes = Array.from(new Set(equipment.map(item => item.equipment_type)));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button onClick={() => setShowForm(false)} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-bold text-gray-900">
            {editingEquipment ? 'Edit Equipment' : 'Add Equipment'}
          </h2>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSaveEquipment} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Equipment Type *
                  </label>
                  <select
                    value={formData.equipment_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, equipment_type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select type...</option>
                    {equipmentTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Equipment Name *
                  </label>
                  <Input
                    value={formData.equipment_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, equipment_name: e.target.value }))}
                    placeholder="Enter equipment name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Manufacturer
                  </label>
                  <Input
                    value={formData.manufacturer}
                    onChange={(e) => setFormData(prev => ({ ...prev, manufacturer: e.target.value }))}
                    placeholder="Enter manufacturer"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model
                  </label>
                  <Input
                    value={formData.model}
                    onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                    placeholder="Enter model"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacity/Specifications
                  </label>
                  <Input
                    value={formData.capacity}
                    onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                    placeholder="e.g., 50 GPM, 1000 CFM, etc."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Maintenance Date
                  </label>
                  <Input
                    type="date"
                    value={formData.last_maintenance_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, last_maintenance_date: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Next Maintenance Date
                  </label>
                  <Input
                    type="date"
                    value={formData.next_maintenance_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, next_maintenance_date: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.certification_required}
                    onChange={(e) => setFormData(prev => ({ ...prev, certification_required: e.target.checked }))}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">Certification required</span>
                </label>
                
                {formData.certification_required && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Certification Details
                    </label>
                    <textarea
                      value={formData.certification_details}
                      onChange={(e) => setFormData(prev => ({ ...prev, certification_details: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter certification requirements and details..."
                    />
                  </div>
                )}
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.is_operational}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_operational: e.target.checked }))}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">Currently operational</span>
                </label>
              </div>
              
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingEquipment ? 'Update Equipment' : 'Add Equipment'}
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
            <h1 className="text-2xl font-bold text-gray-900">Equipment & Capabilities</h1>
            <p className="text-gray-600">{vendor.company_name}</p>
          </div>
        </div>
        
        <Button onClick={handleAddEquipment} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Equipment
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search equipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Equipment List */}
      {filteredEquipment.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredEquipment.map(item => {
            const maintenanceStatus = getMaintenanceStatus(item);
            
            return (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {item.equipment_name}
                        </h3>
                        {item.is_operational ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{item.equipment_type}</p>
                      {item.manufacturer && (
                        <p className="text-sm text-gray-500">
                          {item.manufacturer}
                          {item.model && ` • ${item.model}`}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex gap-1">
                      <Button
                        onClick={() => handleEditEquipment(item)}
                        variant="outline"
                        size="sm"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteEquipment(item.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {item.capacity && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600">
                        <strong>Capacity:</strong> {item.capacity}
                      </p>
                    </div>
                  )}
                  
                  {item.certification_required && (
                    <div className="mb-3">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-blue-500" />
                        <span className="text-sm text-blue-700">Certification Required</span>
                      </div>
                      {item.certification_details && (
                        <p className="text-sm text-gray-600 mt-1 ml-6">
                          {item.certification_details}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {maintenanceStatus && (
                    <div className="mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${maintenanceStatus.color}`}>
                          {maintenanceStatus.text}
                        </span>
                      </div>
                      {item.next_maintenance_date && (
                        <p className="text-sm text-gray-600 mt-1 ml-6">
                          Next maintenance: {new Date(item.next_maintenance_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      item.is_operational 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.is_operational ? 'Operational' : 'Out of Service'}
                    </span>
                    
                    {item.last_maintenance_date && (
                      <span className="text-xs text-gray-500">
                        Last maintained: {new Date(item.last_maintenance_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No equipment found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterType !== 'all'
                ? 'No equipment matches your search criteria'
                : 'Start tracking vendor equipment and capabilities'}
            </p>
            {!searchTerm && filterType === 'all' && (
              <Button onClick={handleAddEquipment}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Equipment
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}