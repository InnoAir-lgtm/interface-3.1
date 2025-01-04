import React, { useState, useEffect } from 'react';
import api from '../apiUrl';

export default function ListEndPessoa({ selectedPessoa }) {
    const [showSidebar, setShowSidebar] = useState(false);
    const [enderecos, setEnderecos] = useState([]);


    useEffect(() => {
        if (showSidebar && selectedPessoa) {
            listarEnderecos(selectedPessoa.pes_id);
        }
    }, [showSidebar, selectedPessoa]);

    const listarEnderecos = async (pes_id) => {
        try {
            const response = await api.get(`/listar-endereco?pes_id=${pes_id}`, {
                method: 'GET',
            });

            // Corrigindo para acessar os dados da resposta
            setEnderecos(response.data.data || []);
        } catch (error) {
            console.error('Erro ao listar endereços:', error.message);
        }
    };


    return (
        <div>
            <button
                onClick={() => setShowSidebar(true)}
                className="px-5 py-3 md:w-20 lg:w-48 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
                Lista de endereços
            </button>

            <div
                className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg transform ${showSidebar ? 'translate-x-0' : 'translate-x-full'
                    } transition-transform duration-300 ease-in-out z-50`}
            >
                <div className="p-4 border-b border-gray-300 flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Lista de endereços</h2>

                    <button
                        onClick={() => setShowSidebar(false)}
                        className="bg-red-600 text-white p-2 rounded-full focus:outline-none hover:bg-red-700"
                    >
                        ✕
                    </button>
                </div>
                <div className="p-4">
                    {enderecos.length > 0 ? (
                        <div className="grid gap-4">
                            {enderecos.map((endereco, index) => (
                                <div key={index} className="p-4 border rounded-lg shadow-md bg-white">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Endereço {endereco.epe_tipo}</h3>
                                    <p>CEP: {endereco.end_cep}</p>
                                    <p>Número: {endereco.epe_numero}</p>
                                    <p>Complemento: {endereco.epe_complemento}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">Nenhum endereço associado ao usuário.</p>
                    )}
                </div>
            </div>

            {/* Fundo escuro (overlay) */}
            {showSidebar && (
                <div
                    onClick={() => setShowSidebar(false)}
                    className="fixed inset-0 bg-black bg-opacity-50 z-40"
                ></div>
            )}
        </div>
    );
}
