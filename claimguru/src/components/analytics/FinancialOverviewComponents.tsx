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
  ComposedChart,
  Area,
  AreaChart
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { DollarSign, TrendingUp, TrendingDown, CreditCard, PiggyBank, AlertCircle } from 'lucide-react';

interface FinancialOverviewComponentsProps {
  revenueData: Array<{ month: string; revenue: number; expenses: number; profit: number }>;
  expenseBreakdown: Array<{ category: string; amount: number; percentage: number }>;
  paymentStatus: {
    outstanding: number;
    overdue: number;
    collected: number;
    pending: number;
  };
  profitabilityByType: Array<{ claimType: string; revenue: number; cost: number; margin: number }>;
  cashFlow: Array<{ month: string; inflow: number; outflow: number; netFlow: number }>;
}

const COLORS = {
  revenue: '#10B981',
  expenses: '#EF4444', 
  profit: '#3B82F6',
  warning: '#F59E0B',
  info: '#8B5CF6'
};

export const FinancialOverviewComponents: React.FC<FinancialOverviewComponentsProps> = ({
  revenueData,
  expenseBreakdown,
  paymentStatus,
  profitabilityByType,
  cashFlow
}) => {
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);
  const totalExpenses = revenueData.reduce((sum, item) => sum + item.expenses, 0);
  const totalProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue * 100) : 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: $${entry.value?.toLocaleString() || 0}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  ${totalRevenue.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  +12.5% from last month
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">
                  ${totalExpenses.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  <TrendingDown className="h-3 w-3 inline mr-1" />
                  -3.2% from last month
                </p>
              </div>
              <div className="p-2 bg-red-100 rounded-full">
                <CreditCard className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Net Profit</p>
                <p className={`text-2xl font-bold ${
                  totalProfit >= 0 ? 'text-blue-600' : 'text-red-600'
                }`}>
                  ${totalProfit.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {profitMargin.toFixed(1)}% margin
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <PiggyBank className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Outstanding</p>
                <p className="text-2xl font-bold text-orange-600">
                  ${paymentStatus.outstanding.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  ${paymentStatus.overdue.toLocaleString()} overdue
                </p>
              </div>
              <div className="p-2 bg-orange-100 rounded-full">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue vs Expenses Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span>Revenue vs Expenses</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="revenue" fill={COLORS.revenue} name="Revenue" />
                  <Bar dataKey="expenses" fill={COLORS.expenses} name="Expenses" />
                  <Line 
                    type="monotone" 
                    dataKey="profit" 
                    stroke={COLORS.profit} 
                    strokeWidth={3}
                    name="Profit"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Expense Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-red-600" />
              <span>Expense Breakdown</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expenseBreakdown.map((expense, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      {expense.category}
                    </span>
                    <div className="text-right">
                      <span className="text-sm font-bold text-gray-900">
                        ${expense.amount.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        {expense.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${expense.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profitability by Claim Type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PiggyBank className="h-5 w-5 text-green-600" />
              <span>Profitability by Claim Type</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={profitabilityByType}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="claimType" />
                  <YAxis />
                  <Tooltip 
                    content={<CustomTooltip />}
                    formatter={(value, name) => [
                      name === 'margin' ? `${value}%` : `$${value?.toLocaleString()}`,
                      name === 'margin' ? 'Margin' : name === 'revenue' ? 'Revenue' : 'Cost'
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill={COLORS.revenue} name="Revenue" />
                  <Bar dataKey="cost" fill={COLORS.expenses} name="Cost" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Cash Flow Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span>Cash Flow Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cashFlow}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="inflow"
                    stackId="1"
                    stroke={COLORS.revenue}
                    fill={COLORS.revenue}
                    fillOpacity={0.6}
                    name="Cash Inflow"
                  />
                  <Area
                    type="monotone"
                    dataKey="outflow"
                    stackId="1"
                    stroke={COLORS.expenses}
                    fill={COLORS.expenses}
                    fillOpacity={0.6}
                    name="Cash Outflow"
                  />
                  <Line
                    type="monotone"
                    dataKey="netFlow"
                    stroke={COLORS.profit}
                    strokeWidth={3}
                    name="Net Flow"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};