import { lazy, Suspense } from 'react'
import { BrowserRouter, HashRouter, Route, Routes } from 'react-router'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import { ScrollManager } from './components/ScrollManager'
import { SiteLayout } from './components/layout/SiteLayout'
import { PageLoader } from './components/Skeletons'
import Home from './pages/Home'
import Work from './pages/Work'
import ProjectDetail from './pages/ProjectDetail'
import NotFound from './pages/NotFound'

// The admin panel loads only when someone opens /admin.
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'))
const Dashboard = lazy(() => import('./pages/admin/Dashboard'))
const ProjectsList = lazy(() => import('./pages/admin/ProjectsList'))
const ProjectEditor = lazy(() => import('./pages/admin/ProjectEditor'))
const ServicesAdmin = lazy(() => import('./pages/admin/ServicesAdmin'))
const ClientsAdmin = lazy(() => import('./pages/admin/ClientsAdmin'))
const TechAdmin = lazy(() => import('./pages/admin/TechAdmin'))
const ContentAdmin = lazy(() => import('./pages/admin/ContentAdmin'))
const PublishAdmin = lazy(() => import('./pages/admin/PublishAdmin'))
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'))
const CredentialsAdmin = lazy(() => import('./pages/admin/CredentialsAdmin'))

const Router = __HASH_ROUTER__ ? HashRouter : BrowserRouter

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Router>
          <ScrollManager />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route element={<SiteLayout />}>
                <Route index element={<Home />} />
                <Route path="work" element={<Work />} />
                <Route path="work/:slug" element={<ProjectDetail />} />
                <Route path="*" element={<NotFound />} />
              </Route>
              <Route path="admin/login" element={<AdminLogin />} />
              <Route path="admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="projects" element={<ProjectsList />} />
                <Route path="projects/new" element={<ProjectEditor />} />
                <Route path="projects/:id" element={<ProjectEditor />} />
                <Route path="services" element={<ServicesAdmin />} />
                <Route path="clients" element={<ClientsAdmin />} />
                <Route path="technologies" element={<TechAdmin />} />
                <Route path="content" element={<ContentAdmin />} />
                <Route path="publish" element={<PublishAdmin />} />
                <Route path="settings" element={<CredentialsAdmin />} />
              </Route>
            </Routes>
          </Suspense>
        </Router>
      </ToastProvider>
    </ThemeProvider>
  )
}
