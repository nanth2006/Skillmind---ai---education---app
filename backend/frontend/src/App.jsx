import { BrowserRouter, Routes, Route } from "react-router-dom"

// Auth / Landing
import Front from "./pages/Front"
import Login from "./pages/Login"
import Register from "./pages/Register"
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/ResetPassword"
import Home from "./pages/Home"

// Profile
import ProfileCreate from "./pages/ProfileCreate"
import ProfilePage from "./pages/ProfliePage"

// Main Pages
import Dashboard from "./pages/Dashboard"
import Courses from "./pages/Courses"
import OnlineCourses from "./pages/OnlineCourses"
import AIChat from "./pages/AIChat"
import Motivation from "./pages/Motivation"
import Payment from "./pages/Payment"

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard"
import UsersPage from "./pages/admin/UsersPage"
import MyCourses from "./pages/admin/MyCourses"
import EnrollmentsPage from "./pages/admin/EnrollmentsPage"
import PaymentsPage from "./pages/admin/PaymentsPage"
import SettingsPage from "./pages/admin/SettingsPage"
import AdminProfile from "./pages/admin/AdminProfile"

// Layout
import AdminLayout from "./Layout/adminLayout"

// Protected Route
import { AdminRoute } from "./components/ProtectedRoutes"

// Global Alert
import AlertContainer from "./components/Alert"

function App() {
  return (
    <BrowserRouter>
      <AlertContainer />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Front />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* User Routes */}
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile-create" element={<ProfileCreate />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/online-courses" element={<OnlineCourses />} />
        <Route path="/ai-chat" element={<AIChat />} />
        <Route path="/motivation" element={<Motivation />} />
        <Route path="/payment" element={<Payment />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route
            index
            element={<AdminDashboard />}
          />

          <Route
            path="users"
            element={<UsersPage />}
          />

          <Route
            path="my-courses"
            element={<MyCourses />}
          />

          <Route
            path="enrollments"
            element={<EnrollmentsPage />}
          />

          <Route
            path="payments"
            element={<PaymentsPage />}
          />

          <Route
            path="profile"
            element={<AdminProfile />}
          />

          <Route
            path="settings"
            element={<SettingsPage />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App