import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import CadastrarPessoa from "./CadastrarPessoa";
import CadastrarTipo from "./CadastrarTipo";
import CadastrarEndereco from "./CadastrarEndereco";
import CadastrarComplementar from "./CadastrarComplementar";
import ListEndPessoa from "./ListEndPessoa";
import ListarContatos from "./ListarContatos";
import { GiExpand } from "react-icons/gi";
import api from "../apiUrl";
import { FiTrash } from "react-icons/fi";
import { IoMdClose } from "react-icons/io";
import Agenda from "./Agenda";
import { IoReloadSharp } from "react-icons/io5";


const EmpresaComponent = ({ schema, empresaName }) => {
    const [selectedPessoa, setSelectedPessoa] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [pessoas, setPessoas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchPessoas = async () => {
        try {
            const response = await api.get(`/pessoas?schema=${schema}`);
            console.log("Schema enviado:", schema);
            const data = response.data;
            if (!data || data.length === 0) {
                setError("Nenhuma pessoa encontrada para o schema especificado.");
            } else {
                const pessoasComTipo = await Promise.all(data.data.map(async (pessoa) => {
                    const tiposResponse = await api.get(`/tipos-pessoa?pes_id=${pessoa.pes_id}&schema=${schema}`);
                    const tiposPessoa = tiposResponse.data.data;

                    return {
                        ...pessoa,
                        tipos: tiposPessoa
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

    const handleDeleteTipoPessoa = async (pes_id, tpp_id) => {
        try {
            const response = await api.delete(`/deletar-tipos-pessoa?pes_id=${pes_id}&tpp_id=${tpp_id}&schema=${schema}`);
            if (response.status === 200) {
                setPessoas((prevPessoas) =>
                    prevPessoas.map((pessoa) =>
                        pessoa.pes_id === pes_id
                            ? { ...pessoa, tipos: pessoa.tipos.filter((tipo) => tipo.tpp_id !== tpp_id) }
                            : pessoa
                    )
                );
                setSelectedPessoa((prevSelectedPessoa) => {
                    if (!prevSelectedPessoa || prevSelectedPessoa.pes_id !== pes_id) return prevSelectedPessoa;
                    return {
                        ...prevSelectedPessoa,
                        tipos: prevSelectedPessoa.tipos.filter((tipo) => tipo.tpp_id !== tpp_id),
                    };
                });
    
                alert('Tipo de pessoa excluído com sucesso!');
            }
        } catch (error) {
            console.error('Erro ao excluir tipo de pessoa:', error);
            alert('Erro ao excluir tipo de pessoa.');
        }
    };
    

    const openModal = () => {
        setIsOpen(true)
    }

    const closeModal = () => {
        setIsOpen(false)
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


    return (
        <div>
            <h2 className="text-2xl font-normal text-gray-800 mb-4">Gestão da <span className="font-extralight">{empresaName || "NOME DA EMPRESA"}</span></h2>

            <div className="flex sm:justify-center xl:justify-normal items-center flex-wrap gap-4 w-full h-full">
                <button
                    onClick={openModal}
                    className="w-72 h-64 bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-lg hover:shadow-2xl hover:bg-gradient-to-br hover:from-green-100 hover:to-white transition-all duration-300 text-gray-800 font-semibold flex flex-col justify-center items-center text-center relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-green-500 opacity-10 hover:opacity-20 transition-opacity duration-300 rounded-lg"></div>
                    <div className="h-full w-full relative flex flex-col items-center justify-center space-y-4">
                        <GiExpand className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 text-2xl transition transform hover:scale-110" />
                        <span className="font-medium text-lg transition transform hover:scale-105 hover:text-gray-600">
                            Pessoas
                        </span>
                        <div className="absolute bottom-4 right-4 flex items-center justify-center bg-red-500 text-white rounded-full w-9 h-9 text-xl font-semibold shadow-md transition-transform duration-300 ease-in-out hover:scale-110 hover:rotate-12">
                            {pessoas.length}
                        </div>
                    </div>
                </button>


                <CadastrarTipo schema={schema} />
                <Agenda />
            </div>

            <AnimatePresence initial={false}>
                {isOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full sm:w-[700px] relative">

                                <div className="flex justify-between">
                                    <button
                                        className="text-gray-600 hover:text-gray-800 text-2xl"
                                        onClick={closeModal}
                                    >
                                        <IoMdClose />
                                    </button>

                                    <div className="flex gap-10">
                                        <CadastrarPessoa schema={schema} />

                                        <button
                                            className=" bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition-transform duration-300 ease-in-out"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRefresh();
                                            }}
                                        >
                                            <IoReloadSharp />
                                        </button>
                                    </div>


                                </div>
                                <h3 className="text-2xl font-semibold mb-6 text-gray-800">Lista de Pessoas</h3>
                                {pessoas.length > 0 ? (
                                    <ul className="space-y-4">
                                        {pessoas.map((pessoa) => (
                                            <li
                                                key={pessoa.pes_id}
                                                className="relative p-6 bg-gray-50 border border-gray-200 rounded-lg shadow-sm hover:shadow-xl transition-all cursor-pointer"
                                                onClick={() => setSelectedPessoa(pessoa)}
                                            >
                                                <button
                                                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 transition-transform transform hover:scale-110"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeletePessoa(pessoa.pes_id);
                                                    }}
                                                >
                                                    <FiTrash className="w-5 h-5" />
                                                </button>

                                                <p className="text-lg font-medium text-gray-800">
                                                    <strong>{pessoa.pes_fis_jur === "cnpj" ? "Nome Fantasia" : "Nome"}:</strong> {pessoa.pes_fantasia || pessoa.pes_nome}
                                                </p>
                                                {pessoa.pes_fis_jur === "cnpj" ? (
                                                    <p className="text-sm text-gray-600"><strong>CNPJ:</strong> {pessoa.pes_cpf_cnpj}</p>
                                                ) : (
                                                    <p className="text-sm text-gray-600"><strong>CPF:</strong> {pessoa.pes_cpf_cnpj}</p>
                                                )}
                                            </li>
                                        ))}


                                    </ul>
                                ) : (
                                    <p className="text-gray-600">Nenhuma pessoa cadastrada.</p>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            <div className="relative">
                {selectedPessoa && (
                    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
                        <div className=" p-6 sm:p-8 md:p-10 rounded-lg shadow-lg w-full max-w-lg md:max-w-2xl lg:max-w-3xl h-auto max-h-screen overflow-y-auto flex">
                            <div className="absolute top-1/4 left-0 flex flex-col space-y-4 ">
                                <CadastrarEndereco schema={schema} />
                                <ListEndPessoa selectedPessoa={selectedPessoa} schema={schema} />
                                <ListarContatos selectedPessoa={selectedPessoa} schema={schema} />
                            </div>

                            <div className="flex-1 bg-white p-4 rounded-lg h-full">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl md:text-2xl font-semibold text-gray-800 border-b pb-2">Detalhes da Pessoa</h2>
                                    <button
                                        onClick={() => setSelectedPessoa(null)}
                                        className="bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600 transition duration-200"
                                    >
                                        X
                                    </button>
                                </div>
                                <form>
                                    <div className="flex flex-col md:flex-row gap-4 mb-6">
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

                                                <div className="mb-3">
                                                    <label htmlFor="tipo" className="block text-sm font-medium text-gray-700">Tipo Pessoa</label>
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {selectedPessoa.tipos.map((tipo, index) => (
                                                            <span
                                                                key={index}
                                                                className="flex items-center bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm border border-green-400"
                                                            >
                                                                {tipo.tpp_descricao}
                                                                <button
                                                                    className="ml-2 text-red-500 hover:text-red-700"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        handleDeleteTipoPessoa(selectedPessoa.pes_id, tipo.tpp_id);
                                                                    }}
                                                                >
                                                                    <FiTrash className="w-4 h-4" />
                                                                </button>
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>  
                                        </div>


                                    ) : (
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
                                    )}
                                    <div className="mb-4">
                                        <label htmlFor="fundacao" className="block text-sm font-medium text-gray-700">Data de Fundação</label>
                                        <input
                                            type="text"
                                            id="fundacao"
                                            className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
                                            value={selectedPessoa.pes_dn}
                                            readOnly
                                        />
                                    </div>
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