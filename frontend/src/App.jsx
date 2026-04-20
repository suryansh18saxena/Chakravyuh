import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { GlobalProvider } from './context/GlobalContext';
import MainLayout from './layout/MainLayout';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import PayloadAnalyzer from './pages/PayloadAnalyzer';
import AttackStories from './pages/AttackStories';
import PayloadHistory from './pages/PayloadHistory';
import Settings from './pages/Settings';
import LoginAttempts from './pages/LoginAttempts';
import { AnimatePresence, motion } from 'framer-motion';

function AnimatedRoutes() {
    const location = useLocation();
    
    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full h-full"
            >
                <Routes location={location}>
                  <Route path="/" element={<MainLayout />}>
                    <Route index element={<LandingPage />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="analyzer" element={<PayloadAnalyzer />} />
                    <Route path="stories" element={<AttackStories />} />
                    <Route path="history" element={<PayloadHistory />} />
                    <Route path="login-attempts" element={<LoginAttempts />} />
                    <Route path="settings" element={<Settings />} />
                  </Route>
                </Routes>
            </motion.div>
        </AnimatePresence>
    );
}

export default function App() {
  return (
    <Router>
        <GlobalProvider>
            <AnimatedRoutes />
        </GlobalProvider>
    </Router>
  );
}
