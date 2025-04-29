import React, { useState, useEffect } from 'react';
import api from '../apiUrl';

export default function CadastrarTipoProduto({ schema }) {
    const [descricao, setDescricao] = useState('');
    const [abrirModal, setAbrirModal] = useState(false);
    const [message, setMessage] = useState('');
    const [tiposProduto, setTiposProduto] = useState([]);

    const ListarTipoProduto = async () => {
        try {
            const response = await api.get('/listar-tipo-produto', {
                params: { schema: schema.trim() },
            });
            setTiposProduto(Array.isArray(response.data.data) ? response.data.data : []);
        } catch (error) {
            console.error("Erro ao listar tipos:", error);
            setMessage(`Erro: ${error.response?.data?.message || error.message}`);
            setTiposProduto([]);
        }
    }
    

    useEffect(() => {
        if (schema) {
            ListarTipoProduto();
        }
    }, [schema]);


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
                ListarTipoProduto();
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
                            <h2 className="text-lg font-bold">Cadastrar tipo produto</h2>
                            <button
                                onClick={closeModal}
                                className="bg-red-500 rounded-full text-white px-4 py-2 hover:bg-red-600"
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

                        <div className="mt-6">
                            <h3 className="text-xl font-semibold">Tipos de Produto Cadastrados</h3>
                            {Array.isArray(tiposProduto) && tiposProduto.length > 0 ? (
                                <ul className="mt-4 space-y-2">
                                    {tiposProduto.map((tipo) => (
                                        <li key={tipo.tpp_id} className="p-2 border-b">
                                            {tipo.tpp_descricao}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-600">Nenhum tipo cadastrado.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}