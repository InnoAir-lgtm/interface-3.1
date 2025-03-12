import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { CgProfile } from "react-icons/cg";

export default function Perfil() {
    const { user, logout } = useAuth();
    const [showPopup, setShowPopUp] = useState(false);

    const togglePop = () => {
        setShowPopUp(!showPopup);
    };

    if (!user) {
        return <p className="text-center text-gray-600">Carregando ou usuário não logado...</p>;
    }

    return (
        <div className="relative">
            {/* Botão do perfil */}
            <div className="flex items-center gap-2">
                <button
                    className="flex justify-center items-center w-12 h-12 rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 transition duration-200"
                    onClick={togglePop}>
                    <CgProfile fontSize={28} />
                </button>
                <div className="hidden sm:block">
                    <p className="text-sm text-gray-700">{user.email}</p>
                    <p className="text-sm text-gray-500">{user.perfil}</p>
                </div>
            </div>

            {/* Popup do perfil */}
            {showPopup && (
                <>
                    <div className="absolute top-14 right-0 bg-white p-6 rounded-lg shadow-xl w-72 sm:w-80 z-50 transition-all duration-300 transform scale-95 hover:scale-100">
                        <div className="flex justify-between items-center border-b pb-2 mb-4">
                            <h2 className="text-lg font-semibold text-gray-800">Perfil</h2>
                            <button onClick={togglePop} className="text-gray-600 hover:text-red-500 transition duration-200">
                                ✕
                            </button>
                        </div>
                        <div className="space-y-2 text-gray-700">
                            <p><strong className="font-semibold">Email:</strong> {user.email}</p>
                            <p><strong className="font-semibold">Grupo:</strong> {user.grupo}</p>
                            <p><strong className="font-semibold">Perfil:</strong> {user.perfil}</p>
                        </div>

                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={logout}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-200">
                                Sair
                            </button>
                        </div>
                    </div>

                    {/* Fundo escuro para modal */}
                    <div
                        className="fixed inset-0 bg-black opacity-40 z-40"
                        onClick={togglePop}></div>
                </>
            )}
        </div>
    );
}
