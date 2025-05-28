import React, { useState, useEffect } from 'react';
import { IoBusinessOutline } from 'react-icons/io5';
import api from '../apiUrl';
import { IoMdClose } from "react-icons/io";
import { AnimatePresence, motion } from "motion/react";
import { GoPlus } from "react-icons/go";
import empreendiment from '../assets/hotel.png';
import Obra from '../components/Obra';

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
    const [showModal, setShowModal] = useState(false);
    const [enderecos, setEnderecos] = useState([]);
    const [empreendimentoSelecionado, setEmpreendimentoSelecionado] = useState(null);
    const [cepEndereco, setCepEndereco] = useState('');
    const [showEnderecoManualModal, setShowEnderecoManualModal] = useState(false);
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
    const [endereco, setEndereco] = useState({
        cep: '',
        logradouro: '',
        bairro: '',
        cidade: '',
        uf: ''
    });



    const handleSelectEndereco = (endereco) => {
        setCep(endereco.end_cep);

        setShowModal(false);
    };

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
        setCep('');
        setNumero('');
        setLogradouro('');
        setNomeEmpreendimento('');
        setResponsavel('');
        setConstrutora('');
        setEngenheiro('');
        setArquitetoSelecionado('');
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
        setCepEndereco('');
        const cleanCep = cepValue.replace(/\D/g, '');

        if (cleanCep.length === 8 && schema) {
            const cleanCepFormatado = cleanCep;

            // 1. Tenta buscar no banco
            try {
                const response = await api.get('/buscar-endereco', {
                    params: { schema, cep: cleanCepFormatado }
                });

                const data = response.data?.data?.[0];
                if (data) {
                    const textoEndereco = `Rua: ${data.end_logradouro || ''}, Bairro: ${data.end_bairro || ''}, Cidade: ${data.end_cidade || ''}, UF: ${data.end_uf || ''}`;
                    setCepEndereco(textoEndereco);
                    setEndereco(prev => ({
                        ...prev,
                        cep: data.end_cep,
                        logradouro: data.end_logradouro,
                        bairro: data.end_bairro,
                        cidade: data.end_cidade,
                        uf: data.end_uf
                    }));
                    return;
                }
            } catch (error) {
                if (error.response?.status !== 404) {
                    console.error('Erro ao consultar endereço no banco:', error.message);
                    setCepEndereco('Erro ao buscar no banco de dados.');
                    return;
                }
            }

            try {
                const response = await fetch(
                    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(cleanCepFormatado)}&key=AIzaSyDtW8rulgb5mXwwiU7LvfgXOhFHZBV0xWQ`
                );
                const data = await response.json();

                if (data.status === 'OK') {
                    const result = data.results[0];

                    const enderecoFormatado = result.address_components.reduce((acc, component) => {
                        const type = component.types[0];
                        switch (type) {
                            case 'route':
                                acc.logradouro = component.long_name;
                                break;
                            case 'sublocality_level_1':
                            case 'political':
                                acc.bairro = acc.bairro || component.long_name;
                                break;
                            case 'administrative_area_level_2':
                            case 'locality':
                                acc.cidade = component.long_name;
                                break;
                            case 'administrative_area_level_1':
                                acc.uf = component.short_name;
                                break;
                        }
                        return acc;
                    }, {});

                    const enderecoCompleto = {
                        cep: cleanCepFormatado,
                        logradouro: enderecoFormatado.logradouro || '',
                        bairro: enderecoFormatado.bairro || '',
                        cidade: enderecoFormatado.cidade || '',
                        uf: enderecoFormatado.uf || ''
                    };

                    const camposObrigatoriosPreenchidos =
                        enderecoCompleto.logradouro &&
                        enderecoCompleto.bairro &&
                        enderecoCompleto.cidade &&
                        enderecoCompleto.uf;

                    if (!camposObrigatoriosPreenchidos) {
                        setEndereco(enderecoCompleto);
                        setShowEnderecoManualModal(true);
                        return;
                    }

                    setEndereco(prev => ({ ...prev, ...enderecoCompleto }));

                    const textoEndereco = `${enderecoCompleto.logradouro}, ${enderecoCompleto.bairro}, ${enderecoCompleto.cidade} - ${enderecoCompleto.uf}`;
                    setCepEndereco(textoEndereco);
                    await api.post('/cadastrar-endereco', {
                        schema,
                        ...enderecoCompleto
                    });

                    console.log('Endereço cadastrado automaticamente.');

                } else {
                    setCepEndereco('Endereço não encontrado.');
                }

            } catch (error) {
                console.error('Erro ao chamar a API do Google Maps:', error.message);
                setCepEndereco('Erro ao buscar no Google Maps.');
            }
        }
    };


    const fetchEnderecos = async () => {
        if (!schema) return;
        try {
            const response = await api.get(`/listar-enderecos?schema=${schema}`);
            setEnderecos(response.data.data);
        } catch (error) {
            console.error('Erro ao buscar endereços:', error);
        }
    };

    useEffect(() => {
        fetchEnderecos();
    }, [schema]);

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

    const fetchEmpreendimentos = async () => {
        try {
            const response = await api.get(`/listar-empreendimentos?schema=${schema}`);
            setEmpreendimentos(response.data.data);
        } catch (error) {
            console.error('Erro ao buscar empreendimentos:', error);
        }
    };

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
            setIsModalOpen(false);
            fetchEmpreendimentos();
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
                setEditModal(false);
                fetchEmpreendimentos();
            }
        } catch (error) {
            console.error('Erro ao atualizar empreendimento:', error);
            alert('Erro ao atualizar o empreendimento.');
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

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
                                if (error.response?.status !== 404) {
                                    console.error(`Erro ao buscar tipos da pessoa ${pessoa.pes_id}:`, error);
                                }
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
                <img src={empreendiment} alt="Empreendimento" className="w-20 h-20 mt-2" />
                Empreendimento
            </button>

            <AnimatePresence initial={false}>
                {isOpen && (
                    <div className="fixed z-[100] inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="bg-white z-40 rounded-lg shadow-lg p-8 max-w-2xl w-full sm:w-[700px] relative">
                                <div className='flex justify-between'>
                                    <button
                                        onClick={setIsModalOpen}
                                        className="items-center justify-center gap-2 flex bg-green-500 text-white p-1 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <div className="flex items-center justify-center w-[30px] h-[30px] rounded bg-gray-500">
                                            <GoPlus className="text-white" />
                                        </div>
                                        Empreendimento
                                    </button>
                                    <button
                                        onClick={closeModal}
                                        className=" bg-red-500 text-white py-1 px-3 rounded-full hover:bg-red-600 transition"
                                    >
                                        <IoMdClose />
                                    </button>
                                </div>


                                <h3 className="text-2xl font-semibold mb-6 text-gray-800">Lista empreendimento</h3>
                                {empreendimentos.length > 0 ? (
                                    <ul className="space-y-4 mb-5">
                                        {empreendimentos.map((emp) => (
                                            <li key={emp.epd_id} className="flex justify-between items-center bg-white p-4 rounded shadow">
                                                <span>{emp.epd_nome} - {emp.epd_responsavel}</span>
                                                <div className="space-x-2 flex">
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

                                                    <Obra schema={schema} empreendimentoSelecionado={emp} />
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


            {/* Modal de edição de empreendimento */}
            <AnimatePresence>
                {editModal && (
                    <div className="fixed inset-0 flex items-center justify-center overflow-auto bg-black bg-opacity-50 z-[100]">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white p-4 rounded-lg shadow-lg"
                        >
                            <div className="flex justify-between mb-4">
                                <h3 className="text-lg font-semibold">Editar Empreendimento</h3>
                                <button onClick={closeEditModal} className="bg-red-500 text-white rounded-full w-6 h-6 flex justify-center items-center">
                                    <IoMdClose />
                                </button>
                            </div>

                            <form className="flex flex-col gap-4" onSubmit={handleFormSubmit}>
                                <div className="grid grid-cols-1 gap-2">
                                    <div className="flex flex-col">
                                        <label className="text-sm text-gray-600">Responsável</label>
                                        <input className="w-full h-8 border rounded outline-none p-2" type="text" name="responsavel" value={formData.responsavel} onChange={handleChange} placeholder="Responsável" />
                                    </div>

                                    <div className="flex gap-2">
                                        <div className="flex flex-col">
                                            <label className="text-sm text-gray-600">Logradouro</label>
                                            <input className="w-full h-8 border rounded outline-none p-2" type="text" name="logradouro" value={formData.logradouro} onChange={handleChange} placeholder="Logradouro" />
                                        </div>

                                        <div className="flex flex-col">
                                            <label className="text-sm text-gray-600">CEP</label>
                                            <input className="w-full h-8 border rounded outline-none p-2" type="text" name="cep" value={formData.cep} onChange={handleChange} placeholder="CEP" />
                                        </div>
                                    </div>

                                    <div className="flex flex-col">
                                        <label className="text-sm text-gray-600">Número</label>
                                        <input className="w-full h-8 border rounded outline-none p-2" type="text" name="numero" value={formData.numero} onChange={handleChange} placeholder="Número" />
                                    </div>

                                    <div className="flex flex-col">
                                        <label className="text-sm text-gray-600">Nome do empreendimento</label>
                                        <input className="w-full h-8 border rounded outline-none p-2" type="text" name="nomeEmpreendimento" value={formData.nomeEmpreendimento} onChange={handleChange} placeholder="Nome do Empreendimento" />
                                    </div>

                                    <div className="flex gap-2">

                                        <div className="flex flex-col">
                                            <label className="text-sm text-gray-600">Construtora</label>
                                            <input className="w-full h-8 border rounded outline-none p-2" type="text" name="construtora" value={formData.construtora} onChange={handleChange} placeholder="Construtora" />
                                        </div>

                                        <div className="flex flex-col">
                                            <label className="text-sm text-gray-600">Engenheiro</label>
                                            <input className="w-full h-8 border rounded outline-none p-2" type="text" name="engenheiro" value={formData.engenheiro} onChange={handleChange} placeholder="Engenheiro" />
                                        </div>
                                    </div>

                                </div>


                                <button type="submit" className="bg-green-500 text-white p-2 rounded hover:bg-green-700">Salvar</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>



            {/* Modal de cadastro */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] bg-black bg-opacity-50 flex justify-center items-center p-4">
                    <div className="bg-gray-100 p-6 rounded-md shadow-lg w-full max-w-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-700">Novo Empreendimento</h3>


                            <button
                                onClick={toggleModal}
                                className=" bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                            >
                                <IoMdClose />
                            </button>
                        </div>

                        {/* Formulário */}
                        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                            <input
                                type="text"
                                placeholder="Nome do empreendimento"
                                value={nomeEmpreendimento}
                                onChange={(e) => setNomeEmpreendimento(e.target.value)}
                                className="p-2 border border-gray-400 rounded focus:outline-none focus:border-blue-500 w-full"
                            />
                            {/* CEP e Número */}
                            <div className="flex gap-2">
                                <div className="border bg-white border-gray-400 rounded p-2 flex items-center w-full">
                                    <input
                                        type="text"
                                        placeholder="Digite seu CEP"
                                        value={cep}
                                        onChange={handleCepChange}
                                        className="w-full outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(true)}
                                        className="ml-2 bg-blue-500 text-white px-2 py-1 rounded text-sm"
                                    >
                                        Buscar
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Número"
                                    value={numero}
                                    onChange={(e) => setNumero(e.target.value)}
                                    className="p-2 border border-gray-400 rounded focus:outline-none focus:border-blue-500 w-1/3"
                                />
                            </div>

                            <p className="text-gray-700 text-sm">
                                {cep.length > 0 ? (cepEndereco || 'Buscando endereço...') : ''}
                            </p>


                            {/* Modal de Seleção de Endereço */}
                            {showModal && (
                                <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50 p-4">
                                    <div className="bg-white p-4 rounded shadow-lg w-full max-w-md">
                                        <h2 className="text-lg font-bold mb-2">Selecione um endereço</h2>
                                        <ul className="max-h-60 overflow-y-auto">
                                            {enderecos.map((endereco, index) => (
                                                <li
                                                    key={index}
                                                    className="p-2 cursor-pointer hover:bg-gray-200"
                                                    onClick={() => handleSelectEndereco(endereco)}
                                                >
                                                    {endereco.end_cep} - {endereco.end_logradouro}
                                                </li>
                                            ))}
                                        </ul>
                                        <button
                                            onClick={() => setShowModal(false)}
                                            className="mt-2 bg-gray-500 text-white px-4 py-1 rounded"
                                        >
                                            Fechar
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Logradouro */}
                            <input
                                type="text"
                                placeholder="Complemento"
                                value={logradouro}
                                onChange={(e) => setLogradouro(e.target.value)}
                                className="p-2 border border-gray-400 rounded focus:outline-none focus:border-blue-500 w-full"
                            />

                            {/* Responsável */}
                            <input
                                type="text"
                                placeholder="Responsável"
                                value={responsavel}
                                onChange={(e) => setResponsavel(e.target.value)}
                                className="p-2 border border-gray-400 rounded focus:outline-none focus:border-blue-500 w-full"
                            />

                            {/* Engenheiro e Construtora */}
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                    type="text"
                                    placeholder="Engenheiro"
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

                            {/* Arquiteto */}
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

                            {/* Botão de Cadastro */}
                            <button
                                type="submit"
                                className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                            >
                                Cadastrar
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {showEnderecoManualModal && (
                <div className="fixed inset-0 z-[150] bg-black bg-opacity-50 flex justify-center items-center p-4">
                    <div className="bg-white p-6 rounded-md w-full max-w-md shadow-lg">
                        <h2 className="text-lg font-semibold mb-2">Complete o Endereço</h2>

                        {/* Exibe o CEP digitado */}
                        <p className="text-sm text-gray-600 mb-4">
                            CEP digitado: <span className="font-medium">{cep}</span>
                        </p>

                        <div className="flex flex-col gap-3">
                            <input
                                type="text"
                                placeholder="Logradouro"
                                value={endereco.logradouro}
                                onChange={(e) =>
                                    setEndereco((prev) => ({ ...prev, logradouro: e.target.value }))
                                }
                                className="p-2 border border-gray-300 rounded"
                            />
                            <input
                                type="text"
                                placeholder="Bairro"
                                value={endereco.bairro}
                                onChange={(e) =>
                                    setEndereco((prev) => ({ ...prev, bairro: e.target.value }))
                                }
                                className="p-2 border border-gray-300 rounded"
                            />
                            <input
                                type="text"
                                placeholder="Cidade"
                                value={endereco.cidade}
                                onChange={(e) =>
                                    setEndereco((prev) => ({ ...prev, cidade: e.target.value }))
                                }
                                className="p-2 border border-gray-300 rounded"
                            />
                            <input
                                type="text"
                                placeholder="UF"
                                value={endereco.uf}
                                onChange={(e) =>
                                    setEndereco((prev) => ({ ...prev, uf: e.target.value }))
                                }
                                className="p-2 border border-gray-300 rounded"
                            />
                        </div>

                        <button
                            onClick={async () => {
                                const { logradouro, bairro, cidade, uf } = endereco;
                                if (!logradouro || !bairro || !cidade || !uf) {
                                    alert('Preencha todos os campos obrigatórios.');
                                    return;
                                }

                                await api.post('/cadastrar-endereco', {
                                    schema,
                                    ...endereco
                                });

                                setShowEnderecoManualModal(false);
                                console.log('Endereço cadastrado manualmente.');
                            }}
                            className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        >
                            Salvar Endereço
                        </button>
                    </div>
                </div>
            )}



        </div>
    );
}
