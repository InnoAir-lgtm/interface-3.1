import React, { useState, useEffect } from 'react';
import api from '../apiUrl';
import { IoMdArrowDropright } from "react-icons/io";
import { FiTrash } from "react-icons/fi";

export default function ListEndPessoa({ schema, selectedPessoa }) {
    const [showSidebar, setShowSidebar] = useState(false);
    const [enderecos, setEnderecos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (showSidebar && selectedPessoa) {
            listarEnderecos(selectedPessoa.pes_id, schema);
        }
    }, [showSidebar, selectedPessoa, schema]);

    const listarEnderecos = async (pes_id, schema) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/listar-endereco?pes_id=${pes_id}&schema=${schema}`);
            setEnderecos(response.data.data || []);
        } catch (error) {
            setError('Erro ao listar endereços. Tente novamente mais tarde.');
            console.error('Erro ao listar endereços:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const deletarEndereco = async (id, schema) => {
        try {
            await api.delete(`/deletar-endereco?id=${id}&schema=${schema}`);
            listarEnderecos(selectedPessoa.pes_id, schema);
        } catch (error) {
            console.error('Erro ao deletar endereço:', error.message);
        }
    };

    const handleSidebarClose = () => {
        setShowSidebar(false);
    };

    return (
        <div>
            <button
                onClick={() => setShowSidebar(true)}
                className="px-5 py-3 flex justify-center items-center w-48 transition-transform transform -translate-x-32 hover:translate-x-0 duration-300 ease-in-out text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
                Lista de endereços <IoMdArrowDropright />
            </button>

            <div
                className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg transform ${showSidebar ? 'translate-x-0' : 'translate-x-full'
                    } transition-transform duration-300 ease-in-out z-50`}
            >
                <div className="p-4 border-b border-gray-300 flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Lista de endereços</h2>
                    <button
                        onClick={handleSidebarClose}
                        className="bg-red-600 text-white p-2 rounded-full focus:outline-none hover:bg-red-700"
                    >
                        ✕
                    </button>
                </div>
                <div className="p-4">
                    {loading ? (
                        <p>Carregando...</p>
                    ) : error ? (
                        <p className="text-red-600">{error}</p>
                    ) : enderecos.length > 0 ? (
                        <div className="grid gap-4">
                            {enderecos.map((endereco, index) => (
                                <div key={index} className="p-4 border rounded-lg shadow-md bg-white">
                                    <button
                                        className="text-red-500 hover:text-red-700 transition-transform transform hover:scale-110"
                                        onClick={() => deletarEndereco(endereco.epe_id, schema)} // Use 'epe_id' aqui.
                                    >
                                        <FiTrash className="w-5 h-5" />
                                    </button>
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

            {showSidebar && (
                <div
                    onClick={handleSidebarClose}
                    className="fixed inset-0 bg-black bg-opacity-50 z-40"
                ></div>
            )}
        </div>
    );
}
