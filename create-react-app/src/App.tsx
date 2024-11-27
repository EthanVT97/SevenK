import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { Login } from './components/Login';
import { Register } from './components/Register';
import './App.css';
import './styles/layout.css';

// Import your page components
import Dashboard from './pages/Dashboard';
import TwoDLottery from './pages/TwoDLottery';
import ThreeDLottery from './pages/ThreeDLottery';
import History from './pages/History';
import Wallet from './pages/Wallet';
import Profile from './pages/Profile';
import Help from './pages/Help';

function App(): JSX.Element {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Routes */}
                <Route path="/" element={<MainLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="2d" element={<TwoDLottery />} />
                    <Route path="3d" element={<ThreeDLottery />} />
                    <Route path="history" element={<History />} />
                    <Route path="wallet" element={<Wallet />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="help" element={<Help />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App; 