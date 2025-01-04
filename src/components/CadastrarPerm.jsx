import React, { useState, useEffect } from 'react';
import api from '../apiUrl';

export default function CadastrarPerm() {
    const [permis, setPermis] = useState({ permiss: '', descricao: '', });
    const [isPopRole, setIsPopRole] = useState(false);


    const handlePermissionSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/cadastrar-permissoes', {
                permissao: permis.permiss,
                descricao: permis.descricao,
            });
            console.log('Resposta do servidor:', response.data);
            alert('Permissão cadastrada com sucesso!');
            setPermis({
                permiss: '',
                descricao: '',
            });
            setIsPopRole(false);
        } catch (error) {
            console.error('Erro ao cadastrar permissão:', error.message);
            alert('Falha ao cadastrar permissão.');
        }
    };

    const handleChangeInput = (e) => {
        const { name, value } = e.target;
        setPermis({ ...permis, [name]: value });
    };

    const PopToggle = () => {
        setIsPopRole(!isPopRole);
    };

    return (
        <div>

            <button
                onClick={PopToggle}
                className="py-2 px-4 bg-purple-500 text-white font-semibold rounded-lg shadow-md hover:bg-purple-600">
                Cadastrar permissoes
            </button>

            <div>
                {
                    isPopRole && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md relative">
                                <button
                                    onClick={PopToggle}
                                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                                >
                                    ✕
                                </button>
                                <h2 className="text-2xl font-semibold text-center text-gray-700 mb-6">
                                    Cadastrar Permissões
                                </h2>
                                <form onSubmit={handlePermissionSubmit}>
                                    <div className="space-y-4">
                                        <div>
                                            <input
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Descrição"
                                                type="text"
                                                name="descricao"
                                                value={permis.descricao}
                                                onChange={handleChangeInput}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full py-2 mt-6 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                    >
                                        Cadastrar Permissão
                                    </button>
                                </form>
                            </div>
                        </div>
                    )
                }
            </div>
        </div>
    )
}
