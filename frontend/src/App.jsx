import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Trades from './pages/Trades';
import AddTrade from './pages/AddTrade';
import WeeklyTarget from './pages/WeeklyTarget';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-bg-primary">
        <Sidebar />
        <main className="flex-1 lg:ml-64 pt-14 lg:pt-0 pb-20 lg:pb-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/trades" element={<Trades />} />
            <Route path="/add-trade" element={<AddTrade />} />
            <Route path="/add-trade/:id" element={<AddTrade />} />
            <Route path="/weekly-target" element={<WeeklyTarget />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
