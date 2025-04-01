import React, { useState } from 'react';
import api from '../apiUrl';

export default function CadastrarTipoProduto({ schema }) {
    const [descricao, setDescricao] = useState('');
    const [abrirModal, setAbrirModal] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!schema || schema.trim() === '') {
            setMessage('Erro: O schema não foi identificado corretamente.');
            return;
        }

        try {
            const response = await api.post('/cadastrar-tipo-produto', {
                schema: schema.trim(),
                descricao,
            });

            if (response.status === 201) {
                setMessage('Tipo cadastrado com sucesso!');
                setDescricao('');
            } else {
                throw new Error('Erro ao cadastrar tipo. Status inesperado.');
            }
        } catch (error) {
            console.error("Erro ao cadastrar tipo:", error);
            setMessage(`Erro: ${error.response?.data?.message || error.message}`);
        }
    };

    const openModal = () => {
        setAbrirModal(true);
    };

    const closeModal = () => {
        setAbrirModal(false);
    };

    return (
        <div>
            <button
                onClick={openModal}
                className="w-full flex items-center gap-2 p-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-all duration-300"
            >
                Tipo Produto
            </button>

            {abrirModal && (
                <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50 z-50 w-screen h-screen">
                    <div className="bg-white text-black p-6 rounded shadow-lg w-full max-w-md relative">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-bold">Cadastrar Tipo de Pessoa</h2>
                            <button
                                onClick={closeModal}
                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                            >
                                X
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="mt-4">
                                <label htmlFor="descricao" className="block text-gray-700">Descrição</label>
                                <input
                                    type="text"
                                    id="descricao"
                                    value={descricao}
                                    onChange={(e) => setDescricao(e.target.value)}
                                    className="w-full p-2 text-black border rounded"
                                    required
                                />
                            </div>

                            <button type="submit" className="mt-4 w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                                Cadastrar
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
