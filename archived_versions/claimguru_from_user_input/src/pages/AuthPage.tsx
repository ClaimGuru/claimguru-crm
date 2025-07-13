import React, { useState } from 'react'
import { LoginForm } from '../components/auth/LoginForm'
import { SignupForm } from '../components/auth/SignupForm'
import { FileText, Shield, Smartphone, Brain, TrendingUp, Users } from 'lucide-react'

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Analysis',
      description: 'Advanced AI analyzes documents and predicts claim outcomes'
    },
    {
      icon: Smartphone,
      title: 'Mobile-First Design',
      description: 'Access your CRM anywhere with our mobile-optimized interface'
    },
    {
      icon: FileText,
      title: 'Smart Document Management',
      description: 'Intelligent categorization and OCR for all your documents'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-level security with multi-tenant data isolation'
    },
    {
      icon: TrendingUp,
      title: 'Advanced Analytics',
      description: 'Real-time dashboards and predictive business intelligence'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Seamless communication and task management for your team'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            ClaimGuru
          </h1>
          <p className="text-xl text-gray-600">
            The Most Advanced Public Insurance Adjuster CRM
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Features Section */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Revolutionize Your Claims Management
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Built specifically for public insurance adjusters, ClaimGuru combines 
                cutting-edge AI technology with intuitive design to streamline your 
                entire claims process.
              </p>
            </div>

            <div className="grid gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Icon className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                🚀 Free 30-Day Trial
              </h3>
              <p className="text-gray-600">
                Start your free trial today - no credit card required. 
                Experience the future of claims management.
              </p>
            </div>
          </div>

          {/* Auth Form Section */}
          <div className="flex justify-center">
            {isLogin ? (
              <LoginForm onToggleMode={() => setIsLogin(false)} />
            ) : (
              <SignupForm onToggleMode={() => setIsLogin(true)} />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-500">
          <p className="text-sm">
            © 2024 ClaimGuru. All rights reserved. 
            Built for public insurance adjusters by industry experts.
          </p>
        </div>
      </div>
    </div>
  )
}