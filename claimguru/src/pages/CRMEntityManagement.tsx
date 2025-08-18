/**
 * CRM ENTITY MANAGEMENT SYSTEM - Function 2.3
 * 
 * Comprehensive vendor, attorney, and referral source management
 * with multi-claim associations, performance tracking, and communication history
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { 
  Users, 
  Building, 
  Scale, 
  UserCheck,
  TrendingUp,
  Search,
  Filter,
  Plus,
  BarChart3,
  Phone,
  Mail,
  MapPin,
  Star,
  Calendar,
  FileText,
  Award,
  Target,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { VendorManagement } from '../components/crm/VendorManagement';
import { AttorneyManagement } from '../components/crm/AttorneyManagement';
import { ReferralSourceManagement } from '../components/crm/ReferralSourceManagement';
import { EntityPerformanceDashboard } from '../components/crm/EntityPerformanceDashboard';

type TabType = 'dashboard' | 'vendors' | 'attorneys' | 'referrals';

interface EntityStats {
  totalVendors: number;
  activeVendors: number;
  totalAttorneys: number;
  activeAttorneys: number;
  totalReferralSources: number;
  activeReferralSources: number;
  monthlyConversions: number;
  totalValueGenerated: number;
}

export default function CRMEntityManagement() {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<EntityStats>({
    totalVendors: 0,
    activeVendors: 0,
    totalAttorneys: 0,
    activeAttorneys: 0,
    totalReferralSources: 0,
    activeReferralSources: 0,
    monthlyConversions: 0,
    totalValueGenerated: 0
  });

  useEffect(() => {
    loadEntityStats();
  }, [userProfile?.organization_id]);

  const loadEntityStats = async () => {
    if (!userProfile?.organization_id) return;

    setLoading(true);
    try {
      // Load vendor stats
      const { data: vendors } = await supabase
        .from('vendors')
        .select('id, is_active')
        .eq('organization_id', userProfile.organization_id);

      // Load attorney stats
      const { data: attorneys } = await supabase
        .from('adjusters')
        .select('id, is_active')
        .eq('organization_id', userProfile.organization_id)
        .eq('adjuster_type', 'attorney');

      // Load referral source stats
      const { data: referralSources } = await supabase
        .from('lead_sources')
        .select('id, is_active')
        .eq('organization_id', userProfile.organization_id);

      // Load performance metrics
      const { data: conversions } = await supabase
        .from('referral_conversions')
        .select('referral_value')
        .eq('organization_id', userProfile.organization_id)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      setStats({
        totalVendors: vendors?.length || 0,
        activeVendors: vendors?.filter(v => v.is_active)?.length || 0,
        totalAttorneys: attorneys?.length || 0,
        activeAttorneys: attorneys?.filter(a => a.is_active)?.length || 0,
        totalReferralSources: referralSources?.length || 0,
        activeReferralSources: referralSources?.filter(r => r.is_active)?.length || 0,
        monthlyConversions: conversions?.length || 0,
        totalValueGenerated: conversions?.reduce((sum, c) => sum + (c.referral_value || 0), 0) || 0
      });
    } catch (error) {
      console.error('Error loading entity stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'vendors', label: 'Vendors', icon: Building },
    { id: 'attorneys', label: 'Attorneys', icon: Scale },
    { id: 'referrals', label: 'Referral Sources', icon: Users }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CRM Entity Management</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive vendor, attorney, and referral source relationship management
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className={`-ml-0.5 mr-2 h-5 w-5 ${
                  activeTab === tab.id ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'
                }`} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Building className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-500">Vendors</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {stats.activeVendors} / {stats.totalVendors}
                      </div>
                      <div className="text-sm text-gray-600">Active / Total</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Scale className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-500">Attorneys</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {stats.activeAttorneys} / {stats.totalAttorneys}
                      </div>
                      <div className="text-sm text-gray-600">Active / Total</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Users className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-500">Referral Sources</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {stats.activeReferralSources} / {stats.totalReferralSources}
                      </div>
                      <div className="text-sm text-gray-600">Active / Total</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <DollarSign className="h-8 w-8 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-500">Monthly Value</div>
                      <div className="text-2xl font-bold text-gray-900">
                        ${stats.totalValueGenerated.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">{stats.monthlyConversions} conversions</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Dashboard */}
            <EntityPerformanceDashboard />
          </div>
        )}

        {activeTab === 'vendors' && <VendorManagement />}
        {activeTab === 'attorneys' && <AttorneyManagement />}
        {activeTab === 'referrals' && <ReferralSourceManagement />}
      </div>
    </div>
  );
}