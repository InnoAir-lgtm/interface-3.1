import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import CadastrarPessoa from "./CadastrarPessoa";
import CadastrarTipo from "./CadastrarTipo";
import CadastrarEndereco from "./CadastrarEndereco";
import CadastrarEmail from "./CadastrarEmail";
import CadastrarComplementar from "./CadastrarComplementar";
import ListEndPessoa from "./ListEndPessoa";
import ListarContatos from "./ListarContatos";
import { GiExpand } from "react-icons/gi";
import api from "../apiUrl";


const EmpresaComponent = ({ schema }) => {
    const [selectedPessoa, setSelectedPessoa] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [pessoas, setPessoas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");



    const fetchPessoas = async () => {
        try {
            const response = await api.get(`/pessoas?schema=${schema}`);
            const data = response.data;
            if (!data || data.length === 0) {
                setError("Nenhuma pessoa encontrada para o schema especificado.");
            } else {
                setPessoas(data.data);
            }
        } catch (error) {
            console.error("Erro ao buscar pessoas:", error);
            setError("Erro ao carregar os dados das pessoas.");
        } finally {
            setLoading(false);
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

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Gestão da Empresa</h2>

            <div className='flex items-center space-x-4'>
                <CadastrarTipo />
                <CadastrarPessoa schema={schema} />
            </div>

            <div className="mt-10">
                <button
                    onClick={openModal}
                    className="w-48 h-64 bg-white rounded-lg shadow-lg hover:shadow-xl hover:bg-gray-100 transition duration-200 text-gray-800 font-semibold flex justify-center items-center text-center relative"
                >
                    <div className="relative flex flex-col items-center justify-center space-y-3 w-full h-full">
                        <GiExpand className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 text-2xl transition transform hover:scale-110" />
                        <span className="font-medium transition transform hover:scale-105 hover:text-gray-600 text-lg">
                            Ver Pessoas
                        </span>
                        <div className="absolute bottom-4 right-4 flex items-center justify-center bg-red-500 text-white rounded-full w-9 h-9 text-xl font-semibold transition-transform duration-300 ease-in-out hover:scale-110 hover:rotate-12">
                            {pessoas.length}
                        </div>
                    </div>
                </button>
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
                                <button
                                    className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 text-2xl"
                                    onClick={closeModal}
                                >
                                    ✖
                                </button>

                                <h3 className="text-2xl font-semibold mb-6 text-gray-800">Lista de Usuários</h3>

                                {pessoas.length > 0 ? (
                                    <ul className="space-y-4">
                                        {pessoas.map((pessoa) => (
                                            <li
                                                key={pessoa.pes_id}
                                                className="p-6 bg-gray-50 border border-gray-200 rounded-lg shadow-sm hover:shadow-xl transition-all cursor-pointer"
                                                onClick={() => setSelectedPessoa(pessoa)}
                                            >
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
                        <div className="bg-gray-100 p-6 sm:p-8 md:p-10 rounded-lg shadow-lg w-full max-w-lg md:max-w-2xl lg:max-w-3xl h-auto max-h-screen overflow-y-auto flex">

                            <div className="absolute top-1/4 left-9 flex flex-col space-y-4">
                                <CadastrarEndereco schema={schema} />
                                <ListEndPessoa selectedPessoa={selectedPessoa} schema={schema} />
                                <ListarContatos selectedPessoa={selectedPessoa} schema={schema} />
                            </div>

                            <div className="flex-1 pl-4">
                                <div className="flex justify-between">
                                    <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Detalhes da Pessoa</h2>
                                    <button
                                        onClick={() => setSelectedPessoa(null)}
                                        className="bg-red-500 text-white px-1 rounded-lg hover:bg-red-600 transition duration-200">
                                        X
                                    </button>
                                </div>
                                <form>
                                    <div className='flex gap-4 mb-6'>
                                        <div className="w-1/2">
                                            <label htmlFor="nome" className="block text-sm font-medium text-gray-700">Nome</label>
                                            <input
                                                type="text"
                                                id="nome"
                                                className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
                                                value={selectedPessoa.pes_nome}
                                                readOnly
                                            />
                                        </div>
                                        <div className="w-1/2">
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
                                        <div className='flex gap-4 mb-6'>
                                            <div className="w-1/2">
                                                <label htmlFor="cpf" className="block text-sm font-medium text-gray-700">CPF</label>
                                                <input
                                                    type="text"
                                                    id="cpf"
                                                    className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
                                                    value={selectedPessoa.pes_cpf_cnpj}
                                                    readOnly
                                                />
                                            </div>
                                            <div className="w-1/2">
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
                                    ) : (
                                        <div className='flex gap-4 mb-6'>
                                            <div className="w-1/2">
                                                <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700">CNPJ</label>
                                                <input
                                                    type="text"
                                                    id="cnpj"
                                                    className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
                                                    value={selectedPessoa.pes_cpf_cnpj}
                                                    readOnly
                                                />
                                            </div>
                                            <div className="w-1/2">
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
                                <CadastrarEmail selectedPessoa={selectedPessoa} schema={schema} />
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