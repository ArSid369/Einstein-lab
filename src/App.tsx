import React from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { AppShell } from './components/shared/AppShell';

// Shared Pages (3)
import { LoginPage } from './pages/shared/LoginPage';
import { NotificationsPage } from './pages/shared/NotificationsPage';
import { ProfileSettingsPage } from './pages/shared/ProfileSettingsPage';

// SME Pages (9)
import { SmeDashboardPage } from './pages/sme/SmeDashboardPage';
import { SmeDomainsPage } from './pages/sme/SmeDomainsPage';
import { SmeDomainDetailsPage } from './pages/sme/SmeDomainDetailsPage';
import { SmeDomainFormPage } from './pages/sme/SmeDomainFormPage';
import { SmeTaskEditorPage } from './pages/sme/SmeTaskEditorPage';
import { SmeContentPage } from './pages/sme/SmeContentPage';
import { SmeAssessmentsPage } from './pages/sme/SmeAssessmentsPage';
import { SmeAssessmentBuilderPage } from './pages/sme/SmeAssessmentBuilderPage';
import { SmeReportsPage } from './pages/sme/SmeReportsPage';

// Associate Pages (9)
import { PreAssessmentIntroPage } from './pages/associate/PreAssessmentIntroPage';
import { AssessmentRunnerPage } from './pages/associate/AssessmentRunnerPage';
import { AssessmentResultsPage } from './pages/associate/AssessmentResultsPage';
import { AssociateDashboardPage } from './pages/associate/AssociateDashboardPage';
import { LearningPathPage } from './pages/associate/LearningPathPage';
import { ModuleDetailsPage } from './pages/associate/ModuleDetailsPage';
import { CodingWorkspacePage } from './pages/associate/CodingWorkspacePage';
import { AssessmentHistoryPage } from './pages/associate/AssessmentHistoryPage';
import { ProgressTrackingPage } from './pages/associate/ProgressTrackingPage';

const ProtectedLayout: React.FC = () => {
  const { currentUser } = useApp();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
};

const RoleGuard: React.FC<{
  allowedRoles: Array<'SME' | 'ASSOCIATE'>;
}> = ({ allowedRoles }) => {
  const { currentUser } = useApp();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  if (!allowedRoles.includes(currentUser.role)) {
    return (
      <Navigate
        to={currentUser.role === 'SME' ? '/sme/dashboard' : '/associate/dashboard'}
        replace
      />
    );
  }
  return <Outlet />;
};

const RootRedirect: React.FC = () => {
  const { currentUser } = useApp();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role === 'SME') return <Navigate to="/sme/dashboard" replace />;
  if (currentUser.isFirstTimeAssociate) return <Navigate to="/associate/pre-assessment" replace />;
  return <Navigate to="/associate/dashboard" replace />;
};

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Persistent Authenticated Shell across all SME, Associate, and Shared routes */}
          <Route element={<ProtectedLayout />}>
            {/* Shared Routes */}
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/profile" element={<ProfileSettingsPage />} />

            {/* SME Routes */}
            <Route element={<RoleGuard allowedRoles={['SME']} />}>
              <Route path="/sme/dashboard" element={<SmeDashboardPage />} />
              <Route path="/sme/domains" element={<SmeDomainsPage />} />
              <Route path="/sme/domains/new" element={<SmeDomainFormPage />} />
              <Route path="/sme/domains/:domainId" element={<SmeDomainDetailsPage />} />
              <Route path="/sme/domains/:domainId/edit" element={<SmeDomainFormPage />} />
              <Route path="/sme/tasks" element={<SmeTaskEditorPage />} />
              <Route path="/sme/tasks/:taskId" element={<SmeTaskEditorPage />} />
              <Route path="/sme/content" element={<SmeContentPage />} />
              <Route path="/sme/assessments" element={<SmeAssessmentsPage />} />
              <Route path="/sme/assessments/new" element={<SmeAssessmentBuilderPage />} />
              <Route path="/sme/assessments/:assessmentId/edit" element={<SmeAssessmentBuilderPage />} />
              <Route path="/sme/reports" element={<SmeReportsPage />} />
            </Route>

            {/* Shared Runner/Results Previewable by SME + Associate */}
            <Route element={<RoleGuard allowedRoles={['ASSOCIATE', 'SME']} />}>
              <Route path="/associate/assessment/:assessmentId" element={<AssessmentRunnerPage />} />
              <Route path="/associate/results/:resultId" element={<AssessmentResultsPage />} />
            </Route>

            {/* Associate Routes */}
            <Route element={<RoleGuard allowedRoles={['ASSOCIATE']} />}>
              <Route path="/associate/pre-assessment" element={<PreAssessmentIntroPage />} />
              <Route path="/associate/dashboard" element={<AssociateDashboardPage />} />
              <Route path="/associate/learning-path" element={<LearningPathPage />} />
              <Route path="/associate/modules/:moduleId" element={<ModuleDetailsPage />} />
              <Route path="/associate/workspace" element={<CodingWorkspacePage />} />
              <Route path="/associate/workspace/:taskId" element={<CodingWorkspacePage />} />
              <Route path="/associate/assessments" element={<AssessmentHistoryPage />} />
              <Route path="/associate/progress" element={<ProgressTrackingPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
