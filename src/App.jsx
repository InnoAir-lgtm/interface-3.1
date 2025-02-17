import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { PermissionProvider } from './middleware/middleware';  // Importando o PermissionProvider
import EnderecoProviderWrapper from './auth/EnderecoProviderWrapper';
import MasterPage from './pages/dashboards/masterPage';
import LoginMaster from './pages/LoginMaster';
import DashboardAdm from './pages/dashboards/dashboardAdm';
import DashboardOperad from './pages/dashboards/DashboardOperad';
import ProtectedRoute from '../Routes/ProtectRoute';
import CadastrarEndereco from './cadastros/CadastrarEndereco';
import CadastrarComplementar from './cadastros/CadastrarComplementar';

function App() {
  return (
    <AuthProvider>
      <PermissionProvider> 
        <Router>
          <EnderecoProviderWrapper>
            <Routes>
              <Route path="/" element={<LoginMaster />} />
              <Route
                path="/master"
                element={
                  <ProtectedRoute>
                    <MasterPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/adminDashboard"
                element={
                  <ProtectedRoute>
                    <DashboardAdm />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/operador'
                element={
                  <ProtectedRoute>
                    <DashboardOperad />
                  </ProtectedRoute>
                }
              />
              <Route path="/cadastrar-endereco" element={<CadastrarEndereco />} />
              <Route
                path="/cadastrar-complementar"
                element={<CadastrarComplementar />}
              />
            </Routes>
          </EnderecoProviderWrapper>
        </Router>
      </PermissionProvider> {/* Fechando PermissionProvider */}
    </AuthProvider>
  )
}

export default App;
