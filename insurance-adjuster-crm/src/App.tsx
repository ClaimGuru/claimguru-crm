import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { LoginForm } from './components/auth/LoginForm'
import { Layout } from './components/layout/Layout'
import { Dashboard } from './pages/Dashboard'
import { Claims } from './pages/Claims'
import { Clients } from './pages/Clients'
import { Billing } from './pages/Billing'
import { ClientPortal } from './pages/ClientPortal'
import { LoadingSpinner } from './components/ui/LoadingSpinner'
import './globals.css'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }
  
  if (!user) {
    return <LoginForm />
  }
  
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/portal" element={<ClientPortal />} />
      
      {/* Protected Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="claims" element={<Claims />} />
        <Route path="clients" element={<Clients />} />
        <Route path="billing" element={<Billing />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </AuthProvider>
    </Router>
  )
}