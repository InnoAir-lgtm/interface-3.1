import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { CgProfile } from "react-icons/cg";

export default function Perfil() {
    const { user } = useAuth();
    const [showPopup, setShowPopUp] = useState(false);

    const togglePop = () => {
        setShowPopUp(!showPopup);
    };

    if (!user) {
        return <p>Carregando ou usuário não logado</p>;
    }

    return (
        <div className="relative">
            <button 
                className="flex justify-center items-center w-12 h-12 rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 transition duration-200"
                onClick={togglePop}>
                <CgProfile fontSize={28} />
            </button>

            {showPopup && (
                <div className="absolute top-14 right-0 bg-white p-4 rounded-lg shadow-xl w-72 z-50 transition-all duration-300">
                    <div className="flex justify-between items-center border-b pb-2 mb-3">
                        <h2 className="text-xl font-semibold text-gray-800">Perfil</h2>
                        <button onClick={togglePop} className="text-gray-600 hover:text-red-500">
                            X
                        </button>
                    </div>
                    <div className="space-y-2 text-gray-700">
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Grupo:</strong> {user.grupo}</p>
                        <p><strong>Perfil:</strong> {user.perfil}</p>
                    </div>
                </div>
            )}

            {/* Fundo de sombra para fechar o popup quando clicar fora */}
            {showPopup && (
                <div 
                    className="fixed inset-0 bg-black opacity-50 z-40"
                    onClick={togglePop}></div>
            )}
        </div>
    );
}
