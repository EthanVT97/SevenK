import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export const MainLayout: React.FC = () => {
    return (
        <div className="app-layout">
            <Navbar />
            <div className="main-container">
                <Sidebar />
                <main className="content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}; 