import React, { useState, useEffect } from 'react';
import { IoBusinessOutline } from 'react-icons/io5';
import api from '../apiUrl';
import { IoMdClose } from "react-icons/io";
import { AnimatePresence, motion } from "motion/react";

export default function EmpreendimentoRGI({ schema }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editModal, setEditModal] = useState(false)
    const [cep, setCep] = useState('');
    const [numero, setNumero] = useState('');
    const [logradouro, setLogradouro] = useState('');
    const [nomeEmpreendimento, setNomeEmpreendimento] = useState('');
    const [responsavel, setResponsavel] = useState('');
    const [construtora, setConstrutora] = useState('');
    const [engenheiro, setEngenheiro] = useState('');
    const [arquitetoSelecionado, setArquitetoSelecionado] = useState('');
    const [arquitetos, setArquitetos] = useState([]);
    const [empreendimentos, setEmpreendimentos] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [empreendimentoSelecionado, setEmpreendimentoSelecionado] = useState(null);
    const [formData, setFormData] = useState({
        cep: '',
        numero: '',
        logradouro: '',
        nomeEmpreendimento: '',
        responsavel: '',
        construtora: '',
        engenheiro: '',
        arquitetoSelecionado: ''
    });

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    const openEditModal = (emp) => {
        if (!emp) {
            console.error("Empreendimento inválido:", emp);
            return;
        }

        setEmpreendimentoSelecionado(emp);
        setFormData({
            cep: emp.epd_cep || '',
            numero: emp.epd_numero || '',
            logradouro: emp.epd_logradouro || '',
            nomeEmpreendimento: emp.epd_nome || '',
            responsavel: emp.epd_responsavel || '',
            construtora: emp.epd_construtora || '',
            engenheiro: emp.epd_engenheiro || '',
            arquitetoSelecionado: emp.epd_arquiteto || ''
        });
        setEditModal(true);
    };



    const closeEditModal = () => {
        setEditModal(false);
        setEmpreendimentoSelecionado(null);
    };

    // FECHAR E ABIRIR MODAL
    const openModal = () => {
        setIsOpen(true)
    }
    const closeModal = () => {
        setIsOpen(false);
    };


    // Busca de ceps
    const handleCepChange = async (e) => {
        const cepValue = e.target.value;
        setCep(cepValue);
        if (cepValue.length === 8 && schema) {
            try {
                const response = await api.get(`/listar-enderecos?schema=${schema}&cep=${cepValue}`);
                const data = response.data.data[0];

                if (data) {
                    setLogradouro(data.end_logradouro || '');
                } else {
                    const apiResponse = await api.get(`https://viacep.com.br/ws/${cepValue}/json/`);
                    setLogradouro(apiResponse.data.logradouro || '');
                }
            } catch (error) {
                console.error('Erro ao buscar CEP:', error);
            }
        }
    };


    // Deletar empreendimento
    const handleDelete = async (epd_id) => {
        if (!schema) {
            alert("Schema não definido!");
            return;
        }
        const confirmDelete = window.confirm("Tem certeza que deseja excluir este empreendimento?");
        if (!confirmDelete) return;

        try {
            await api.delete(`/delete-empreendimento?schema=${schema}&epd_id=${epd_id}`);
            alert("Empreendimento excluído com sucesso!");
            setEmpreendimentos(prevEmpreendimentos =>
                prevEmpreendimentos.filter(emp => emp.epd_id !== epd_id)
            );
        } catch (error) {
            console.error("Erro ao deletar empreendimento:", error);
            alert("Erro ao excluir o empreendimento.");
        }
    };



    // Listar empreendimentos cadastrados
    const fetchEmpreendimentos = async () => {
        try {
            const response = await api.get(`/listar-empreendimentos?schema=${schema}`);
            setEmpreendimentos(response.data.data);
        } catch (error) {
            console.error('Erro ao buscar empreendimentos:', error);
        }
    };

    // Chamar `fetchEmpreendimentos()` ao carregar a página
    useEffect(() => {
        fetchEmpreendimentos();
    }, [schema]);



    const handleSubmit = async (e) => {
        e.preventDefault();
        const empreendimentoData = {
            schema,
            cep,
            numero,
            nome: nomeEmpreendimento,
            complemento: logradouro,
            arquiteto: arquitetoSelecionado,
            construtora,
            responsavel,
            engenheiro
        };

        try {
            await api.post('/cadastrar-empreendimento', empreendimentoData);
            alert('Empreendimento cadastrado com sucesso!');
            setIsModalOpen(false);  // Fecha a modal
            fetchEmpreendimentos(); // Atualiza a lista de empreendimentos
        } catch (error) {
            console.error('Erro ao salvar empreendimento:', error);
            alert('Erro ao salvar o empreendimento.');
        }
    };



    const updatedData = {
        schema,
        epd_id: empreendimentoSelecionado ? empreendimentoSelecionado.epd_id : null,
        end_cep: formData.cep,
        epd_numero: formData.numero,
        epd_nome: formData.nomeEmpreendimento,
        epd_complemento: formData.logradouro,
        pes_id_arquiteto: formData.arquitetoSelecionado,
        epd_construtora: formData.construtora,
        epd_responsavel: formData.responsavel,
        epd_engenheiro: formData.engenheiro
    };


    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            if (empreendimentoSelecionado) {
                await api.put(`/atualizar-empreendimento?schema=${schema}`, updatedData);
                alert('Empreendimento atualizado com sucesso!');
                setEditModal(false);   // Fecha a modal de edição
                fetchEmpreendimentos(); // Atualiza a lista de empreendimentos
            }
        } catch (error) {
            console.error('Erro ao atualizar empreendimento:', error);
            alert('Erro ao atualizar o empreendimento.');
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };


    // Procurar tipos pessoas Arquitetos
    useEffect(() => {
        const fetchArquitetos = async () => {
            if (schema) {
                try {
                    const response = await api.get(`/pessoas?schema=${schema}`);
                    const todasPessoas = response.data.data;
                    const arquitetosFiltrados = [];
                    await Promise.all(
                        todasPessoas.map(async (pessoa) => {
                            try {
                                const tiposResponse = await api.get(`/tipos-pessoa?pes_id=${pessoa.pes_id}&schema=${schema}`);
                                const tipos = tiposResponse.data.data.map(tipo => tipo.tpp_descricao.toLowerCase());

                                if (tipos.includes('arquiteto')) {
                                    arquitetosFiltrados.push(pessoa);
                                }
                            } catch (error) {
                                console.error('Erro ao buscar tipos:', error);
                            }
                        })
                    );
                    setArquitetos(arquitetosFiltrados);
                } catch (error) {
                    console.error('Erro ao buscar arquitetos:', error);
                }
            }
        };
        fetchArquitetos();
    }, [schema]);

    return (
        <div>
            <button
                onClick={openModal}
                className="w-72 h-64 bg-gradient-to-br to-gray-300 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-gray-800 font-semibold flex flex-col justify-center items-center text-center overflow-hidden"
            >
                <IoBusinessOutline className="text-blue-600 text-5xl" />
                Adicionar Empreendimento
            </button>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <div className="fixed inset-0 flex items-center z-20 justify-center bg-black bg-opacity-50">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="bg-white z-40 rounded-lg shadow-lg p-8 max-w-2xl w-full sm:w-[700px] relative">
                                <div className='flex justify-between'>
                                    <button
                                        onClick={closeModal}
                                        className="text-gray-600 hover:text-gray-800 text-2xl"
                                    >
                                        <IoMdClose />
                                    </button>
                                    <button

                                        onClick={setIsModalOpen}
                                        className="items-center justify-center gap-2 flex bg-green-500 text-white p-1 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        empreendimento
                                    </button>
                                </div>
                                <h3 className="text-2xl font-semibold mb-6 text-gray-800">Lista empreendimento</h3>


                                {empreendimentos.length > 0 ? (
                                    <ul className="space-y-4">

                                        {empreendimentos.map((emp) => (
                                            <li key={emp.epd_id} className="flex justify-between items-center bg-white p-4 rounded shadow">
                                                <span>{emp.epd_nome} - {emp.epd_responsavel}</span>
                                                <div className="space-x-2">


                                                    {/* Abrir modal para editar dados */}
                                                    <button
                                                        onClick={() => openEditModal(emp)}
                                                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                                    >
                                                        Editar
                                                    </button>

                                                    <button
                                                        onClick={() => handleDelete(emp.epd_id)}
                                                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                                    >
                                                        Excluir
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500">Nenhum empreendimento cadastrado.</p>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {editModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white p-6 rounded-lg shadow-lg w-96"
                        >
                            <div className="flex justify-between mb-4">
                                <h3 className="text-lg font-semibold">Editar Empreendimento</h3>
                                <button onClick={closeEditModal} className="text-gray-600 hover:text-gray-800">
                                    <IoMdClose />
                                </button>
                            </div>
                            <form className="flex flex-col gap-4" onSubmit={handleFormSubmit}>
                                <input type="text" name="nomeEmpreendimento" value={formData.nomeEmpreendimento} onChange={handleChange} placeholder="Nome do Empreendimento" className="p-2 border rounded" />
                                <input type="text" name="cep" value={formData.cep} onChange={handleChange} placeholder="CEP" className="p-2 border rounded" />
                                <input type="text" name="numero" value={formData.numero} onChange={handleChange} placeholder="Número" className="p-2 border rounded" />
                                <input type="text" name="logradouro" value={formData.logradouro} onChange={handleChange} placeholder="Logradouro" className="p-2 border rounded" />
                                <input type="text" name="responsavel" value={formData.responsavel} onChange={handleChange} placeholder="Responsável" className="p-2 border rounded" />
                                <input type="text" name="engenheiro" value={formData.engenheiro} onChange={handleChange} placeholder="Engenheiro" className="p-2 border rounded" />
                                <input type="text" name="construtora" value={formData.construtora} onChange={handleChange} placeholder="Construtora" className="p-2 border rounded" />
                                <button type="submit" className="bg-green-500 text-white p-2 rounded hover:bg-green-700">Salvar</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>



            {isModalOpen && (
                <div className="fixed inset-0 z-[100] bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-gray-100 p-6 rounded-md shadow-lg">
                        <div className='flex justify-between items-center mb-4'>
                            <h3 className="text-lg font-semibold text-gray-700">Novo Empreendimento</h3>
                            <button type="button" onClick={toggleModal} className='bg-red-500 text-white p-2 rounded-md'>
                                X
                            </button>
                        </div>
                        <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
                            <input
                                type="text"
                                placeholder="Nome do empreendimento"
                                value={nomeEmpreendimento}
                                onChange={(e) => setNomeEmpreendimento(e.target.value)}
                                className="p-2 border border-gray-400 rounded focus:outline-none focus:border-blue-500"
                            />

                            <div className='flex gap-2'>
                                <input
                                    type="text"
                                    placeholder="CEP"
                                    value={cep}
                                    onChange={handleCepChange}
                                    className="w-96 p-2 border border-gray-400 rounded focus:outline-none focus:border-blue-500"
                                />
                                <input
                                    type="text"
                                    placeholder="Número"
                                    value={numero}
                                    onChange={(e) => setNumero(e.target.value)}
                                    className="p-2 border border-gray-400 rounded focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <input
                                type="text"
                                placeholder="Logradouro"
                                value={logradouro}
                                onChange={(e) => setLogradouro(e.target.value)}
                                className="p-2 border border-gray-400 rounded focus:outline-none focus:border-blue-500"
                            />

                            <input
                                type="text"
                                placeholder="Responsável"
                                value={responsavel}
                                onChange={(e) => setResponsavel(e.target.value)}
                                className="p-2 border border-gray-400 rounded focus:outline-none focus:border-blue-500"
                            />

                            <div className='flex justify-center gap-2'>
                                <input
                                    type="text"
                                    placeholder="Eng"
                                    value={engenheiro}
                                    onChange={(e) => setEngenheiro(e.target.value)}
                                    className="w-full p-2 border border-gray-400 rounded focus:outline-none focus:border-blue-500"
                                />

                                <input
                                    type="text"
                                    placeholder="Construtora"
                                    value={construtora}
                                    onChange={(e) => setConstrutora(e.target.value)}
                                    className="w-full p-2 border border-gray-400 rounded focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <select
                                value={arquitetoSelecionado}
                                onChange={(e) => setArquitetoSelecionado(e.target.value)}
                                className="p-2 border border-gray-400 rounded"
                            >
                                <option value="">Selecione o(a) Arquiteto(a)</option>
                                {arquitetos.map((arquiteto) => (
                                    <option key={arquiteto.pes_id} value={arquiteto.pes_id}>
                                        {arquiteto.pes_nome}
                                    </option>
                                ))}
                            </select>

                            <button type="submit" className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
                                Cadastrar
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
