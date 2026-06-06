import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { GuestRoute } from '@/components/auth/GuestRoute'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { LoginPage } from '@/pages/auth/LoginPage'
import { SignupPage } from '@/pages/auth/SignupPage'
import { BranchesPage } from '@/pages/branches/BranchesPage'
import { CoursesPage } from '@/pages/courses/CoursesPage'
import { SectionsPage } from '@/pages/sections/SectionsPage'
import { AdmissionsPage } from '@/pages/admissions/AdmissionsPage'
import { EnquiriesPage } from '@/pages/enquiries/EnquiriesPage'
import { LeadsPage } from '@/pages/leads/LeadsPage'
import { StudentsPage } from '@/pages/students/StudentsPage'
import { UsersPage } from '@/pages/users/UsersPage'
import { PlaceholderPage } from '@/pages/PlaceholderPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Navigate to="/enquiries" replace />} />
            <Route
              path="/dashboard"
              element={
                <PlaceholderPage
                  title="Dashboard"
                  description="Overview of your institution's key metrics and activity."
                />
              }
            />
            <Route path="/leads" element={<LeadsPage />} />
            <Route path="/enquiries" element={<EnquiriesPage />} />
            <Route path="/admissions" element={<AdmissionsPage />} />
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/branches" element={<BranchesPage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/batches" element={<SectionsPage />} />
            <Route path="/sections" element={<Navigate to="/batches" replace />} />
            <Route path="/users" element={<UsersPage />} />
            <Route
              path="/fees"
              element={
                <PlaceholderPage
                  title="Fees"
                  description="Fee collection, tracking, and management."
                />
              }
            />
            <Route
              path="/reports"
              element={
                <PlaceholderPage
                  title="Reports"
                  description="Analytics and institutional reports."
                />
              }
            />
            <Route
              path="/calendar"
              element={
                <PlaceholderPage
                  title="Calendar"
                  description="Schedule and manage institutional events."
                />
              }
            />
            <Route
              path="/settings"
              element={
                <PlaceholderPage
                  title="Settings"
                  description="Configure your Klass360 portal."
                />
              }
            />
            <Route
              path="/support"
              element={
                <PlaceholderPage
                  title="Support"
                  description="Get help and contact our support team."
                />
              }
            />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
