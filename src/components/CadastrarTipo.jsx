import { useState } from 'react';
import { GoPlus } from "react-icons/go";
import api from '../apiUrl';

export default function CadastrarTipoModal({ schema }) {
    const [descricao, setDescricao] = useState('');
    const [classificacao, setClassificacao] = useState('');
    const [message, setMessage] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.get('/cadastrar-tipo-pessoa', {
                schema,
                descricao,
                classificacao,
            });

            if (response.status === 200) {
                setMessage('Tipo cadastrado com sucesso!');
                setDescricao('');
                setClassificacao('');
            } else {
                throw new Error('Erro ao cadastrar tipo.');
            }
        } catch (error) {
            setMessage(`Erro: ${error.response?.data?.message || error.message}`);
        }
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
        setIsModalOpen(false);
        setMessage('');
    };

    return (
        <div>
            <button
                onClick={openModal}
                className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                <div className="flex items-center justify-center w-[30px] h-[30px] rounded bg-green-500">
                    <GoPlus className="text-white" />
                </div>
                Cadastrar Tipo
            </button>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex justify-center items-center bg-gray-800 bg-opacity-50">
                    <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-bold">Cadastrar Tipo de Pessoa</h2>
                            <button
                                onClick={closeModal}
                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                                X
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="descricao" className="block text-gray-700">Descrição</label>
                                <input
                                    type="text"
                                    id="descricao"
                                    value={descricao}
                                    onChange={(e) => setDescricao(e.target.value)}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="classificacao" className="block text-gray-700">Classificação</label>
                                <select
                                    id="classificacao"
                                    value={classificacao}
                                    onChange={(e) => setClassificacao(e.target.value)}
                                    className="w-full p-2 border rounded"
                                    required
                                >
                                    <option value="">Selecione uma classificação</option>
                                    <option value="Cliente">Cliente</option>
                                    <option value="Fornecedor">Fornecedor</option>
                                    <option value="Funcionario">Funcionário</option>
                                    <option value="Instalador">Instalador</option>
                                    <option value="Profissional">Profissional</option>
                                    <option value="Colaborador">Colaborador</option>
                                </select>
                            </div>
                            <button type="submit" className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                                Cadastrar
                            </button>
                        </form>

                        {message && <p className={`mt-2 ${message.includes('Erro') ? 'text-red-500' : 'text-green-500'}`}>{message}</p>}
                    </div>
                </div>
            )}
        </div>
    );
}
