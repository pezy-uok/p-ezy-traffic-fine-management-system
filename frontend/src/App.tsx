import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { routes } from './config/routes'
import Footer from './components/Footer'
import './App.css'

function AppLayout() {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  useEffect(() => {
    document.body.classList.toggle('admin-mode', isAdminRoute)

    return () => {
      document.body.classList.remove('admin-mode')
    }
  }, [isAdminRoute])

  return (
    <>
      <main>
        <Routes>
          {routes.map(route => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Routes>
      </main>

      {!isAdminRoute ? <Footer /> : null}
    </>
  )
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  )
}

export default App
