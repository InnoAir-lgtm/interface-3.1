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
                className="flex justify-center items-center w-12 h-12 rounded-full bg-gradient-to-r from-green-400 to-teal-500 text-white shadow-lg hover:bg-gradient-to-r hover:from-green-500 hover:to-teal-600 transition-all duration-300"
                onClick={togglePop}>
                <CgProfile fontSize={28} />
            </button>

            {showPopup && (
                <div className="absolute top-14 right-0 bg-white p-6 rounded-lg shadow-xl w-80 z-50 transition-all duration-300 transform scale-95 hover:scale-100">
                    <div className="flex justify-between items-center border-b pb-2 mb-4">
                        <h2 className="text-2xl font-semibold text-gray-800">Perfil</h2>
                        <button onClick={togglePop} className="text-gray-600 hover:text-red-500 transition-all duration-200">
                            X
                        </button>
                    </div>
                    <div className="space-y-4 text-gray-700">
                        <p><strong className="font-semibold">Email:</strong> <span className="text-gray-600">{user.email}</span></p>
                        <p><strong className="font-semibold">Grupo:</strong> <span className="text-gray-600">{user.grupo}</span></p>
                        <p><strong className="font-semibold">Perfil:</strong> <span className="text-gray-600">{user.perfil}</span></p>
                    </div>
                </div>
            )}

            {/* Fundo de sombra para fechar o popup quando clicar fora */}
            {showPopup && (
                <div 
                    className="fixed inset-0 bg-black opacity-40 z-40"
                    onClick={togglePop}></div>
            )}
        </div>
    );
}
