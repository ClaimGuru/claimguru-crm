import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ClaimsAnalyticsWidgets } from './ClaimsAnalyticsWidgets';
import { FinancialOverviewComponents } from './FinancialOverviewComponents';
import { PerformanceMetricsDashboard } from './PerformanceMetricsDashboard';
import { RealTimeActivityFeeds } from './RealTimeActivityFeeds';
import { 
  BarChart3, 
  DollarSign, 
  TrendingUp, 
  Activity, 
  Download, 
  Calendar,
  RefreshCw,
  Settings,
  Maximize2,
  Filter
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { generateAnalyticsData } from '../../lib/analyticsDataService';
import { exportToPDF, exportToCSV } from '../../lib/exportService';

interface AnalyticsData {
  claims: {
    byStatus: Array<{ name: string; value: number; color: string }>;
    volumeTrend: Array<{ month: string; claims: number; settled: number }>;
    processingTime: Array<{ category: string; time: number }>;
    aging: Array<{ ageRange: string; count: number }>;
    bySeverity: Array<{ severity: string; count: number; value: number }>;
  };
  financial: {
    revenue: Array<{ month: string; revenue: number; expenses: number; profit: number }>;
    expenseBreakdown: Array<{ category: string; amount: number; percentage: number }>;
    paymentStatus: {
      outstanding: number;
      overdue: number;
      collected: number;
      pending: number;
    };
    profitabilityByType: Array<{ claimType: string; revenue: number; cost: number; margin: number }>;
    cashFlow: Array<{ month: string; inflow: number; outflow: number; netFlow: number }>;
  };
  performance: {
    processingTimeAnalytics: Array<{ period: string; avgTime: number; target: number }>;
    userProductivity: Array<{ user: string; claimsProcessed: number; efficiency: number; rating: number }>;
    vendorPerformance: Array<{ vendor: string; score: number; responseTime: number; satisfaction: number }>;
    teamEfficiency: Array<{ department: string; productivity: number; quality: number; speed: number }>;
    clientSatisfaction: {
      average: number;
      trend: Array<{ month: string; score: number }>;
      breakdown: Array<{ category: string; score: number }>;
    };
  };
}

export const ComprehensiveAnalyticsDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('claims');
  const [dateRange, setDateRange] = useState('6months');
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    loadAnalyticsData();
  }, [userProfile?.organization_id, dateRange]);

  const loadAnalyticsData = async () => {
    if (!userProfile?.organization_id) return;
    
    try {
      setLoading(true);
      const data = await generateAnalyticsData(userProfile.organization_id, dateRange);
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!analyticsData) return;
    
    try {
      await exportToPDF(analyticsData, activeTab, `ClaimGuru_Analytics_${activeTab}_${new Date().toISOString().split('T')[0]}`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  };

  const handleExportCSV = async () => {
    if (!analyticsData) return;
    
    try {
      await exportToCSV(analyticsData, activeTab, `ClaimGuru_Data_${activeTab}_${new Date().toISOString().split('T')[0]}`);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading analytics data...</span>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-8">
        <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600">No analytics data available</p>
        <Button onClick={loadAnalyticsData} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-white p-6 overflow-auto' : ''}`}>
      {/* Analytics Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics & Insights</h2>
          <p className="text-gray-600 mt-1">
            Comprehensive analytics for claims, finances, and performance
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Date Range Selector */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="1month">Last Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
            <option value="all">All Time</option>
          </select>

          {/* Export Options */}
          <Button
            variant="outline"
            onClick={handleExportPDF}
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>PDF</span>
          </Button>

          <Button
            variant="outline"
            onClick={handleExportCSV}
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>CSV</span>
          </Button>

          {/* Fullscreen Toggle */}
          <Button
            variant="outline"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="flex items-center space-x-2"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>

          {/* Refresh */}
          <Button
            variant="outline"
            onClick={loadAnalyticsData}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="claims" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Claims Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4" />
            <span>Financial Overview</span>
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Performance Metrics</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Live Activity</span>
          </TabsTrigger>
        </TabsList>

        {/* Claims Analytics Tab */}
        <TabsContent value="claims" className="space-y-6">
          <ClaimsAnalyticsWidgets
            claimsByStatus={analyticsData.claims.byStatus}
            claimsVolumeTrend={analyticsData.claims.volumeTrend}
            averageProcessingTime={analyticsData.claims.processingTime}
            claimsAging={analyticsData.claims.aging}
            claimsBySeverity={analyticsData.claims.bySeverity}
          />
        </TabsContent>

        {/* Financial Overview Tab */}
        <TabsContent value="financial" className="space-y-6">
          <FinancialOverviewComponents
            revenueData={analyticsData.financial.revenue}
            expenseBreakdown={analyticsData.financial.expenseBreakdown}
            paymentStatus={analyticsData.financial.paymentStatus}
            profitabilityByType={analyticsData.financial.profitabilityByType}
            cashFlow={analyticsData.financial.cashFlow}
          />
        </TabsContent>

        {/* Performance Metrics Tab */}
        <TabsContent value="performance" className="space-y-6">
          <PerformanceMetricsDashboard
            processingTimeAnalytics={analyticsData.performance.processingTimeAnalytics}
            userProductivity={analyticsData.performance.userProductivity}
            vendorPerformance={analyticsData.performance.vendorPerformance}
            teamEfficiency={analyticsData.performance.teamEfficiency}
            clientSatisfaction={analyticsData.performance.clientSatisfaction}
          />
        </TabsContent>

        {/* Real-time Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <RealTimeActivityFeeds
            organizationId={userProfile?.organization_id || '1'}
          />
        </TabsContent>
      </Tabs>

      {/* Quick Insights Summary */}
      {!isFullscreen && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span>Quick Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="font-medium text-blue-900">Claims Performance</p>
                <p className="text-blue-700">
                  {analyticsData.claims.byStatus.reduce((sum, item) => sum + item.value, 0)} total claims with{' '}
                  {(analyticsData.claims.byStatus.find(item => item.name === 'settled')?.value || 0) / 
                   analyticsData.claims.byStatus.reduce((sum, item) => sum + item.value, 0) * 100}% completion rate
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="font-medium text-green-900">Financial Health</p>
                <p className="text-green-700">
                  ${analyticsData.financial.revenue.reduce((sum, item) => sum + item.revenue, 0).toLocaleString()} revenue with{' '}
                  {((analyticsData.financial.revenue.reduce((sum, item) => sum + item.revenue, 0) - 
                     analyticsData.financial.revenue.reduce((sum, item) => sum + item.expenses, 0)) / 
                     analyticsData.financial.revenue.reduce((sum, item) => sum + item.revenue, 0) * 100).toFixed(1)}% margin
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="font-medium text-purple-900">Client Satisfaction</p>
                <p className="text-purple-700">
                  {analyticsData.performance.clientSatisfaction.average.toFixed(1)}/5.0 average rating across all services
                </p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="font-medium text-orange-900">Team Efficiency</p>
                <p className="text-orange-700">
                  {analyticsData.performance.teamEfficiency.length > 0 
                    ? Math.round(analyticsData.performance.teamEfficiency.reduce((sum, item) => sum + item.productivity, 0) / analyticsData.performance.teamEfficiency.length)
                    : 0
                  }% average productivity across all departments
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};