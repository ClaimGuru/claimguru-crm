import React, { Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import ToastContainer from './components/ui/ToastContainer'
import { AuthPage } from './pages/AuthPage'
import { AuthCallback } from './pages/AuthCallback'
import ClientManagement from './pages/ClientManagement'
import LeadManagement from './pages/LeadManagement'
// AI Insights removed for manual wizard
import { Finance } from './pages/Finance'
import { Vendors } from './pages/Vendors'
import Communications from './pages/Communications'
import { Properties } from './pages/Properties'
import { Tasks } from './pages/Tasks'
import { Settlements } from './pages/Settlements'
import { TestClaims } from './pages/TestClaims'
import { DirectFeatureTest } from './pages/DirectFeatureTest'
import Insurers from './pages/Insurers'
import Notifications from './pages/Notifications'
import Settings from './pages/Settings'
import { AdminPanel } from './pages/AdminPanel'
import Calendar from './pages/Calendar'
import Integrations from './pages/Integrations'
import { Layout } from './components/layout/Layout'
import { LoadingSpinner } from './components/ui/LoadingSpinner'

// Lazy-loaded components for code splitting (handling named exports)
const Dashboard = React.lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const Claims = React.lazy(() => import('./pages/Claims').then(module => ({ default: module.Claims })));
const Clients = React.lazy(() => import('./pages/Clients').then(module => ({ default: module.Clients })));
const Documents = React.lazy(() => import('./pages/Documents').then(module => ({ default: module.Documents })));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Demo mode: Allow access without authentication for testing
  // if (!user) {
  //   return <Navigate to="/auth" replace />
  // }

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
        <Route path="dashboard" element={
          <Suspense fallback={<LoadingSpinner />}>
            <Dashboard />
          </Suspense>
        } />
        <Route path="claims" element={
          <Suspense fallback={<LoadingSpinner />}>
            <Claims />
          </Suspense>
        } />
        <Route path="claims/new" element={
          <Suspense fallback={<LoadingSpinner />}>
            <Claims />
          </Suspense>
        } />
        <Route path="test-claims" element={<TestClaims />} />
        <Route path="direct-feature-test" element={<DirectFeatureTest />} />
        <Route path="clients" element={
          <Suspense fallback={<LoadingSpinner />}>
            <Clients />
          </Suspense>
        } />
        <Route path="client-management" element={<ClientManagement />} />
        <Route path="lead-management" element={<LeadManagement />} />
        <Route path="sales-pipeline" element={<div className="p-6"><h1 className="text-2xl font-bold">Sales Pipeline</h1><p>Interactive sales pipeline visualization coming soon...</p></div>} />
        <Route path="lead-sources" element={<div className="p-6"><h1 className="text-2xl font-bold">Lead Sources</h1><p>Lead source management and analytics coming soon...</p></div>} />
        <Route path="referrals" element={<div className="p-6"><h1 className="text-2xl font-bold">Referral Program</h1><p>Client referral program management coming soon...</p></div>} />
        <Route path="properties" element={<Properties />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="documents" element={
          <Suspense fallback={<LoadingSpinner />}>
            <Documents />
          </Suspense>
        } />
        <Route path="communications" element={<Communications />} />
        <Route path="vendors" element={<Vendors />} />
        <Route path="insurers" element={<Insurers />} />
        <Route path="settlements" element={<Settlements />} />
        <Route path="financial" element={<Finance />} />
        <Route path="finance" element={<Finance />} />
        {/* AI Insights route removed for manual wizard */}
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