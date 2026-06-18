import { Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { RequireAuth } from './components/RequireAuth'
import { Layout } from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import CustomerDetail from './pages/CustomerDetail'
import Orders from './pages/Orders'
import OrderDetail from './pages/OrderDetail'
import CalendarPage from './pages/Calendar'
import CompletedServices from './pages/CompletedServices'
import Users from './pages/Users'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/zakazky" element={<Orders />} />
          <Route path="/zakazky/:id" element={<OrderDetail />} />
          <Route path="/kalendar" element={<CalendarPage />} />
          <Route
            path="/hotove-servisy"
            element={
              <RequireAuth roles={['admin', 'fakturace']}>
                <CompletedServices />
              </RequireAuth>
            }
          />
          <Route
            path="/zakaznici"
            element={
              <RequireAuth roles={['admin']}>
                <Customers />
              </RequireAuth>
            }
          />
          <Route
            path="/zakaznici/:id"
            element={
              <RequireAuth roles={['admin']}>
                <CustomerDetail />
              </RequireAuth>
            }
          />
          <Route
            path="/uzivatele"
            element={
              <RequireAuth roles={['admin']}>
                <Users />
              </RequireAuth>
            }
          />
          <Route
            path="/nastaveni"
            element={
              <RequireAuth roles={['admin']}>
                <Settings />
              </RequireAuth>
            }
          />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  )
}
