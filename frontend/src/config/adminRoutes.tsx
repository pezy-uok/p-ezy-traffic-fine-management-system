import type { ReactNode } from 'react'
import AdminLogin from '../pages/AdminLogin'
import AdminLayout from '../layouts/AdminLayout'
import AdminDashboard from '../pages/AdminDashboard'
import AdminFineManagement from '../pages/AdminFineManagement'
import AdminCriminalRecords from '../pages/AdminCriminalRecordsLive'
import AdminNewsManagement from '../pages/AdminNewsManagement'
import AdminUsersManagement from '../pages/AdminUsersManagement'
import AdminAuthGuard from '../components/admin/AdminAuthGuard'

export interface AdminRouteConfig {
  path: string
  element: ReactNode
  name: string
}

const withAdminGuard = (page: ReactNode) => (
  <AdminAuthGuard>
    <AdminLayout>{page}</AdminLayout>
  </AdminAuthGuard>
)

export const adminRoutes: AdminRouteConfig[] = [
  {
    path: '/admin',
    element: <AdminLogin />,
    name: 'Admin Login',
  },
  {
    path: '/admin/dashboard',
    element: withAdminGuard(<AdminDashboard sectionName="Dashboard" />),
    name: 'Admin Dashboard',
  },
  {
    path: '/admin/fines',
    element: withAdminGuard(<AdminFineManagement />),
    name: 'Admin Fines',
  },
  {
    path: '/admin/criminal-records',
    element: withAdminGuard(<AdminCriminalRecords />),
    name: 'Admin Criminal Records',
  },
  {
    path: '/admin/news',
    element: withAdminGuard(<AdminNewsManagement />),
    name: 'Admin News',
  },
  {
    path: '/admin/users',
    element: withAdminGuard(<AdminUsersManagement />),
    name: 'Admin Users',
  },
]