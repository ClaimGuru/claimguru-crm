/**
 * VENDOR PERFORMANCE METRICS COMPONENT
 * 
 * Comprehensive performance tracking and analytics for vendors
 * including job completion rates, quality scores, and trends
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { 
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Star,
  Clock,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Calendar,
  BarChart3,
  Target,
  Award,
  Users
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface VendorPerformanceMetricsProps {
  vendor: any;
  onBack: () => void;
}

interface PerformanceMetric {
  id: string;
  metric_period: string;
  period_start: string;
  period_end: string;
  total_jobs: number;
  completed_jobs: number;
  on_time_completions: number;
  quality_score: number;
  customer_satisfaction: number;
  average_response_time_hours: number;
  total_revenue: number;
  no_shows: number;
  cancellations: number;
  quality_issues: number;
  complaints: number;
  compliments: number;
}

interface MetricsSummary {
  completionRate: number;
  onTimeRate: number;
  averageQuality: number;
  averageSatisfaction: number;
  totalRevenue: number;
  totalJobs: number;
  reliabilityScore: number;
}

export function VendorPerformanceMetrics({ vendor, onBack }: VendorPerformanceMetricsProps) {
  const { userProfile } = useAuth();
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [summary, setSummary] = useState<MetricsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  useEffect(() => {
    loadPerformanceMetrics();
  }, [vendor.id, selectedPeriod]);

  const loadPerformanceMetrics = async () => {
    setLoading(true);
    try {
      // Load performance metrics for the selected period
      const { data: performanceData, error } = await supabase
        .from('vendor_performance_metrics')
        .select('*')
        .eq('vendor_id', vendor.id)
        .eq('metric_period', selectedPeriod)
        .order('period_start', { ascending: false })
        .limit(12); // Last 12 periods

      if (error) throw error;

      const metricsData = performanceData || [];
      setMetrics(metricsData);

      // Calculate summary metrics
      if (metricsData.length > 0) {
        const totals = metricsData.reduce((acc, metric) => ({
          totalJobs: acc.totalJobs + metric.total_jobs,
          completedJobs: acc.completedJobs + metric.completed_jobs,
          onTimeCompletions: acc.onTimeCompletions + metric.on_time_completions,
          qualitySum: acc.qualitySum + (metric.quality_score * metric.total_jobs),
          satisfactionSum: acc.satisfactionSum + (metric.customer_satisfaction * metric.total_jobs),
          totalRevenue: acc.totalRevenue + metric.total_revenue,
          noShows: acc.noShows + metric.no_shows,
          cancellations: acc.cancellations + metric.cancellations,
          qualityIssues: acc.qualityIssues + metric.quality_issues
        }), {
          totalJobs: 0,
          completedJobs: 0,
          onTimeCompletions: 0,
          qualitySum: 0,
          satisfactionSum: 0,
          totalRevenue: 0,
          noShows: 0,
          cancellations: 0,
          qualityIssues: 0
        });

        const completionRate = totals.totalJobs > 0 ? (totals.completedJobs / totals.totalJobs) * 100 : 0;
        const onTimeRate = totals.completedJobs > 0 ? (totals.onTimeCompletions / totals.completedJobs) * 100 : 0;
        const averageQuality = totals.totalJobs > 0 ? totals.qualitySum / totals.totalJobs : 0;
        const averageSatisfaction = totals.totalJobs > 0 ? totals.satisfactionSum / totals.totalJobs : 0;
        const reliabilityIssues = totals.noShows + totals.cancellations + totals.qualityIssues;
        const reliabilityScore = totals.totalJobs > 0 ? Math.max(0, 100 - (reliabilityIssues / totals.totalJobs * 100)) : 100;

        setSummary({
          completionRate,
          onTimeRate,
          averageQuality,
          averageSatisfaction,
          totalRevenue: totals.totalRevenue,
          totalJobs: totals.totalJobs,
          reliabilityScore
        });
      } else {
        setSummary({
          completionRate: 0,
          onTimeRate: 0,
          averageQuality: 0,
          averageSatisfaction: 0,
          totalRevenue: 0,
          totalJobs: 0,
          reliabilityScore: 100
        });
      }
    } catch (error) {
      console.error('Error loading performance metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number, isPercentage: boolean = true) => {
    const threshold = isPercentage ? 80 : 4;
    if (score >= threshold) return 'text-green-600';
    if (score >= (isPercentage ? 60 : 3)) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (current < previous) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return null;
  };

  const formatPeriod = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    if (selectedPeriod === 'monthly') {
      return startDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    } else if (selectedPeriod === 'quarterly') {
      return `Q${Math.ceil((startDate.getMonth() + 1) / 3)} ${startDate.getFullYear()}`;
    } else {
      return startDate.getFullYear().toString();
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button onClick={onBack} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Performance Metrics</h1>
            <p className="text-gray-600">{vendor.company_name}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completion Rate</p>
                  <p className={`text-2xl font-bold ${getScoreColor(summary.completionRate)}`}>
                    {summary.completionRate.toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-500">
                    {summary.totalJobs} total jobs
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">On-Time Rate</p>
                  <p className={`text-2xl font-bold ${getScoreColor(summary.onTimeRate)}`}>
                    {summary.onTimeRate.toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-500">Timely completion</p>
                </div>
                <Clock className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Quality Score</p>
                  <p className={`text-2xl font-bold ${getScoreColor(summary.averageQuality, false)}`}>
                    {summary.averageQuality.toFixed(1)}
                  </p>
                  <p className="text-sm text-gray-500">Out of 5.0</p>
                </div>
                <Star className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${summary.totalRevenue.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">All periods</p>
                </div>
                <DollarSign className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summary && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completion Rate</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${summary.completionRate}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{summary.completionRate.toFixed(1)}%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">On-Time Rate</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${summary.onTimeRate}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{summary.onTimeRate.toFixed(1)}%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Quality Score</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-600 h-2 rounded-full" 
                        style={{ width: `${(summary.averageQuality / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{summary.averageQuality.toFixed(1)}/5</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Customer Satisfaction</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${(summary.averageSatisfaction / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{summary.averageSatisfaction.toFixed(1)}/5</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Reliability Score</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full" 
                        style={{ width: `${summary.reliabilityScore}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{summary.reliabilityScore.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reliability Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Reliability Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.length > 0 ? (
              <div className="space-y-4">
                {metrics.slice(0, 3).map((metric, index) => (
                  <div key={metric.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">
                        {formatPeriod(metric.period_start, metric.period_end)}
                      </h4>
                      <div className="flex items-center gap-1">
                        {index > 0 && getTrendIcon(
                          metric.total_jobs - metric.no_shows - metric.cancellations,
                          metrics[index - 1].total_jobs - metrics[index - 1].no_shows - metrics[index - 1].cancellations
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">No Shows</p>
                        <p className="font-medium text-red-600">{metric.no_shows}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Cancellations</p>
                        <p className="font-medium text-yellow-600">{metric.cancellations}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Quality Issues</p>
                        <p className="font-medium text-orange-600">{metric.quality_issues}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No reliability data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Historical Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Historical Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {metrics.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-4 font-medium text-gray-600">Period</th>
                    <th className="text-right py-2 px-4 font-medium text-gray-600">Jobs</th>
                    <th className="text-right py-2 px-4 font-medium text-gray-600">Completed</th>
                    <th className="text-right py-2 px-4 font-medium text-gray-600">On Time</th>
                    <th className="text-right py-2 px-4 font-medium text-gray-600">Quality</th>
                    <th className="text-right py-2 px-4 font-medium text-gray-600">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((metric) => (
                    <tr key={metric.id} className="border-b border-gray-100">
                      <td className="py-2 px-4 font-medium">
                        {formatPeriod(metric.period_start, metric.period_end)}
                      </td>
                      <td className="text-right py-2 px-4">{metric.total_jobs}</td>
                      <td className="text-right py-2 px-4">
                        {metric.completed_jobs}
                        <span className="text-sm text-gray-500 ml-1">
                          ({metric.total_jobs > 0 ? ((metric.completed_jobs / metric.total_jobs) * 100).toFixed(0) : 0}%)
                        </span>
                      </td>
                      <td className="text-right py-2 px-4">
                        {metric.on_time_completions}
                        <span className="text-sm text-gray-500 ml-1">
                          ({metric.completed_jobs > 0 ? ((metric.on_time_completions / metric.completed_jobs) * 100).toFixed(0) : 0}%)
                        </span>
                      </td>
                      <td className="text-right py-2 px-4">
                        <span className={getScoreColor(metric.quality_score, false)}>
                          {metric.quality_score?.toFixed(1) || 'N/A'}
                        </span>
                      </td>
                      <td className="text-right py-2 px-4 font-medium">
                        ${metric.total_revenue?.toLocaleString() || '0'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Performance Data</h3>
              <p className="text-gray-600">
                Performance metrics will appear here once jobs are completed and tracked.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}