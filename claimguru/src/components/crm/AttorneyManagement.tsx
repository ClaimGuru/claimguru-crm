/**
 * ATTORNEY MANAGEMENT COMPONENT
 * 
 * Comprehensive attorney management with specialization tracking,
 * bar admission info, case history, and success rate management
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
  Scale,
  Star,
  MapPin,
  Phone,
  Mail,
  BarChart3,
  Edit,
  Eye,
  Trash2,
  Award,
  FileText
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface Attorney {
  id: string;
  organization_id: string;
  adjuster_id: string;
  law_firm_name?: string;
  bar_number?: string;
  bar_admission_date?: string;
  states_admitted?: string[];
  law_school?: string;
  graduation_year?: number;
  years_of_experience?: number;
  billing_rate_hourly?: number;
  retainer_amount?: number;
  total_cases_handled?: number;
  cases_won?: number;
  cases_settled?: number;
  cases_lost?: number;
  average_settlement_amount?: number;
  created_at: string;
  updated_at: string;
  // Joined data from adjusters table
  adjusters: {
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    is_active: boolean;
  };
}

export function AttorneyManagement() {
  const { userProfile } = useAuth();
  const [attorneys, setAttorneys] = useState<Attorney[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>('all');

  useEffect(() => {
    loadAttorneys();
  }, [userProfile?.organization_id]);

  const loadAttorneys = async () => {
    if (!userProfile?.organization_id) return;

    setLoading(true);
    try {
      // Load attorneys from attorney_profiles joined with adjusters
      const { data, error } = await supabase
        .from('attorney_profiles')
        .select(`
          *,
          adjusters!inner(
            id,
            first_name,
            last_name,
            email,
            phone,
            is_active
          )
        `)
        .eq('organization_id', userProfile.organization_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAttorneys(data || []);
    } catch (error) {
      console.error('Error loading attorneys:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAttorney = () => {
    // TODO: Implement attorney creation form
    console.log('Create attorney clicked');
  };

  const handleEditAttorney = (attorney: Attorney) => {
    // TODO: Implement attorney editing
    console.log('Edit attorney:', attorney);
  };

  const handleViewAttorney = (attorney: Attorney) => {
    // TODO: Implement attorney details view
    console.log('View attorney:', attorney);
  };

  const handleDeleteAttorney = async (attorneyId: string) => {
    if (!confirm('Are you sure you want to delete this attorney?')) return;

    try {
      const { error } = await supabase
        .from('attorney_profiles')
        .delete()
        .eq('id', attorneyId);

      if (error) throw error;
      await loadAttorneys();
    } catch (error) {
      console.error('Error deleting attorney:', error);
    }
  };

  const filteredAttorneys = attorneys.filter(attorney => {
    const adjuster = attorney.adjusters;
    const matchesSearch = !searchTerm || 
      adjuster.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      adjuster.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attorney.law_firm_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

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
          <h2 className="text-2xl font-bold text-gray-900">Attorney Management</h2>
          <p className="text-gray-600">Manage legal professionals, specializations, and case history</p>
        </div>
        <Button onClick={handleCreateAttorney} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Attorney
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search attorneys..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Specializations</option>
              <option value="insurance_law">Insurance Law</option>
              <option value="property_law">Property Law</option>
              <option value="litigation">Litigation</option>
              <option value="personal_injury">Personal Injury</option>
              <option value="construction_law">Construction Law</option>
            </select>

            <div className="text-sm text-gray-600">
              {filteredAttorneys.length} attorney{filteredAttorneys.length !== 1 ? 's' : ''}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attorney List */}
      {filteredAttorneys.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Scale className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No attorneys found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedSpecialization !== 'all' 
                ? 'Try adjusting your search criteria'
                : 'Get started by adding your first attorney to the system'}
            </p>
            <Button onClick={handleCreateAttorney} className="flex items-center gap-2 mx-auto">
              <Plus className="h-4 w-4" />
              Add Attorney
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAttorneys.map(attorney => {
            const adjuster = attorney.adjusters;
            return (
              <Card key={attorney.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {adjuster.first_name} {adjuster.last_name}
                      </h3>
                      {attorney.law_firm_name && (
                        <p className="text-sm text-gray-600">{attorney.law_firm_name}</p>
                      )}
                      {attorney.years_of_experience && (
                        <p className="text-sm text-gray-500">
                          {attorney.years_of_experience} years experience
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleViewAttorney(attorney)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditAttorney(attorney)}
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                        title="Edit attorney"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAttorney(attorney.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete attorney"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {adjuster.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span>{adjuster.email}</span>
                      </div>
                    )}
                    
                    {adjuster.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{adjuster.phone}</span>
                      </div>
                    )}

                    {attorney.bar_number && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Award className="h-4 w-4" />
                        <span>Bar #: {attorney.bar_number}</span>
                      </div>
                    )}

                    {attorney.billing_rate_hourly && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <BarChart3 className="h-4 w-4" />
                        <span>${attorney.billing_rate_hourly}/hour</span>
                      </div>
                    )}
                  </div>

                  {(attorney.total_cases_handled || attorney.cases_won) && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-lg font-semibold text-gray-900">
                            {attorney.total_cases_handled || 0}
                          </div>
                          <div className="text-xs text-gray-500">Total Cases</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-green-600">
                            {attorney.cases_won || 0}
                          </div>
                          <div className="text-xs text-gray-500">Cases Won</div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}