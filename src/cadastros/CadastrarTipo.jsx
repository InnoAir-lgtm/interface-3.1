import { useState, useEffect, useRef } from 'react';
import { usePermissions } from '../middleware/middleware';
import { FiTrash } from "react-icons/fi";
import api from '../apiUrl';
import { GoPlus } from "react-icons/go";

export default function CadastrarTipoModal({ schema }) {
    const [descricao, setDescricao] = useState('');
    const [classificacao, setClassificacao] = useState('');
    const [message, setMessage] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isListModalOpen, setIsListModalOpen] = useState(false);
    const [tiposPessoa, setTiposPessoa] = useState([]);
    const [allTiposPessoa, setAllTiposPessoa] = useState([]);
    const { verifyAndCreatePermission } = usePermissions();
    const debounceTimeout = useRef(null);

    useEffect(() => {
        if (schema) {
            listarTiposPessoa();
        }
    }, [schema]);

    const deletarTipoPessoa = async (tpp_id, schema) => {
        console.log('Deletar Tipo:', tpp_id, schema);
        try {
            await api.delete(`/deletar-tipo-pessoa?tpp_id=${tpp_id}&schema=${schema}`);
            listarTiposPessoa();
        } catch (error) {
            console.error('Erro ao deletar tipo de pessoa:', error.message);
        }
    };

    const listarTiposPessoa = async () => {
        try {
            const response = await api.get('/listar-tipos-pessoa', {
                params: { schema }
            });

            if (response.status === 200) {
                setTiposPessoa(response.data.data);
                setAllTiposPessoa(response.data.data);
            } else {
                throw new Error('Erro ao listar tipos de pessoa.');
            }
        } catch (error) {
            console.error("Erro ao listar tipos de pessoa:", error);
            setMessage(`Erro: ${error.response?.data?.message || error.message}`);
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!schema || schema.trim() === '') {
            setMessage('Erro: O schema não foi identificado corretamente.');
            return;
        }

        try {
            const response = await api.post('/cadastrar-tipo-pessoa', {
                schema: schema.trim(),
                descricao,
                classificacao
            });

            if (response.status === 201) {
                setMessage('Tipo cadastrado com sucesso!');
                setDescricao('');
                setClassificacao('');
                listarTiposPessoa();
            } else {
                throw new Error('Erro ao cadastrar tipo. Status inesperado.');
            }
        } catch (error) {
            console.error("Erro ao cadastrar tipo:", error);
            setMessage(`Erro: ${error.response?.data?.message || error.message}`);
        }
    };

    const openModal = async (permissionName) => {
        const hasPermission = await verifyAndCreatePermission(permissionName);
        if (hasPermission) {
            setIsModalOpen(true);
        } else {
            setMessage('Você não tem permissão para acessar esta funcionalidade.');
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setMessage('');
    };

    const openListModal = () => {
        setIsListModalOpen(true);
    };

    const closeListModal = () => {
        setIsListModalOpen(false);
    };

    const handleSearch = (e) => {
        const search = e.target.value.toLowerCase();

        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        debounceTimeout.current = setTimeout(() => {
            if (search === '') {
                setTiposPessoa(allTiposPessoa);
            } else {
                setTiposPessoa(
                    allTiposPessoa.filter(
                        (tipo) =>
                            tipo.tpp_descricao.toLowerCase().includes(search) ||
                            tipo.tpp_classificacao.toLowerCase().includes(search)
                    )
                );
            }
        }, 300);
    };

    return (
        <div>
            <button
                onClick={openListModal}
                className="w-full flex items-center gap-2 p-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-all duration-300"
            >
                Tipo de Pessoa
            </button>

            {isModalOpen && (
                <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50 z-50 w-screen h-screen">
                    <div className="bg-white text-black p-6 rounded shadow-lg w-full max-w-md relative">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-bold">Cadastrar tipo de Pessoa</h2>
                            <button
                                onClick={closeModal}
                                className="bg-red-500 rounded-full text-white px-4 py-2 hover:bg-red-600"
                            >
                                X
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4 z-[100]">
                            <div>
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
                            <div>
                                <label htmlFor="classificacao" className="block text-gray-700">Classificação</label>
                                <select
                                    id="classificacao"
                                    value={classificacao}
                                    onChange={(e) => setClassificacao(e.target.value)}
                                    className="w-full text-black p-2 border rounded"
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


                        {message && (
                            <p className={`mt-2 ${message.includes('Erro') ? 'text-red-500' : 'text-green-500'}`}>
                                {message}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {isListModalOpen && (
                <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50 w-screen h-screen">
                    <div className="bg-white text-black p-6 rounded shadow-lg w-full max-w-md relative">
                        <h3 className="text-lg font-bold mb-4">Tipos de pessoas</h3>
                        <div className='flex justify-between mb-7'>
                            <button
                                value="cadastrarTipo"
                                onClick={(e) => openModal(e.target.value)}
                                className="items-center justify-center gap-2 flex bg-green-500 text-white p-1 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                 <div className="flex items-center justify-center w-[30px] h-[30px] rounded bg-gray-500">
                                    <GoPlus className="text-white" />
                                </div>
                                Tipos pessoas
                            </button>

                            <button
                                onClick={closeListModal}
                                className="bg-red-500 text-white px-3 py-1 rounded-full hover:bg-red-600"
                            >
                                X
                            </button>
                        </div>

                        <input
                            type="text"
                            placeholder="Buscar tipo de pessoa..."
                            className="w-full p-2 mb-4 border rounded"
                            onChange={handleSearch}
                        />
                        <div className="h-64 overflow-y-auto">
                            {tiposPessoa.length === 0 ? (
                                <p className="text-center text-gray-500">Nenhum tipo de pessoa encontrado.</p>
                            ) : (
                                tiposPessoa.map((tipo, index) => (
                                    <div
                                        key={index}
                                        className="flex justify-between items-center p-2 border-b hover:bg-gray-200 cursor-pointer"
                                    >
                                        <div>
                                            <p className="font-semibold">{tipo.tpp_descricao}</p>
                                            <p className="text-sm text-gray-600">{tipo.tpp_classificacao}</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (tipo.tpp_id) {
                                                    deletarTipoPessoa(tipo.tpp_id, schema);
                                                }
                                            }}
                                        >
                                            <FiTrash />
                                        </button>

                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
