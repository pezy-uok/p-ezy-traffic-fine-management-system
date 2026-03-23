import type { ReactNode } from 'react'
import Home from '../pages/Home'
import Dashboard from '../pages/Dashboard'
import Profile from '../pages/Profile'
import Settings from '../pages/Settings'
import NewsAwareness from '../pages/NewsAwareness'
import FinePay from '../pages/FinePay'
import CriminalRecords from '../pages/CriminalRecords'
import CriminalRecordProfile from '../pages/CriminalRecordProfile'
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
    path: '/*',
    element: <NotFound />,
    name: '404',
  },
]
