import React, { useState } from "react";
// Importamos la imagen como un módulo para que Vite la procese correctamente
import gesapLogo from "../assets/img/GESAPLogo.png";
import { LoginForm } from "../components/LoginForm";

export const AuthPage: React.FC = () => {
    // Definimos los estados con inferencia de tipos (TS ya sabe que son booleans)
    const [isLogin, setIsLogin] = useState<boolean>(true);
    const [isForgot, setIsForgot] = useState<boolean>(false);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#E6F7F8] p-6">
            {/* Contenedor principal del Login */}
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-200 px-8 py-12 md:px-12">

                {/* Logo Section */}
                <div className="flex justify-center mb-8">
                    <img
                        src={gesapLogo}
                        alt="GESAP Logo"
                        className="h-20 w-auto"
                    />
                </div>

                {/* Header Text */}
                <div className="text-center mb-10">
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                        {isForgot
                            ? "Recuperar contraseña"
                            : isLogin
                                ? "GESAP"
                                : "Crear Cuenta"
                        }
                    </h1>

                    <p className="text-gray-600 text-base max-w-md mx-auto">
                        Sistema Hospitalario de Guatemala
                    </p>
                </div>

                {/* Form Logic */}
                {isForgot
                    ? <div className="text-center italic text-gray-500">Formulario de recuperación</div>
                    : <LoginForm />
                }

                {/* Toggle Buttons (Opcional por si quieres cambiar entre estados) */}
                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsForgot(!isForgot)}
                        className="text-sm text-cyan-600 hover:underline"
                    >
                        {isForgot ? "Volver al login" : "¿Olvidaste tu contraseña?"}
                    </button>
                </div>

            </div>
        </div>
    );
};