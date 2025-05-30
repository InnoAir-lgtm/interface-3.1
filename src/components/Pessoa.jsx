import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import CadastrarPessoa from "../cadastros/CadastrarPessoa";
import CadastrarEndereco from "../cadastros/CadastrarEndereco";
import CadastrarComplementar from "../cadastros/CadastrarComplementar";
import ListEndPessoa from "../Listagem/ListEndPessoa";
import ListarContatos from "../Listagem/ListarContatos";
import EditarUsuario from "./EditarUsuario";
import api from "../apiUrl";
import { FiTrash } from "react-icons/fi";
import { IoMdClose } from "react-icons/io";
import { IoReloadSharp } from "react-icons/io5";
import AgendaTecnico from "./AllCalender";
import Agenda from "./Agenda";
import EmpreendimentoRGI from "../cadastros/EmpreendimentoRGI";
import AdicionarTipo from "./AdicionarTipo"; import { FaUser } from "react-icons/fa"
import Prospeccao from "./Prospeccao.jsx";
import AtendimentoKanban from "./AtendimenteoKanban.jsx";


const EmpresaComponent = ({ schema, empresaName }) => {
    const [selectedPessoa, setSelectedPessoa] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [pessoas, setPessoas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isAddTipoModalOpen, setIsAddTipoModalOpen] = useState(false);
    const [selectedTipoFiltro, setSelectedTipoFiltro] = useState("");
    const [availableTipos, setAvailableTipos] = useState([]);
    const [selectedTipo, setSelectedTipo] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isTiposLoading, setIsTiposLoading] = useState(false);

    const fetchAvailableTipos = async () => {
        try {
            const response = await api.get(`/listar-tipos-pessoa?schema=${schema}`);
            setAvailableTipos(response.data.data || []);
        } catch (error) {
            console.error("Erro ao buscar tipos de pessoa:", error);
            setAvailableTipos([]);
        }
    };

    useEffect(() => {
        fetchAvailableTipos();
    }, [schema]);


    const openAddTipoModal = () => {
        fetchAvailableTipos();
        setIsAddTipoModalOpen(true);
    };

    const closeAddTipoModal = () => {
        setIsAddTipoModalOpen(false);
    };


    const fetchPessoas = async () => {
        try {
            const response = await api.get(`/pessoas?schema=${schema}`);
            const data = response.data;
            if (!data || data.length === 0) {
                setError("Nenhuma pessoa encontrada para o schema especificado.");
            } else {


                const pessoasComTipo = await Promise.all(data.data.map(async (pessoa) => {
                    const tiposResponse = await api.get(`/tipos-pessoa?pes_id=${pessoa.pes_id}&schema=${schema}`);
                    return {
                        ...pessoa,
                        tipos: tiposResponse.data.data
                    };
                }));
                setPessoas(pessoasComTipo);

            }
        } catch (error) {
            console.error("Erro ao buscar pessoas:", error);
            setError("Erro ao carregar os dados das pessoas.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePessoa = async (id) => {
        try {
            const response = await api.delete(`/pessoas/${id}?schema=${schema}`);
            if (response.status === 200) {
                setPessoas((prevPessoas) => prevPessoas.filter((pessoa) => pessoa.pes_id !== id));
                alert('Pessoa deletada com sucesso!');
            }
        } catch (error) {
            console.error("Erro ao deletar pessoa:", error);
            alert('Erro ao tentar deletar a pessoa.');
        }
    };

    const handleRefresh = () => {
        setLoading(true);
        fetchPessoas();
    };


    useEffect(() => {
        if (selectedPessoa) {
            const updatedPessoa = pessoas.find(p => p.pes_id === selectedPessoa.pes_id);
            if (updatedPessoa) {
                setSelectedPessoa(updatedPessoa);
            }
        }
    }, [pessoas]);



    const openModal = () => {
        setIsOpen(true)
    }



    useEffect(() => {
        fetchPessoas();
    }, [schema]);

    useEffect(() => {
    }, [pessoas]);
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                        repeat: Infinity,
                        duration: 1,
                        ease: "linear"
                    }}
                    className="w-16 h-16 border-4 border-blue-500 border-t-transparent border-solid rounded-full"
                />
            </div>
        );
    }
    if (error) {
        return <p>Erro: {error}</p>;
    }
    const filteredPessoas = pessoas.filter((pessoa) =>
        (pessoa.pes_nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
            pessoa.pes_cpf_cnpj.includes(searchQuery)) &&
        (selectedTipoFiltro === "" || pessoa.tipos.some(tipo => tipo.tpp_id === Number(selectedTipoFiltro)))
    );


    return (
        <div>
            <h2 className="text-2xl font-normal text-gray-800 mb-4">Gestão da <span className="font-extralight">{empresaName || "NOME DA EMPRESA"}</span></h2>
            <div className="flex sm:justify-center xl:justify-normal items-center flex-wrap gap-4 w-full h-full">
                <button
                    onClick={openModal}
                    className="w-72 h-64 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-gray-800 font-medium flex flex-col justify-center items-center text-center"
                >
                    <div className="h-full w-full relative flex flex-col items-center justify-center space-y-4">
                        <FaUser className="text-4xl text-gray-500 hover:text-gray-700 transition-transform duration-300 hover:scale-110" />
                        <span className="text-lg hover:text-gray-600 transition-transform hover:scale-105">
                            Pessoas
                        </span>
                        <div className="flex items-center justify-center text-white bg-gray-600 rounded-full w-9 h-9 text-sm font-semibold shadow">
                            {pessoas.length}
                        </div>
                    </div>
                </button>

                <Agenda schema={schema} selectedPessoa={selectedPessoa} />
                <AgendaTecnico schema={schema} selectedPessoa={selectedPessoa} />
                <EmpreendimentoRGI schema={schema} />
                <Prospeccao schema={schema} />
                <AtendimentoKanban schema={schema} />
            </div>

            <AnimatePresence initial={false}>
                {isOpen && (
                    <div className="fixed inset-0 p-10 flex items-start overflow-auto z-[100] justify-center bg-black bg-opacity-50">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="bg-white z-40 rounded-lg shadow-lg p-8 max-w-2xl w-full sm:w-[700px] relative">
                                <div className="flex justify-between">
                                    <div className="flex gap-4">
                                        <CadastrarPessoa schema={schema} />
                                        <button
                                            className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600"
                                            onClick={() => fetchPessoas()}
                                        >
                                            <IoReloadSharp />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                                    >
                                        <IoMdClose />
                                    </button>
                                </div>

                                <h3 className="text-2xl font-semibold mb-6 text-gray-800">Lista de Pessoas</h3>

                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Buscar pessoas..."
                                        className="mb-4 p-2 border border-gray-300 rounded-lg w-full"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <select
                                        className="mb-4 p-2 border border-gray-300 rounded-lg"
                                        value={selectedTipoFiltro}
                                        onChange={(e) => setSelectedTipoFiltro(e.target.value)}
                                    >
                                        <option value="">Filtrar tipo</option>
                                        {availableTipos.map((tipo) => (
                                            <option key={tipo.tpp_id} value={tipo.tpp_id}>{tipo.tpp_descricao}</option>
                                        ))}
                                    </select>
                                </div>

                                {filteredPessoas.length > 0 ? (
                                    <ul className="space-y-4 overflow-auto">
                                        {filteredPessoas.map((pessoa) => (
                                            <li
                                                key={pessoa.pes_id}
                                                className="relative p-6 bg-gray-50 border border-gray-200 rounded-lg shadow-sm hover:shadow-xl transition-all cursor-pointer"
                                                onClick={() => setSelectedPessoa(pessoa)}
                                            >
                                                <button
                                                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeletePessoa(pessoa.pes_id);
                                                    }}
                                                >
                                                    <FiTrash className="w-5 h-5" />
                                                </button>
                                                <p className="text-lg font-medium text-gray-800">
                                                    <strong>{pessoa.pes_fis_jur === "cnpj" ? "Nome Fantasia" : "Nome"}:</strong> {pessoa.pes_nome}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    <strong>{pessoa.pes_fis_jur === "cnpj" ? "CNPJ" : "CPF"}:</strong> {pessoa.pes_cpf_cnpj}
                                                </p>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-600">Nenhuma pessoa encontrada.</p>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="relative">
                {selectedPessoa && (
                    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-[100]">
                        <div className=" p-6 sm:p-8 md:p-10 rounded-lg shadow-lg w-full max-w-lg md:max-w-2xl lg:max-w-3xl h-auto max-h-screen overflow-y-auto flex">
                            <div className="absolute top-1/4 left-0 flex flex-col space-y-4 ">
                                <CadastrarEndereco schema={schema} />
                                <ListEndPessoa selectedPessoa={selectedPessoa} schema={schema} />
                                <ListarContatos selectedPessoa={selectedPessoa} schema={schema} />
                            </div>

                            <div className="flex-1 bg-white p-4 rounded-lg h-full ">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl md:text-2xl font-semibold text-gray-800">Detalhes da Pessoa</h2>

                                    <div className="flex gap-5">
                                        <EditarUsuario
                                            schema={schema}
                                            selectedPessoa={selectedPessoa}
                                            fetchPessoas={fetchPessoas}
                                        />
                                        <button
                                            onClick={() => setSelectedPessoa(null)}
                                            className="bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600 transition duration-200"
                                        >
                                            X
                                        </button>
                                    </div>
                                </div>


                                <form>
                                    <div className="flex flex-col md:flex-row gap-4 mb-2">
                                        <div className="w-full md:w-1/2">
                                            <label htmlFor="nome" className="block text-sm font-medium text-gray-700">Nome</label>
                                            <input
                                                type="text"
                                                id="nome"
                                                className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
                                                value={selectedPessoa.pes_nome}
                                                readOnly
                                            />
                                        </div>
                                        <div className="w-full md:w-1/2">
                                            <label htmlFor="tipo" className="block text-sm font-medium text-gray-700">Tipo</label>
                                            <input
                                                type="text"
                                                id="tipo"
                                                className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
                                                value={selectedPessoa.pes_fis_jur === "cpf" ? "Pessoa Física" : "Pessoa Jurídica"}
                                                readOnly
                                            />
                                        </div>
                                    </div>



                                    {selectedPessoa.pes_fis_jur === "cpf" ? (
                                        <div>
                                            <div className="flex flex-col md:flex-row gap-4 mb-2">
                                                <div className="w-full md:w-1/2">
                                                    <label htmlFor="cpf" className="block text-sm font-medium text-gray-700">CPF</label>
                                                    <input
                                                        type="text"
                                                        id="cpf"
                                                        className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
                                                        value={selectedPessoa.pes_cpf_cnpj}
                                                        readOnly
                                                    />
                                                </div>
                                                <div className="w-full md:w-1/2">
                                                    <label htmlFor="rg" className="block text-sm font-medium text-gray-700">RG</label>
                                                    <input
                                                        type="text"
                                                        id="rg"
                                                        className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
                                                        value={selectedPessoa.pes_rg}
                                                        readOnly
                                                    />
                                                </div>
                                            </div>

                                            <div className="mb-2">
                                                <label htmlFor="fundacao" className="block text-sm font-medium text-gray-700">Data de nascimento</label>
                                                <input
                                                    type="text"
                                                    id="fundacao"
                                                    className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
                                                    value={selectedPessoa.pes_dn}
                                                    readOnly
                                                />
                                            </div>

                                            <div className="mb-3">
                                                <AdicionarTipo
                                                    selectedPessoa={selectedPessoa}
                                                    setSelectedPessoa={setSelectedPessoa}
                                                    schema={schema}
                                                    setPessoas={setPessoas}
                                                />

                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="flex flex-col md:flex-row gap-4 mb-6">
                                                <div className="w-full md:w-1/2">
                                                    <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700">CNPJ</label>
                                                    <input
                                                        type="text"
                                                        id="cnpj"
                                                        className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
                                                        value={selectedPessoa.pes_cpf_cnpj}
                                                        readOnly
                                                    />
                                                </div>
                                                <div className="w-full md:w-1/2">
                                                    <label htmlFor="ie" className="block text-sm font-medium text-gray-700">Inscrição Estadual</label>
                                                    <input
                                                        type="text"
                                                        id="ie"
                                                        className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
                                                        value={selectedPessoa.pes_ie}
                                                        readOnly
                                                    />
                                                </div>
                                            </div>

                                            <AdicionarTipo
                                                selectedPessoa={selectedPessoa}
                                                setSelectedPessoa={setSelectedPessoa}
                                                schema={schema}
                                                setPessoas={setPessoas}
                                            />


                                        </div>
                                    )}
                                </form>


                                <CadastrarComplementar selectedPessoa={selectedPessoa} schema={schema} />
                            </div>

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmpresaComponent