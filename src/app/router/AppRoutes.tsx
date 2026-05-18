import { Routes, Route } from 'react-router-dom';

import { DashboardPage } from '../layouts/DashboardPage';
import { MainLayout } from '../../shared/components/layouts/MainLayout';
import { LoginForm } from '../../features/auth/components/LoginForm';


export const AppRoutes = () => {
    return (
        <Routes>
            {/* Ruta pública */}
            <Route path="/login" element={<LoginForm />} />

            {/* Rutas privadas con Layout */}
            <Route path="/" element={<MainLayout />}>
                {/* Esta es la página por defecto al entrar a "/" o "/home" */}
                <Route index element={<DashboardPage />} />
                <Route path="home" element={<DashboardPage />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={
                <div className="min-h-screen bg-[#EBF5FB] flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-8xl font-extrabold text-[#0A2647]/10">404</p>
                        <h2 className="text-2xl font-bold text-[#0A2647] mt-2">Página no encontrada</h2>
                        <a href="/" className="mt-4 inline-block text-[#0E6BA8] font-semibold hover:text-[#00ACC1] transition-colors">
                            ← Volver al inicio
                        </a>
                    </div>
                </div>
            } />
        </Routes>
    );
};