import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { FileText, Users, DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react'

interface StatsData {
  totalClaims: number
  activeClaims: number
  settledClaims: number
  totalClients: number
  totalValue: number
  settledValue: number
}

interface DashboardStatsProps {
  data: StatsData
}

export function DashboardStats({ data }: DashboardStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const stats = [
    {
      title: 'Total Claims',
      value: data.totalClaims.toString(),
      icon: FileText,
      description: 'All time claims',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Active Claims',
      value: data.activeClaims.toString(),
      icon: Clock,
      description: 'Currently processing',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Settled Claims',
      value: data.settledClaims.toString(),
      icon: CheckCircle,
      description: 'Successfully closed',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Total Clients',
      value: data.totalClients.toString(),
      icon: Users,
      description: 'Active client base',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Total Claim Value',
      value: formatCurrency(data.totalValue),
      icon: DollarSign,
      description: 'Aggregate claim value',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Settled Value',
      value: formatCurrency(data.settledValue),
      icon: TrendingUp,
      description: 'Successfully recovered',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}