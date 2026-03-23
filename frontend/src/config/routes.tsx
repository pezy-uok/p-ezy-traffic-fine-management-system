import type { ReactNode } from 'react'
import Home from '../pages/Home'
import FinePay from '../pages/FinePay'
import Dashboard from '../pages/Dashboard'
import Profile from '../pages/Profile'
import Settings from '../pages/Settings'
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
    path: '/fine-pay',
    element: <FinePay />,
    name: 'Fine Pay',
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
    path: '/*',
    element: <NotFound />,
    name: '404',
  },
]
