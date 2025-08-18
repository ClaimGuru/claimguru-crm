/**
 * REFERRAL SOURCE MANAGEMENT COMPONENT
 * 
 * Comprehensive referral source tracking with conversion metrics,
 * relationship management, and effectiveness analysis
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { 
  Plus,
  Search,
  Filter,
  Users,
  Star,
  MapPin,
  Phone,
  Mail,
  BarChart3,
  Edit,
  Eye,
  Trash2,
  TrendingUp,
  DollarSign,
  Target,
  Calendar,
  Globe
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface ReferralSource {
  id: string;
  organization_id: string;
  lead_source_id: string;
  referral_type_id: string;
  contact_person?: string;
  contact_title?: string;
  primary_phone?: string;
  email?: string;
  website?: string;
  relationship_type?: string;
  relationship_strength?: string;
  total_referrals?: number;
  successful_conversions?: number;
  total_value_generated?: number;
  last_referral_date?: string;
  created_at: string;
  updated_at: string;
  // Joined data from related tables
  lead_sources: {
    id: string;
    name: string;
    is_active: boolean;
  };
  referral_types?: {
    id: string;
    name: string;
    code: string;
  };
}

interface ReferralType {
  id: string;
  name: string;
  code: string;
  description?: string;
  commission_rate?: number;
}

export function ReferralSourceManagement() {
  const { userProfile } = useAuth();
  const [referralSources, setReferralSources] = useState<ReferralSource[]>([]);
  const [referralTypes, setReferralTypes] = useState<ReferralType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStrength, setSelectedStrength] = useState<string>('all');

  useEffect(() => {
    loadReferralSources();
    loadReferralTypes();
  }, [userProfile?.organization_id]);

  const loadReferralSources = async () => {
    if (!userProfile?.organization_id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('referral_source_profiles')
        .select(`
          *,
          lead_sources!inner(
            id,
            name,
            is_active
          ),
          referral_types(
            id,
            name,
            code
          )
        `)
        .eq('organization_id', userProfile.organization_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReferralSources(data || []);
    } catch (error) {
      console.error('Error loading referral sources:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReferralTypes = async () => {
    if (!userProfile?.organization_id) return;

    try {
      const { data, error } = await supabase
        .from('referral_types')
        .select('*')
        .eq('organization_id', userProfile.organization_id)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setReferralTypes(data || []);
    } catch (error) {
      console.error('Error loading referral types:', error);
    }
  };

  const handleCreateReferralSource = () => {
    // TODO: Implement referral source creation form
    console.log('Create referral source clicked');
  };

  const handleEditReferralSource = (referralSource: ReferralSource) => {
    // TODO: Implement referral source editing
    console.log('Edit referral source:', referralSource);
  };

  const handleViewReferralSource = (referralSource: ReferralSource) => {
    // TODO: Implement referral source details view
    console.log('View referral source:', referralSource);
  };

  const handleDeleteReferralSource = async (referralSourceId: string) => {
    if (!confirm('Are you sure you want to delete this referral source?')) return;

    try {
      const { error } = await supabase
        .from('referral_source_profiles')
        .delete()
        .eq('id', referralSourceId);

      if (error) throw error;
      await loadReferralSources();
    } catch (error) {
      console.error('Error deleting referral source:', error);
    }
  };

  const filteredReferralSources = referralSources.filter(source => {
    const leadSource = source.lead_sources;
    const matchesSearch = !searchTerm || 
      leadSource.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      source.contact_person?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || source.referral_type_id === selectedType;
    const matchesStrength = selectedStrength === 'all' || source.relationship_strength === selectedStrength;
    
    return matchesSearch && matchesType && matchesStrength;
  });

  const getConversionRate = (source: ReferralSource) => {
    if (!source.total_referrals || source.total_referrals === 0) return 0;
    return Math.round(((source.successful_conversions || 0) / source.total_referrals) * 100);
  };

  const getStrengthColor = (strength?: string) => {
    switch (strength) {
      case 'strong': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'weak': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Referral Source Management</h2>
          <p className="text-gray-600">Track referral relationships and conversion metrics</p>
        </div>
        <Button onClick={handleCreateReferralSource} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Referral Source
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search referral sources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              {referralTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>

            <select
              value={selectedStrength}
              onChange={(e) => setSelectedStrength(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Relationship Strengths</option>
              <option value="strong">Strong</option>
              <option value="medium">Medium</option>
              <option value="weak">Weak</option>
            </select>

            <div className="text-sm text-gray-600">
              {filteredReferralSources.length} source{filteredReferralSources.length !== 1 ? 's' : ''}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referral Source List */}
      {filteredReferralSources.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No referral sources found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedType !== 'all' || selectedStrength !== 'all'
                ? 'Try adjusting your search criteria'
                : 'Get started by adding your first referral source to track conversions'}
            </p>
            <Button onClick={handleCreateReferralSource} className="flex items-center gap-2 mx-auto">
              <Plus className="h-4 w-4" />
              Add Referral Source
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredReferralSources.map(source => {
            const leadSource = source.lead_sources;
            const referralType = source.referral_types;
            const conversionRate = getConversionRate(source);
            
            return (
              <Card key={source.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {leadSource.name}
                      </h3>
                      {source.contact_person && (
                        <p className="text-sm text-gray-600">
                          Contact: {source.contact_person}
                          {source.contact_title && ` (${source.contact_title})`}
                        </p>
                      )}
                      {referralType && (
                        <p className="text-sm text-gray-500">{referralType.name}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {source.relationship_strength && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStrengthColor(source.relationship_strength)}`}>
                          {source.relationship_strength}
                        </span>
                      )}
                      <button
                        onClick={() => handleViewReferralSource(source)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditReferralSource(source)}
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                        title="Edit referral source"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteReferralSource(source.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete referral source"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {source.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span>{source.email}</span>
                      </div>
                    )}
                    
                    {source.primary_phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{source.primary_phone}</span>
                      </div>
                    )}

                    {source.website && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Globe className="h-4 w-4" />
                        <span className="truncate">{source.website}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-semibold text-gray-900">
                          {source.total_referrals || 0}
                        </div>
                        <div className="text-xs text-gray-500">Referrals</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-green-600">
                          {conversionRate}%
                        </div>
                        <div className="text-xs text-gray-500">Conversion</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-blue-600">
                          ${(source.total_value_generated || 0).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">Value</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}