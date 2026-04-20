import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/common/AppShell.jsx'
import ProtectedRoute from './routes/ProtectedRoute.jsx'
import AnalyticsPage from './pages/AnalyticsPage.jsx'
import Dashboard from './pages/Dashboard.jsx'
import ExamPage from './pages/ExamPage.jsx'
import Login from './pages/Login.jsx'
import PaperDetails from './pages/PaperDetails.jsx'
import Profile from './pages/Profile.jsx'
import ResultsPage from './pages/ResultsPage.jsx'
import Signup from './pages/Signup.jsx'
import UploadPaper from './pages/UploadPaper.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload-paper" element={<UploadPaper />} />
          <Route path="/papers/:id" element={<PaperDetails />} />
          <Route path="/results/:attemptId" element={<ResultsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        <Route path="/exam/:id" element={<ExamPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
