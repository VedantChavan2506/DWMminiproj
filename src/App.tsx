import React, { useState, useCallback, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { AdminSidebar } from './components/layout/AdminSidebar';
import { ManagerNavigationItem, AdminNavigationItem, UserRole } from './types';

// Business-facing pages (Bank Manager role)
import { DashboardPage } from './pages/DashboardPage';
import { CustomerAssessmentPage } from './pages/CustomerAssessmentPage';
import { CampaignExplorerPage } from './pages/CampaignExplorerPage';
import { HelpPage } from './pages/HelpPage';

// Technical & DWM evaluation pages (Admin role)
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';

// Login page
import { LoginPage } from './pages/LoginPage';

// ProjectInfoModal
import { ProjectInfoModal } from './pages/ProjectInfoModal';

const AUTH_STORAGE_KEY = 'bank_auth_session';

export const App: React.FC = () => {
  // Authentication state with localStorage persistence
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return Boolean(parsed.isAuthenticated);
      }
    } catch (e) {
      console.error('Failed to parse auth session:', e);
    }
    return false;
  });

  const [userRole, setUserRole] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.role === 'ADMIN' ? 'ADMIN' : 'BANK_MANAGER';
      }
    } catch (e) {
      // ignore
    }
    return 'BANK_MANAGER';
  });

  const [displayName, setDisplayName] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.displayName || 'Bank Manager';
      }
    } catch (e) {
      // ignore
    }
    return 'Bank Manager';
  });

  // Active page state for Bank Manager
  const [managerPage, setManagerPage] = useState<ManagerNavigationItem>('dashboard');

  // Active section state for Admin
  const [adminPage, setAdminPage] = useState<AdminNavigationItem>('tech-overview');

  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [isProjectInfoOpen, setIsProjectInfoOpen] = useState<boolean>(false);

  const handleLogin = useCallback((name: string, role: UserRole) => {
    const finalName = name || (role === 'ADMIN' ? 'Administrator' : 'Bank Manager');
    setDisplayName(finalName);
    setUserRole(role);
    setIsAuthenticated(true);
    if (role === 'ADMIN') {
      setAdminPage('tech-overview');
    } else {
      setManagerPage('dashboard');
    }
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ isAuthenticated: true, displayName: finalName, role })
    );
  }, []);

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false);
    setUserRole('BANK_MANAGER');
    setDisplayName('Bank Manager');
    setManagerPage('dashboard');
    setAdminPage('tech-overview');
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }, []);

  const handleManagerNavigate = (page: ManagerNavigationItem) => {
    setManagerPage(page);
    setMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminNavigate = (page: AdminNavigationItem) => {
    setAdminPage(page);
    setMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render business page for Bank Manager
  const renderManagerPage = () => {
    switch (managerPage) {
      case 'dashboard':
        return <DashboardPage onNavigate={handleManagerNavigate} />;
      case 'assessment':
        return <CustomerAssessmentPage />;
      case 'explorer':
        return <CampaignExplorerPage />;
      case 'help':
        return <HelpPage />;
      default:
        return <DashboardPage onNavigate={handleManagerNavigate} />;
    }
  };

  // 1. If not authenticated, render LoginPage
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // 2. If authenticated as ADMIN, render Admin Technical Dashboard
  if (userRole === 'ADMIN') {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-[#070d19] text-slate-900 dark:text-slate-100 flex transition-colors">
        {/* Desktop Admin Sidebar */}
        <div className="hidden md:block">
          <AdminSidebar
            currentPage={adminPage}
            onNavigate={handleAdminNavigate}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            adminName={displayName}
            onLogout={handleLogout}
          />
        </div>

        {/* Mobile Admin Sidebar Overlay */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="relative z-10 w-64">
              <AdminSidebar
                currentPage={adminPage}
                onNavigate={handleAdminNavigate}
                collapsed={false}
                onToggleCollapse={() => setMobileSidebarOpen(false)}
                adminName={displayName}
                onLogout={handleLogout}
              />
            </div>
          </div>
        )}

        {/* Admin Main Content Area */}
        <div
          className={`flex-1 transition-all duration-300 min-w-0 flex flex-col ${
            sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
          }`}
        >
          <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#0b1222]/95 backdrop-blur-sm border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-8 py-3.5 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="md:hidden p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                  Technical Administration Center
                </h1>
                <p className="text-xs text-slate-500">
                  Role: <span className="font-semibold text-indigo-500">System Administrator</span> &bull; Verified Implementation
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:border-red-400 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-red-500 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
            <AdminDashboardPage activeTab={adminPage} onNavigate={handleAdminNavigate} />
          </main>
        </div>
      </div>
    );
  }

  // 3. Authenticated as BANK_MANAGER, render Business Manager Dashboard
  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 flex transition-colors">
      {/* Desktop Manager Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          currentPage={managerPage}
          onNavigate={handleManagerNavigate}
          onOpenProjectInfo={() => setIsProjectInfoOpen(true)}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          managerName={displayName}
          onLogout={handleLogout}
        />
      </div>

      {/* Mobile Manager Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-10 w-64">
            <Sidebar
              currentPage={managerPage}
              onNavigate={handleManagerNavigate}
              onOpenProjectInfo={() => {
                setMobileSidebarOpen(false);
                setIsProjectInfoOpen(true);
              }}
              collapsed={false}
              onToggleCollapse={() => setMobileSidebarOpen(false)}
              managerName={displayName}
              onLogout={handleLogout}
            />
          </div>
        </div>
      )}

      {/* Main Content Area for Bank Manager */}
      <div
        className={`flex-1 transition-all duration-300 min-w-0 flex flex-col ${
          sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
        }`}
      >
        <Header
          currentPage={managerPage}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onNavigate={handleManagerNavigate}
          managerName={displayName}
        />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {renderManagerPage()}
        </main>
      </div>

      {/* Project Info Modal */}
      <ProjectInfoModal
        isOpen={isProjectInfoOpen}
        onClose={() => setIsProjectInfoOpen(false)}
      />
    </div>
  );
};

export default App;
