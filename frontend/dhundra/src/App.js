import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import ResumeBuilder from './components/ResumeBuilder';
import Profile from './components/Profile';
import Tracker from './components/Tracker';
import { UserProvider } from './components/UserContext';

const App = () => (
  <ThemeProvider theme={theme} >
  <CssBaseline />
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute element={Dashboard} />} />
          <Route path="/resume-builder" element={<ProtectedRoute element={ResumeBuilder} />} />
          <Route path="/profile" element={<ProtectedRoute element={Profile} />} />
          <Route path="/router" element={<ProtectedRoute element={Profile} />} />
          <Route path="/tracker" element={<ProtectedRoute element={Tracker}/> } />

        </Routes>
      </Router>
    </UserProvider>
  </ThemeProvider>
);

export default App;

