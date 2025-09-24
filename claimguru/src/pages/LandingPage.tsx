import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle, FileText, Zap, Shield, BarChart3, Users, Star, Calendar, MapPin, TrendingUp } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'

export function LandingPage() {
  const features = [
    {
      icon: Zap,
      title: 'AI-Powered Document Analysis',
      description: 'Automatically extract key information from policies, estimates, and claim documents with industry-leading AI technology.'
    },
    {
      icon: FileText,
      title: 'Smart Claims Management',
      description: 'Streamlined claim intake, tracking, and settlement management designed specifically for public adjusters.'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics Dashboard',
      description: 'Real-time insights into your business performance, claim status, and revenue forecasting.'
    },
    {
      icon: Users,
      title: 'Client Portal & Communication',
      description: 'Professional client portal with automated updates and seamless communication tools.'
    },
    {
      icon: Calendar,
      title: 'Integrated Scheduling',
      description: 'Appointment scheduling, inspection management, and automated reminder systems.'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-level security with SOC 2 compliance, encrypted data, and multi-tenant isolation.'
    }
  ]

  const testimonials = [
    {
      name: 'Sarah Martinez',
      company: 'Elite Adjusting Group',
      role: 'Public Adjuster',
      rating: 5,
      content: 'ClaimGuru transformed our business. We\'ve increased our claim processing speed by 300% and improved client satisfaction dramatically.'
    },
    {
      name: 'Michael Thompson',
      company: 'Thompson Public Adjusters',
      role: 'Principal Adjuster',
      rating: 5,
      content: 'The AI document analysis alone saves us 10+ hours per week. The ROI was immediate and substantial.'
    },
    {
      name: 'Jennifer Lee',
      company: 'Metro Claims Solutions',
      role: 'Managing Partner',
      rating: 5,
      content: 'Finally, a CRM built specifically for our industry. The integration with insurance carriers is seamless.'
    }
  ]

  const benefits = [
    'Reduce claim processing time by up to 70%',
    'Increase settlement amounts with better documentation',
    'Automate repetitive tasks and focus on high-value work',
    'Improve client satisfaction with transparent communication',
    'Scale your business without proportional overhead increase',
    'Stay compliant with automatic audit trails and reporting'
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-blue-600">ClaimGuru</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/auth"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Sign In
              </Link>
              <Link to="/auth">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              The Future of
              <span className="text-blue-600 block">Claims Management</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Built exclusively for public insurance adjusters, ClaimGuru combines AI-powered automation 
              with industry expertise to transform how you manage claims, clients, and grow your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/auth">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="px-8 py-3">
                Watch Demo
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              30-day free trial • No credit card required • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Scale Your Practice
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From AI-powered document analysis to comprehensive client management, 
              ClaimGuru provides all the tools you need in one integrated platform.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="p-8 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Proven Results for Public Adjusters
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Join hundreds of successful public adjusters who have transformed 
                their practices with ClaimGuru's industry-leading platform.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-xl p-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">300%</div>
                  <div className="text-sm text-gray-600">Faster Processing</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">25%</div>
                  <div className="text-sm text-gray-600">Higher Settlements</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">50+</div>
                  <div className="text-sm text-gray-600">Hours Saved/Month</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">99%</div>
                  <div className="text-sm text-gray-600">Client Satisfaction</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that fits your practice size and growth goals.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Individual Plan */}
            <Card className="p-8 border-2 border-gray-200 hover:border-blue-300 transition-colors">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Individual</h3>
                <p className="text-gray-600 mb-4">Perfect for solo adjusters</p>
                <div className="text-5xl font-bold text-gray-900 mb-2">
                  $15
                  <span className="text-xl text-gray-600 font-normal">/month</span>
                </div>
                <p className="text-sm text-gray-500">Billed monthly</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Up to 25 active claims</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>AI document analysis</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Client portal access</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Basic reporting</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Email support</span>
                </li>
              </ul>
              
              <Link to="/auth" className="block">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Start Free Trial
                </Button>
              </Link>
            </Card>
            
            {/* Firm Plan */}
            <Card className="p-8 border-2 border-blue-500 relative hover:border-blue-600 transition-colors">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Firm</h3>
                <p className="text-gray-600 mb-4">For growing firms and teams</p>
                <div className="text-5xl font-bold text-gray-900 mb-2">
                  $50
                  <span className="text-xl text-gray-600 font-normal">/month</span>
                </div>
                <p className="text-sm text-gray-500">Billed monthly</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Unlimited claims</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Multiple user accounts</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Advanced AI features</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Custom reporting</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>API access</span>
                </li>
              </ul>
              
              <Link to="/auth" className="block">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Start Free Trial
                </Button>
              </Link>
            </Card>
          </div>
          
          <div className="text-center mt-8">
            <p className="text-gray-600">
              All plans include 30-day free trial. No setup fees. Cancel anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by Leading Public Adjusters
            </h2>
            <p className="text-xl text-gray-600">
              See what industry professionals are saying about ClaimGuru.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                  <div className="text-sm text-gray-500">{testimonial.company}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Practice?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join hundreds of successful public adjusters who have already made the switch to ClaimGuru. 
            Start your free trial today and experience the difference.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/auth">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3">
              Schedule a Demo
            </Button>
          </div>
          
          <p className="text-sm text-blue-200 mt-6">
            30-day free trial • No credit card required • Setup in under 5 minutes
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">ClaimGuru</h3>
              <p className="text-gray-400">
                The most advanced CRM platform built exclusively for public insurance adjusters.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Training</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ClaimGuru. All rights reserved. Built for public insurance adjusters.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}