import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { 
  PieChart, 
  BarChart3, 
  TrendingUp, 
  Target,
  Calculator,
  DollarSign
} from 'lucide-react'

interface FinanceAnalyticsProps {
  stats: any
}

export function FinanceAnalytics({ stats }: FinanceAnalyticsProps) {
  if (!stats) {
    return (
      <div className="text-center py-8 text-gray-500">
        No analytics data available
      </div>
    )
  }

  const profitMargin = stats.totalRevenue > 0 ? (stats.netProfit / stats.totalRevenue * 100) : 0
  const expenseRatio = stats.totalRevenue > 0 ? (stats.totalExpenses / stats.totalRevenue * 100) : 0
  const collectionRate = (stats.totalRevenue + stats.outstandingFees) > 0 ? 
    (stats.totalRevenue / (stats.totalRevenue + stats.outstandingFees) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Profit Margin</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className={`text-3xl font-bold ${
                profitMargin >= 20 ? 'text-green-600' :
                profitMargin >= 10 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {profitMargin.toFixed(1)}%
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Industry target: 15-25%
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <div 
                  className={`h-2 rounded-full ${
                    profitMargin >= 20 ? 'bg-green-600' :
                    profitMargin >= 10 ? 'bg-yellow-600' :
                    'bg-red-600'
                  }`}
                  style={{ width: `${Math.min(profitMargin, 100)}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calculator className="h-5 w-5" />
              <span>Expense Ratio</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className={`text-3xl font-bold ${
                expenseRatio <= 60 ? 'text-green-600' :
                expenseRatio <= 80 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {expenseRatio.toFixed(1)}%
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Target: Under 70%
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <div 
                  className={`h-2 rounded-full ${
                    expenseRatio <= 60 ? 'bg-green-600' :
                    expenseRatio <= 80 ? 'bg-yellow-600' :
                    'bg-red-600'
                  }`}
                  style={{ width: `${Math.min(expenseRatio, 100)}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Collection Rate</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className={`text-3xl font-bold ${
                collectionRate >= 90 ? 'text-green-600' :
                collectionRate >= 75 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {collectionRate.toFixed(1)}%
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Target: Above 85%
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <div 
                  className={`h-2 rounded-full ${
                    collectionRate >= 90 ? 'bg-green-600' :
                    collectionRate >= 75 ? 'bg-yellow-600' :
                    'bg-red-600'
                  }`}
                  style={{ width: `${Math.min(collectionRate, 100)}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5" />
              <span>Revenue by Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.revenueByStatus?.map((item, index) => {
                const percentage = stats.totalRevenue > 0 ? (item.amount / stats.totalRevenue * 100) : 0
                const colors = ['bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-blue-500', 'bg-purple-500']
                const color = colors[index % colors.length]
                
                return (
                  <div key={item.status} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${color}`}></div>
                      <span className="text-sm font-medium capitalize">
                        {item.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        ${item.amount.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                )
              }) || (
                <p className="text-gray-500 text-center py-4">No revenue data</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Expenses by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Expenses by Category</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.expensesByCategory?.map((item, index) => {
                const percentage = stats.totalExpenses > 0 ? (item.amount / stats.totalExpenses * 100) : 0
                const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-purple-500']
                const color = colors[index % colors.length]
                
                return (
                  <div key={item.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full ${color}`}></div>
                        <span className="text-sm font-medium">
                          {item.category}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          ${item.amount.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${color}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )
              }) || (
                <p className="text-gray-500 text-center py-4">No expense data</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Claims */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Top Performing Claims</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">File Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue Generated</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Percentage of Total</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.topPerformingClaims?.map((claim, index) => {
                  const percentage = stats.totalRevenue > 0 ? (claim.revenue / stats.totalRevenue * 100) : 0
                  return (
                    <tr key={claim.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {claim.file_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                        ${claim.revenue.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {percentage.toFixed(1)}%
                      </td>
                    </tr>
                  )
                }) || (
                  <tr>
                    <td colSpan={3} className="text-center py-8 text-gray-500">
                      No claims data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Financial Health Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Financial Health Score</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            {(() => {
              const profitScore = profitMargin >= 20 ? 100 : profitMargin >= 10 ? 70 : 40
              const expenseScore = expenseRatio <= 60 ? 100 : expenseRatio <= 80 ? 70 : 40
              const collectionScore = collectionRate >= 90 ? 100 : collectionRate >= 75 ? 70 : 40
              const overallScore = Math.round((profitScore + expenseScore + collectionScore) / 3)
              
              return (
                <>
                  <div className={`text-5xl font-bold mb-4 ${
                    overallScore >= 80 ? 'text-green-600' :
                    overallScore >= 60 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {overallScore}
                  </div>
                  <p className="text-lg font-medium mb-2">
                    {overallScore >= 80 ? 'Excellent' :
                     overallScore >= 60 ? 'Good' :
                     overallScore >= 40 ? 'Fair' : 'Poor'} Financial Health
                  </p>
                  <p className="text-sm text-gray-500 mb-6">
                    Based on profit margin, expense ratio, and collection rate
                  </p>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${
                        profitScore >= 80 ? 'text-green-600' :
                        profitScore >= 60 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {profitScore}
                      </div>
                      <p className="text-gray-600">Profitability</p>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${
                        expenseScore >= 80 ? 'text-green-600' :
                        expenseScore >= 60 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {expenseScore}
                      </div>
                      <p className="text-gray-600">Cost Control</p>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${
                        collectionScore >= 80 ? 'text-green-600' :
                        collectionScore >= 60 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {collectionScore}
                      </div>
                      <p className="text-gray-600">Collections</p>
                    </div>
                  </div>
                </>
              )
            })()
            }
          </div>
        </CardContent>
      </Card>
    </div>
  )
}