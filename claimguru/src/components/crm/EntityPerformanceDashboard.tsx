/**
 * ENTITY PERFORMANCE DASHBOARD COMPONENT
 * 
 * Comprehensive dashboard showing performance metrics across
 * vendors, attorneys, and referral sources
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { 
  TrendingUp,
  TrendingDown,
  Star,
  Users,
  DollarSign,
  Target,
  Award,
  BarChart3,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface PerformanceData {
  entityType: string;
  entityName: string;
  entityId: string;
  totalAssignments: number;
  completedAssignments: number;
  averageRating: number;
  totalRevenue: number;
  completionRate: number;
  lastActivity: string;
}

interface DashboardMetrics {
  topPerformers: PerformanceData[];
  recentActivity: any[];
  monthlyTrends: any[];
  alertsAndIssues: any[];
}

export function EntityPerformanceDashboard() {
  const { userProfile } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    topPerformers: [],
    recentActivity: [],
    monthlyTrends: [],
    alertsAndIssues: []
  });
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30'); // days

  useEffect(() => {
    loadDashboardMetrics();
  }, [userProfile?.organization_id, timeframe]);

  const loadDashboardMetrics = async () => {
    if (!userProfile?.organization_id) return;

    setLoading(true);
    try {
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(timeframe));

      // Load vendor performance data
      const { data: vendorMetrics } = await supabase
        .from('vendor_performance_metrics')
        .select(`
          vendor_id,
          total_jobs,
          completed_jobs,
          quality_score,
          total_revenue,
          vendors!inner(company_name)
        `)
        .eq('vendors.organization_id', userProfile.organization_id)
        .gte('period_end', startDate.toISOString())
        .lte('period_end', endDate.toISOString());

      // Load attorney case data
      const { data: attorneyMetrics } = await supabase
        .from('attorney_case_assignments')
        .select(`
          attorney_id,
          case_status,
          settlement_amount,
          attorney_fees,
          attorney_profiles!inner(
            adjuster_id,
            adjusters!inner(first_name, last_name)
          )
        `)
        .eq('attorney_profiles.organization_id', userProfile.organization_id)
        .gte('created_at', startDate.toISOString());

      // Load referral conversion data
      const { data: referralMetrics } = await supabase
        .from('referral_conversions')
        .select(`
          referral_source_id,
          conversion_status,
          referral_value,
          commission_due,
          referral_source_profiles!inner(
            lead_source_id,
            lead_sources!inner(name)
          )
        `)
        .eq('referral_source_profiles.organization_id', userProfile.organization_id)
        .gte('created_at', startDate.toISOString());

      // Process vendor data
      const vendorPerformance = processVendorMetrics(vendorMetrics || []);
      
      // Process attorney data
      const attorneyPerformance = processAttorneyMetrics(attorneyMetrics || []);
      
      // Process referral data
      const referralPerformance = processReferralMetrics(referralMetrics || []);

      // Combine and sort top performers
      const allPerformers = [...vendorPerformance, ...attorneyPerformance, ...referralPerformance]
        .sort((a, b) => b.completionRate - a.completionRate)
        .slice(0, 10);

      // Generate mock recent activity and alerts for demo
      const recentActivity = generateRecentActivity();
      const alertsAndIssues = generateAlertsAndIssues();

      setMetrics({
        topPerformers: allPerformers,
        recentActivity,
        monthlyTrends: [],
        alertsAndIssues
      });
    } catch (error) {
      console.error('Error loading dashboard metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const processVendorMetrics = (data: any[]): PerformanceData[] => {
    const vendorGroups = data.reduce((acc, metric) => {
      const vendorId = metric.vendor_id;
      if (!acc[vendorId]) {
        acc[vendorId] = {
          entityType: 'vendor',
          entityName: metric.vendors.company_name,
          entityId: vendorId,
          totalJobs: 0,
          completedJobs: 0,
          totalRevenue: 0,
          qualitySum: 0,
          qualityCount: 0
        };
      }
      
      acc[vendorId].totalJobs += metric.total_jobs;
      acc[vendorId].completedJobs += metric.completed_jobs;
      acc[vendorId].totalRevenue += metric.total_revenue || 0;
      if (metric.quality_score > 0) {
        acc[vendorId].qualitySum += metric.quality_score;
        acc[vendorId].qualityCount += 1;
      }
      
      return acc;
    }, {});

    return Object.values(vendorGroups).map((vendor: any) => ({
      entityType: 'vendor',
      entityName: vendor.entityName,
      entityId: vendor.entityId,
      totalAssignments: vendor.totalJobs,
      completedAssignments: vendor.completedJobs,
      averageRating: vendor.qualityCount > 0 ? vendor.qualitySum / vendor.qualityCount : 0,
      totalRevenue: vendor.totalRevenue,
      completionRate: vendor.totalJobs > 0 ? (vendor.completedJobs / vendor.totalJobs) * 100 : 0,
      lastActivity: new Date().toISOString()
    }));
  };

  const processAttorneyMetrics = (data: any[]): PerformanceData[] => {
    const attorneyGroups = data.reduce((acc, assignment) => {
      const attorneyId = assignment.attorney_id;
      if (!acc[attorneyId]) {
        acc[attorneyId] = {
          entityType: 'attorney',
          entityName: `${assignment.attorney_profiles.adjusters.first_name} ${assignment.attorney_profiles.adjusters.last_name}`,
          entityId: attorneyId,
          totalCases: 0,
          completedCases: 0,
          totalRevenue: 0
        };
      }
      
      acc[attorneyId].totalCases += 1;
      if (['settled', 'won'].includes(assignment.case_status)) {
        acc[attorneyId].completedCases += 1;
        acc[attorneyId].totalRevenue += assignment.attorney_fees || 0;
      }
      
      return acc;
    }, {});

    return Object.values(attorneyGroups).map((attorney: any) => ({
      entityType: 'attorney',
      entityName: attorney.entityName,
      entityId: attorney.entityId,
      totalAssignments: attorney.totalCases,
      completedAssignments: attorney.completedCases,
      averageRating: 0, // Would need separate rating system
      totalRevenue: attorney.totalRevenue,
      completionRate: attorney.totalCases > 0 ? (attorney.completedCases / attorney.totalCases) * 100 : 0,
      lastActivity: new Date().toISOString()
    }));
  };

  const processReferralMetrics = (data: any[]): PerformanceData[] => {
    const referralGroups = data.reduce((acc, conversion) => {
      const sourceId = conversion.referral_source_id;
      if (!acc[sourceId]) {
        acc[sourceId] = {
          entityType: 'referral',
          entityName: conversion.referral_source_profiles.lead_sources.name,
          entityId: sourceId,
          totalReferrals: 0,
          convertedReferrals: 0,
          totalValue: 0
        };
      }
      
      acc[sourceId].totalReferrals += 1;
      if (conversion.conversion_status === 'converted') {
        acc[sourceId].convertedReferrals += 1;
        acc[sourceId].totalValue += conversion.referral_value || 0;
      }
      
      return acc;
    }, {});

    return Object.values(referralGroups).map((source: any) => ({
      entityType: 'referral',
      entityName: source.entityName,
      entityId: source.entityId,
      totalAssignments: source.totalReferrals,
      completedAssignments: source.convertedReferrals,
      averageRating: 0,
      totalRevenue: source.totalValue,
      completionRate: source.totalReferrals > 0 ? (source.convertedReferrals / source.totalReferrals) * 100 : 0,
      lastActivity: new Date().toISOString()
    }));
  };

  const generateRecentActivity = () => [
    {
      id: '1',
      type: 'vendor_assignment',
      description: 'ABC Restoration assigned to new water damage claim',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      entityType: 'vendor'
    },
    {
      id: '2',
      type: 'attorney_case_won',
      description: 'John Smith won insurance coverage dispute case',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      entityType: 'attorney'
    },
    {
      id: '3',
      type: 'referral_conversion',
      description: 'Social media referral converted to new client',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      entityType: 'referral'
    }
  ];

  const generateAlertsAndIssues = () => [
    {
      id: '1',
      type: 'warning',
      title: 'Vendor Response Time Alert',
      description: 'XYZ Contractors has missed response time targets 3 times this month',
      severity: 'medium',
      entityType: 'vendor'
    },
    {
      id: '2',
      type: 'info',
      title: 'High Performance',
      description: 'Johnson Law Firm has a 95% case success rate this quarter',
      severity: 'low',
      entityType: 'attorney'
    }
  ];

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'vendor': return <Users className="h-4 w-4 text-blue-600" />;
      case 'attorney': return <Award className="h-4 w-4 text-green-600" />;
      case 'referral': return <Target className="h-4 w-4 text-purple-600" />;
      default: return <Users className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPerformanceColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 75) return 'text-yellow-600';
    return 'text-red-600';
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
      {/* Header with Time Filter */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Performance Dashboard</h2>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.topPerformers.length > 0 ? (
              <div className="space-y-3">
                {metrics.topPerformers.slice(0, 5).map((performer, index) => (
                  <div key={performer.entityId} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-gray-300'
                      }`}>
                        {index + 1}
                      </div>
                      {getEntityIcon(performer.entityType)}
                      <div>
                        <p className="font-medium text-gray-900">{performer.entityName}</p>
                        <p className="text-sm text-gray-600 capitalize">{performer.entityType}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${getPerformanceColor(performer.completionRate)}`}>
                        {performer.completionRate.toFixed(1)}%
                      </p>
                      <p className="text-sm text-gray-600">
                        {performer.completedAssignments}/{performer.totalAssignments}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No performance data available</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded">
                  {getEntityIcon(activity.entityType)}
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alerts and Issues */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alerts & Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.alertsAndIssues.map((alert) => (
                <div key={alert.id} className={`flex items-start gap-3 p-3 rounded border-l-4 ${
                  alert.severity === 'high' ? 'bg-red-50 border-red-400' :
                  alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-400' :
                  'bg-blue-50 border-blue-400'
                }`}>
                  <AlertTriangle className={`h-4 w-4 mt-0.5 ${
                    alert.severity === 'high' ? 'text-red-600' :
                    alert.severity === 'medium' ? 'text-yellow-600' :
                    'text-blue-600'
                  }`} />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{alert.title}</p>
                    <p className="text-sm text-gray-600">{alert.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {metrics.topPerformers.filter(p => p.entityType === 'vendor').length}
                  </p>
                  <p className="text-sm text-gray-600">Active Vendors</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {metrics.topPerformers.filter(p => p.entityType === 'attorney').length}
                  </p>
                  <p className="text-sm text-gray-600">Active Attorneys</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                    {metrics.topPerformers.filter(p => p.entityType === 'referral').length}
                  </p>
                  <p className="text-sm text-gray-600">Referral Sources</p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Overall Performance</span>
                  <span className="text-sm font-medium">
                    {metrics.topPerformers.length > 0 
                      ? `${(metrics.topPerformers.reduce((sum, p) => sum + p.completionRate, 0) / metrics.topPerformers.length).toFixed(1)}%`
                      : 'N/A'
                    }
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full" 
                    style={{ 
                      width: `${metrics.topPerformers.length > 0 
                        ? metrics.topPerformers.reduce((sum, p) => sum + p.completionRate, 0) / metrics.topPerformers.length
                        : 0}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}