import type { ReactNode } from 'react'
import Home from '../pages/Home'
import Dashboard from '../pages/Dashboard'
import Profile from '../pages/Profile'
import Settings from '../pages/Settings'
import NewsAwareness from '../pages/NewsAwareness'
import FinePay from '../pages/FinePay'
import FinePayOutstanding from '../pages/FinePayOutstanding'
import FinePaySuccess from '../pages/FinePaySuccess'
import FinePayFailure from '../pages/FinePayFailure'
import CriminalRecords from '../pages/CriminalRecords'
import CriminalRecordProfile from '../pages/CriminalRecordProfile'
import PoliceHistory from '../pages/PoliceHistory'
import PoliceRanks from '../pages/PoliceRanks'
import PoliceMedals from '../pages/PoliceMedals'
import AbuseChildrenWomenDivision from '../pages/divisions/AbuseChildrenWomenDivision'
import FieldForceHeadquarters from '../pages/divisions/FieldForceHeadquarters'
import MountedDivision from '../pages/divisions/MountedDivision'
import PoliceCadetDivision from '../pages/divisions/PoliceCadetDivision'
import TrafficRoadSafetyDivision from '../pages/divisions/TrafficRoadSafetyDivision'
import AdminLogin from '../pages/AdminLogin'
import AdminLayout from '../layouts/AdminLayout'
import AdminDashboard from '../pages/AdminDashboard'
import AdminFineManagement from '../pages/AdminFineManagement'
import AdminCriminalRecords from '../pages/AdminCriminalRecords'
import AdminNewsManagement from '../pages/AdminNewsManagement'
import AdminRouteGuard from '../components/admin/AdminRouteGuard'
import NotFound from '../pages/NotFound'

export interface RouteConfig {
  path: string
  element: ReactNode
  name: string
}

export const routes: RouteConfig[] = [
  {
    path: '/',
    element: <Home />,
    name: 'Home',
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
    name: 'Dashboard',
  },
  {
    path: '/profile',
    element: <Profile />,
    name: 'Profile',
  },
  {
    path: '/settings',
    element: <Settings />,
    name: 'Settings',
  },
  {
    path: '/about',
    element: <PoliceHistory />,
    name: 'About Us',
  },
  {
    path: '/library/ranks',
    element: <PoliceRanks />,
    name: 'Library - Ranks',
  },
  {
    path: '/library/medals',
    element: <PoliceMedals />,
    name: 'Library - Medals',
  },
  {
    path: '/criminal-records',
    element: <CriminalRecords />,
    name: 'Criminal Records',
  },
  {
    path: '/criminal-records/:recordId',
    element: <CriminalRecordProfile />,
    name: 'Criminal Record Profile',
  },
  {
    path: '/divisions/abuse-children-women',
    element: <AbuseChildrenWomenDivision />,
    name: 'Division - Abuse of Children & Women',
  },
  {
    path: '/divisions/field-force-headquarters',
    element: <FieldForceHeadquarters />,
    name: 'Division - Field Force Headquarters',
  },
  {
    path: '/divisions/mounted-division',
    element: <MountedDivision />,
    name: 'Division - Mounted Division',
  },
  {
    path: '/divisions/police-cadet-division',
    element: <PoliceCadetDivision />,
    name: 'Division - Police Cadet Division',
  },
  {
    path: '/divisions/traffic-road-safety',
    element: <TrafficRoadSafetyDivision />,
    name: 'Division - Traffic Road Safety',
  },
  {
    path: '/news',
    element: <NewsAwareness />,
    name: 'News & Awareness',
  },
  {
    path: '/fine-pay',
    element: <FinePay />,
    name: 'Fine Pay',
  },
  {
    path: '/fine-pay/outstanding',
    element: <FinePayOutstanding />,
    name: 'Fine Pay Outstanding',
  },
  {
    path: '/fine-pay/success',
    element: <FinePaySuccess />, 
    name: 'Fine Pay Success',
  },
  {
    path: '/fine-pay/failure',
    element: <FinePayFailure />,
    name: 'Fine Pay Failure',
  },
  {
    path: '/admin',
    element: <AdminLogin />,
    name: 'Admin Login',
  },
  {
    path: '/admin/dashboard',
    element: (
      <AdminRouteGuard>
        <AdminLayout>
          <AdminDashboard sectionName="Dashboard" />
        </AdminLayout>
      </AdminRouteGuard>
    ),
    name: 'Admin Dashboard',
  },
  {
    path: '/admin/fines',
    element: (
      <AdminRouteGuard>
        <AdminLayout>
          <AdminFineManagement />
        </AdminLayout>
      </AdminRouteGuard>
    ),
    name: 'Admin Fines',
  },
  {
    path: '/admin/criminal-records',
    element: (
      <AdminRouteGuard>
        <AdminLayout>
          <AdminCriminalRecords />
        </AdminLayout>
      </AdminRouteGuard>
    ),
    name: 'Admin Criminal Records',
  },
  {
    path: '/admin/news',
    element: (
      <AdminRouteGuard>
        <AdminLayout>
          <AdminNewsManagement />
        </AdminLayout>
      </AdminRouteGuard>
    ),
    name: 'Admin News',
  },
  {
    path: '/*',
    element: <NotFound />,
    name: '404',
  },
]
