import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { TrendingUp, TrendingDown, DollarSign, Clock, Users, AlertTriangle } from 'lucide-react';

interface ClaimsAnalyticsWidgetsProps {
  claimsByStatus: Array<{ name: string; value: number; color: string }>;
  claimsVolumeTrend: Array<{ month: string; claims: number; settled: number }>;
  averageProcessingTime: Array<{ category: string; time: number }>;
  claimsAging: Array<{ ageRange: string; count: number }>;
  claimsBySeverity: Array<{ severity: string; count: number; value: number }>;
}

const COLORS = {
  primary: '#3B82F6',
  success: '#10B981', 
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#8B5CF6',
  gray: '#6B7280'
};

export const ClaimsAnalyticsWidgets: React.FC<ClaimsAnalyticsWidgetsProps> = ({
  claimsByStatus,
  claimsVolumeTrend,
  averageProcessingTime,
  claimsAging,
  claimsBySeverity
}) => {
  const totalClaims = claimsByStatus.reduce((sum, item) => sum + item.value, 0);
  const openClaims = claimsByStatus.filter(item => 
    ['new', 'in_progress', 'investigating'].includes(item.name.toLowerCase())
  ).reduce((sum, item) => sum + item.value, 0);
  
  const completionRate = totalClaims > 0 ? ((totalClaims - openClaims) / totalClaims * 100) : 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* Claims Status Distribution */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span>Claims by Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={claimsByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {claimsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">{totalClaims}</p>
              <p className="text-sm text-gray-600">Total Claims</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{completionRate.toFixed(1)}%</p>
              <p className="text-sm text-gray-600">Completion Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Claims Volume Trend */}
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span>Claims Volume Trend</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={claimsVolumeTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="claims"
                  stackId="1"
                  stroke={COLORS.primary}
                  fill={COLORS.primary}
                  fillOpacity={0.6}
                  name="New Claims"
                />
                <Area
                  type="monotone"
                  dataKey="settled"
                  stackId="2"
                  stroke={COLORS.success}
                  fill={COLORS.success}
                  fillOpacity={0.6}
                  name="Settled Claims"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Average Processing Time */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-orange-600" />
            <span>Avg Processing Time</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={averageProcessingTime} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="category" type="category" width={80} />
                <Tooltip 
                  content={<CustomTooltip />}
                  formatter={(value) => [`${value} days`, 'Processing Time']}
                />
                <Bar dataKey="time" fill={COLORS.warning} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Claims Aging Report */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span>Claims Aging</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={claimsAging}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="ageRange" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill={COLORS.danger} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Claims by Severity */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-purple-600" />
            <span>Claims by Severity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {claimsBySeverity.map((item, index) => {
              const percentage = claimsBySeverity.reduce((sum, s) => sum + s.count, 0) > 0 
                ? (item.count / claimsBySeverity.reduce((sum, s) => sum + s.count, 0)) * 100 
                : 0;
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {item.severity}
                    </span>
                    <div className="text-right">
                      <span className="text-sm font-bold text-gray-900">{item.count}</span>
                      <span className="text-xs text-gray-500 ml-1">({percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        item.severity === 'critical' ? 'bg-red-500' :
                        item.severity === 'high' ? 'bg-orange-500' :
                        item.severity === 'medium' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-600">
                    Total Value: ${item.value.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};