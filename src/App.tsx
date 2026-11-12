import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { SettingsProvider } from '@/context/SettingsContext';
import { DashboardDataProvider } from '@/context/DashboardDataContext';
import TradingLayout from '@/components/TradingLayout';
import ErrorBoundary from '@/components/ErrorBoundary';
import PublicLayout from '@/components/PublicLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import ProtectedAdminRoute from '@/components/ProtectedAdminRoute';

import HomePage from '@/pages/HomePage';
import MarketsPage from '@/pages/MarketsPage';
import TradingPage from '@/pages/TradingPage';
import PortfolioPage from '@/pages/PortfolioPage';
import WalletPage from '@/pages/WalletPage';
import TradingDashboard from '@/pages/TradingDashboard';
import TradingWallet from '@/pages/TradingWallet';
import TradingPortfolio from '@/pages/TradingPortfolio';
import TradingPositions from '@/pages/TradingPositions';
import TradingOrders from '@/pages/TradingOrders';
import TradingReports from '@/pages/TradingReports';
import ProfilePage from '@/pages/ProfilePage';
import { LoginPage, SignupPage, ForgotPasswordPage } from '@/pages/AuthPages';
import AdminLoginPage from '@/pages/AdminLoginPage';

import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminContent from '@/pages/admin/AdminContent';
import AdminMarkets from '@/pages/admin/AdminMarkets';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminAnnouncements from '@/pages/admin/AdminAnnouncements';
import AdminFAQs from '@/pages/admin/AdminFAQs';
import AdminBlog from '@/pages/admin/AdminBlog';
import AdminAuditLogs from '@/pages/admin/AdminAuditLogs';
import AdminNotifications from '@/pages/admin/AdminNotifications';
import AdminSettings from '@/pages/admin/AdminSettings';
import ControlPanel from '@/pages/admin/ControlPanel';
import AdminSupport from '@/pages/admin/AdminSupport';
import SupportLauncher from '@/components/support/SupportLauncher';

function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-6xl font-bold text-brand-500 mb-4">404</p>
        <h1 className="text-2xl font-bold text-white mb-2">Page Not Found</h1>
        <p className="text-dark-400 mb-6">The page you're looking for doesn't exist or has been moved.</p>
        <a href="/" className="btn-primary inline-block">Back to Home</a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <SettingsProvider>
          <AuthProvider>
            <DashboardDataProvider>
              <Routes>
              {/* Auth pages (no layout) */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              {/* Public pages (with navbar + footer) */}
              <Route
                path="/"
                element={
                  <PublicLayout>
                    <HomePage />
                  </PublicLayout>
                }
              />
              <Route
                path="/markets"
                element={
                  <PublicLayout>
                    <MarketsPage />
                  </PublicLayout>
                }
              />
              <Route
                path="/trade/:pair"
                element={
                  <PublicLayout>
                    <TradingPage />
                  </PublicLayout>
                }
              />

              {/* Trading dashboard pages */}
              <Route path="/dashboard" element={<ProtectedRoute><TradingLayout><TradingDashboard /></TradingLayout></ProtectedRoute>} />
              <Route path="/positions" element={<ProtectedRoute><TradingLayout><TradingPositions /></TradingLayout></ProtectedRoute>} />
              <Route path="/holdings" element={<ProtectedRoute><TradingLayout><TradingPortfolio /></TradingLayout></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><TradingLayout><TradingOrders /></TradingLayout></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><TradingLayout><TradingReports /></TradingLayout></ProtectedRoute>} />

              {/* Protected user pages */}
              <Route
                path="/portfolio"
                element={
                  <ProtectedRoute>
                    <PublicLayout>
                      <PortfolioPage />
                    </PublicLayout>
                  </ProtectedRoute>
                }
              />
              <Route path="/wallet" element={<ProtectedRoute><TradingLayout><TradingWallet /></TradingLayout></ProtectedRoute>} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <PublicLayout>
                      <ProfilePage />
                    </PublicLayout>
                  </ProtectedRoute>
                }
              />

              {/* Admin pages (protected + admin layout) */}
              <Route
                path="/admin"
                element={
                  <ProtectedAdminRoute>
                    <AdminDashboard />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/content"
                element={
                  <ProtectedAdminRoute>
                    <AdminContent />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/markets"
                element={
                  <ProtectedAdminRoute>
                    <AdminMarkets />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedAdminRoute>
                    <AdminUsers />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/announcements"
                element={
                  <ProtectedAdminRoute>
                    <AdminAnnouncements />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/faqs"
                element={
                  <ProtectedAdminRoute>
                    <AdminFAQs />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/blog"
                element={
                  <ProtectedAdminRoute>
                    <AdminBlog />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/audit"
                element={
                  <ProtectedAdminRoute>
                    <AdminAuditLogs />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/notifications"
                element={
                  <ProtectedAdminRoute>
                    <AdminNotifications />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <ProtectedAdminRoute>
                    <AdminSettings />
                  </ProtectedAdminRoute>
                }
              />

              <Route
                path="/admin/support"
                element={
                  <ProtectedAdminRoute>
                    <AdminSupport />
                  </ProtectedAdminRoute>
                }
              />

              <Route path="/admin/control-panel" element={<ProtectedAdminRoute><ControlPanel /></ProtectedAdminRoute>} />

              {/* 404 */}
              <Route
                path="*"
                element={
                  <PublicLayout>
                    <NotFoundPage />
                  </PublicLayout>
                }
              />
            </Routes>
            <SupportLauncher />
            </DashboardDataProvider>
          </AuthProvider>
        </SettingsProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
