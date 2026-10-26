
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import AppRoutes from './routes/AppRoutes';

/**
 * Root Application Component - Role-Based Access Control
 */
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#faf4ec] text-[#2d2721] flex flex-col font-sans selection:bg-[#d97757] selection:text-white">
          
          {/* Top Navbar */}
          <Navbar />

          {/* Main Application Routes */}
          <main className="flex-1">
            <AppRoutes />
          </main>

        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}