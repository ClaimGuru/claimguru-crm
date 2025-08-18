/**
 * VENDOR DETAILS COMPONENT
 * 
 * Comprehensive vendor details view with all information,
 * specialties, service areas, and quick actions
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  Building, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Globe,
  Star,
  Calendar,
  FileText,
  Tag,
  Award,
  CheckCircle,
  X,
  Edit,
  ArrowLeft,
  BarChart3,
  Wrench,
  Target
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface VendorDetailsProps {
  vendor: any;
  onEdit: () => void;
  onBack: () => void;
}

interface ServiceArea {
  id: string;
  name: string;
  area_type: string;
  area_data: any;
}

interface Equipment {
  id: string;
  equipment_type: string;
  equipment_name: string;
  model?: string;
  manufacturer?: string;
  is_operational: boolean;
}

interface PerformanceMetric {
  id: string;
  total_jobs: number;
  completed_jobs: number;
  quality_score: number;
  customer_satisfaction: number;
  period_start: string;
  period_end: string;
}

export function VendorDetails({ vendor, onEdit, onBack }: VendorDetailsProps) {
  const { userProfile } = useAuth();
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [recentMetrics, setRecentMetrics] = useState<PerformanceMetric | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVendorDetails();
  }, [vendor.id]);

  const loadVendorDetails = async () => {
    setLoading(true);
    try {
      // Load service areas
      const { data: vendorServiceAreas } = await supabase
        .from('vendor_service_areas')
        .select(`
          service_areas!inner(
            id, name, area_type, area_data
          )
        `)
        .eq('vendor_id', vendor.id);

      if (vendorServiceAreas) {
        setServiceAreas(vendorServiceAreas.map((vsa: any) => ({
          id: vsa.service_areas.id,
          name: vsa.service_areas.name,
          area_type: vsa.service_areas.area_type,
          area_data: vsa.service_areas.area_data
        })));
      }

      // Load equipment
      const { data: vendorEquipment } = await supabase
        .from('vendor_equipment')
        .select('*')
        .eq('vendor_id', vendor.id)
        .eq('is_operational', true)
        .limit(5);

      setEquipment(vendorEquipment || []);

      // Load recent performance metrics
      const { data: metrics } = await supabase
        .from('vendor_performance_metrics')
        .select('*')
        .eq('vendor_id', vendor.id)
        .order('period_end', { ascending: false })
        .limit(1)
        .maybeSingle();

      setRecentMetrics(metrics);
    } catch (error) {
      console.error('Error loading vendor details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPhone = (phone: string) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button onClick={onBack} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{vendor.company_name}</h1>
              {vendor.preferred_vendor && (
                <Star className="h-6 w-6 text-yellow-400 fill-current" />
              )}
            </div>
            <p className="text-gray-600 capitalize">
              {vendor.company_type?.replace('_', ' ')} • {vendor.contact_first_name} {vendor.contact_last_name}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={onEdit} className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Edit Vendor
          </Button>
        </div>
      </div>

      {/* Status and Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  getStatusColor(vendor.is_active)
                }`}>
                  {vendor.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className={`w-3 h-3 rounded-full ${
                vendor.is_active ? 'bg-green-400' : 'bg-gray-400'
              }`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rating</p>
                {vendor.rating ? (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="font-semibold">{vendor.rating.toFixed(1)}</span>
                  </div>
                ) : (
                  <span className="text-gray-400">No rating</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-gray-600">Specialties</p>
              <p className="font-semibold">
                {vendor.specialties?.length || 0} specialties
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-gray-600">Service Areas</p>
              <p className="font-semibold">
                {serviceAreas.length} areas
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-gray-400" />
              <div>
                <p className="font-medium">
                  {vendor.contact_first_name} {vendor.contact_last_name}
                </p>
                <p className="text-sm text-gray-600">Primary Contact</p>
              </div>
            </div>
            
            {vendor.phone_1 && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="font-medium">Primary Phone</p>
                  <a href={`tel:${vendor.phone_1}`} className="text-sm text-indigo-600 hover:text-indigo-800">
                    {formatPhone(vendor.phone_1)}
                  </a>
                </div>
              </div>
            )}
            
            {vendor.phone_2 && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="font-medium">Secondary Phone</p>
                  <a href={`tel:${vendor.phone_2}`} className="text-sm text-indigo-600 hover:text-indigo-800">
                    {formatPhone(vendor.phone_2)}
                  </a>
                </div>
              </div>
            )}
            
            {vendor.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="font-medium">Email</p>
                  <a href={`mailto:${vendor.email}`} className="text-sm text-indigo-600 hover:text-indigo-800">
                    {vendor.email}
                  </a>
                </div>
              </div>
            )}
            
            {vendor.website && (
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="font-medium">Website</p>
                  <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:text-indigo-800">
                    {vendor.website}
                  </a>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            {vendor.address_line_1 || vendor.city || vendor.state ? (
              <div className="space-y-2">
                {vendor.address_line_1 && (
                  <p className="text-gray-900">{vendor.address_line_1}</p>
                )}
                {vendor.address_line_2 && (
                  <p className="text-gray-900">{vendor.address_line_2}</p>
                )}
                <p className="text-gray-900">
                  {[vendor.city, vendor.state, vendor.zip_code].filter(Boolean).join(', ')}
                </p>
                {vendor.country && vendor.country !== 'United States' && (
                  <p className="text-gray-600">{vendor.country}</p>
                )}
              </div>
            ) : (
              <p className="text-gray-500 italic">No address information available</p>
            )}
          </CardContent>
        </Card>

        {/* Specialties */}
        {vendor.specialties && vendor.specialties.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Specialties
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {vendor.specialties.map((specialty: string, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Service Areas */}
        {serviceAreas.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Service Areas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {serviceAreas.map((area) => (
                  <div key={area.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{area.name}</p>
                      <p className="text-sm text-gray-600 capitalize">{area.area_type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Equipment */}
        {equipment.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Equipment & Capabilities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {equipment.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{item.equipment_name}</p>
                      <p className="text-sm text-gray-600">
                        {item.equipment_type}
                        {item.model && ` • ${item.model}`}
                        {item.manufacturer && ` • ${item.manufacturer}`}
                      </p>
                    </div>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                ))}
                {equipment.length > 5 && (
                  <p className="text-sm text-gray-500">+{equipment.length - 5} more items</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Performance */}
        {recentMetrics && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Recent Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Completion Rate</p>
                  <p className="text-xl font-bold">
                    {recentMetrics.total_jobs > 0 
                      ? Math.round((recentMetrics.completed_jobs / recentMetrics.total_jobs) * 100)
                      : 0}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Quality Score</p>
                  <p className="text-xl font-bold">
                    {recentMetrics.quality_score?.toFixed(1) || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Customer Satisfaction</p>
                  <p className="text-xl font-bold">
                    {recentMetrics.customer_satisfaction?.toFixed(1) || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Jobs</p>
                  <p className="text-xl font-bold">{recentMetrics.total_jobs}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Business Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Business Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {vendor.license_number && (
              <div>
                <p className="text-sm font-medium text-gray-700">License Number</p>
                <p className="text-sm text-gray-900">{vendor.license_number}</p>
              </div>
            )}
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {vendor.w9_on_file ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm text-gray-700">W9 on file</span>
              </div>
              
              <div className="flex items-center gap-2">
                {vendor.preferred_vendor ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-gray-400" />
                )}
                <span className="text-sm text-gray-700">Preferred vendor</span>
              </div>
              
              <div className="flex items-center gap-2">
                {vendor.can_file_claim_via_email ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-gray-400" />
                )}
                <span className="text-sm text-gray-700">Email claims</span>
              </div>
            </div>
            
            {vendor.insurance_info && (
              <div>
                <p className="text-sm font-medium text-gray-700">Insurance Information</p>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{vendor.insurance_info}</p>
              </div>
            )}
            
            {vendor.notes && (
              <div>
                <p className="text-sm font-medium text-gray-700">Notes</p>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{vendor.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}