import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import ToastContainer from './components/ui/ToastContainer'
import { AuthPage } from './pages/AuthPage'
import { AuthCallback } from './pages/AuthCallback'
import { Dashboard } from './pages/Dashboard'
import { Claims } from './pages/Claims'
import { Clients } from './pages/Clients'
import { AIInsights } from './pages/AIInsights'
import { Finance } from './pages/Finance'
import { Vendors } from './pages/Vendors'
import { Communications } from './pages/Communications'
import { Documents } from './pages/Documents'
import { Properties } from './pages/Properties'
import { Tasks } from './pages/Tasks'
import { Settlements } from './pages/Settlements'
import Insurers from './pages/Insurers'
import Notifications from './pages/Notifications'
import Settings from './pages/Settings'
import { AdminPanel } from './pages/AdminPanel'
import Calendar from './pages/Calendar'
import Integrations from './pages/Integrations'
import { Layout } from './components/layout/Layout'
import { LoadingSpinner } from './components/ui/LoadingSpinner'

// Protected Route Component
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
    return <Navigate to="/auth" replace />
  }

  return <>{children}</>
}

// Auth Route Component
function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route
        path="/auth"
        element={
          <AuthRoute>
            <AuthPage />
          </AuthRoute>
        }
      />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="claims" element={<Claims />} />
        <Route path="clients" element={<Clients />} />
        <Route path="properties" element={<Properties />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="documents" element={<Documents />} />
        <Route path="communications" element={<Communications />} />
        <Route path="vendors" element={<Vendors />} />
        <Route path="insurers" element={<Insurers />} />
        <Route path="settlements" element={<Settlements />} />
        <Route path="financial" element={<Finance />} />
        <Route path="finance" element={<Finance />} />
        <Route path="ai-insights" element={<AIInsights />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="integrations" element={<Integrations />} />
        <Route path="analytics" element={<div className="p-6"><h1 className="text-2xl font-bold">Analytics</h1><p>Advanced analytics dashboard coming soon...</p></div>} />
        <Route path="settings" element={<Settings />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="admin" element={<AdminPanel />} />
        <Route path="help" element={<div className="p-6"><h1 className="text-2xl font-bold">Help & Support</h1><p>Help center coming soon...</p></div>} />
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <div className="App">
            <AppRoutes />
            <ToastContainer />
          </div>
        </Router>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App