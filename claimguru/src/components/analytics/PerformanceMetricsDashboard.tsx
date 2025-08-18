import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Clock, Users, Target, TrendingUp, Award, Activity, CheckCircle } from 'lucide-react';

interface PerformanceMetricsProps {
  processingTimeAnalytics: Array<{ period: string; avgTime: number; target: number }>;
  userProductivity: Array<{ user: string; claimsProcessed: number; efficiency: number; rating: number }>;
  vendorPerformance: Array<{ vendor: string; score: number; responseTime: number; satisfaction: number }>;
  teamEfficiency: Array<{ department: string; productivity: number; quality: number; speed: number }>;
  clientSatisfaction: {
    average: number;
    trend: Array<{ month: string; score: number }>;
    breakdown: Array<{ category: string; score: number }>;
  };
}

const COLORS = {
  primary: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#8B5CF6'
};

export const PerformanceMetricsDashboard: React.FC<PerformanceMetricsProps> = ({
  processingTimeAnalytics,
  userProductivity,
  vendorPerformance,
  teamEfficiency,
  clientSatisfaction
}) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}${entry.dataKey === 'avgTime' || entry.dataKey === 'responseTime' ? ' days' : 
                entry.dataKey === 'efficiency' || entry.dataKey === 'score' || entry.dataKey === 'satisfaction' ? '%' : ''}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Performance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Processing Time</p>
                <p className="text-2xl font-bold text-blue-600">
                  {processingTimeAnalytics.length > 0 
                    ? Math.round(processingTimeAnalytics.reduce((sum, item) => sum + item.avgTime, 0) / processingTimeAnalytics.length)
                    : 0
                  } days
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Target: 15 days
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Team Efficiency</p>
                <p className="text-2xl font-bold text-green-600">
                  {teamEfficiency.length > 0 
                    ? Math.round(teamEfficiency.reduce((sum, item) => sum + item.productivity, 0) / teamEfficiency.length)
                    : 0
                  }%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Above target
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Client Satisfaction</p>
                <p className="text-2xl font-bold text-purple-600">
                  {clientSatisfaction.average.toFixed(1)}/5.0
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Excellent rating
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-full">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-orange-600">
                  {userProductivity.length}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  This month
                </p>
              </div>
              <div className="p-2 bg-orange-100 rounded-full">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Processing Time Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span>Processing Time Trends</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={processingTimeAnalytics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="avgTime" 
                    stroke={COLORS.primary} 
                    strokeWidth={3}
                    name="Actual Time"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="target" 
                    stroke={COLORS.danger} 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Target"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* User Productivity Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-600" />
              <span>User Productivity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userProductivity
                .sort((a, b) => b.efficiency - a.efficiency)
                .slice(0, 8)
                .map((user, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.user}</p>
                      <p className="text-sm text-gray-600">
                        {user.claimsProcessed} claims processed
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{user.efficiency}%</p>
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full mx-0.5 ${
                            i < Math.round(user.rating) ? 'bg-yellow-400' : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vendor Performance Scorecard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-purple-600" />
              <span>Vendor Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vendorPerformance} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="vendor" type="category" width={100} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="score" fill={COLORS.info} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Team Efficiency Radar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-orange-600" />
              <span>Team Efficiency Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={teamEfficiency}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="department" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="Productivity"
                    dataKey="productivity"
                    stroke={COLORS.primary}
                    fill={COLORS.primary}
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Radar
                    name="Quality"
                    dataKey="quality"
                    stroke={COLORS.success}
                    fill={COLORS.success}
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Radar
                    name="Speed"
                    dataKey="speed"
                    stroke={COLORS.warning}
                    fill={COLORS.warning}
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Client Satisfaction Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-purple-600" />
            <span>Client Satisfaction Trends</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={clientSatisfaction.trend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke={COLORS.info} 
                    strokeWidth={3}
                    name="Satisfaction Score"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Satisfaction Breakdown</h4>
              {clientSatisfaction.breakdown.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      {item.category}
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {item.score.toFixed(1)}/5.0
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${(item.score / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};