import { useState, useEffect } from "react";
import CadastrarPessoa from "./CadastrarPessoa";
import CadastrarTipo from "./CadastrarTipo";
import CadastrarEndereco from "./CadastrarEndereco";
import CadastrarEmail from "./CadastrarEmail";
import CadastrarComplementar from "./CadastrarComplementar";
import ListEndPessoa from "./ListEndPessoa";
import ListarContatos from "./ListarContatos";

import api from "../apiUrl";

const EmpresaComponent = ({ schema }) => {
    const [selectedPessoa, setSelectedPessoa] = useState(null);

    const [pessoas, setPessoas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");



    const fetchPessoas = async () => {
        try {
            const response = await api.get("/pessoas"); // Certifique-se de que a URL está correta
            const data = response.data; // Extrai os dados do response
            setPessoas(data); // Atualiza o estado com os dados recebidos
        } catch (error) {
            setError(error.message); // Define a mensagem de erro caso ocorra
        } finally {
            setLoading(false); // Finaliza o carregamento
        }
    };



    useEffect(() => {
        fetchPessoas();
    }, []);

    if (loading) {
        return <p>Carregando...</p>;
    }

    if (error) {
        return <p>Erro: {error}</p>;
    }

    return (
        <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Gestão da Empresa</h2>
            <p className="text-gray-600">Aqui você pode adicionar os componentes relacionados ao schema: <strong>{schema}</strong>.</p>

            <div className='flex items-center space-x-4'>

                <CadastrarTipo />

                <CadastrarPessoa />


            </div>

            <div className="p-4">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Lista de Pessoas</h2>
                {pessoas.length > 0 ? (
                    <ul className="space-y-2">
                        {pessoas.map((pessoa) => (
                            <li
                                key={pessoa.id}
                                className="p-4 border rounded shadow cursor-pointer"
                                onClick={() => setSelectedPessoa(pessoa)}
                            >
                                <p><strong>{pessoa.pes_fis_jur === "cnpj" ? "Nome Fantasia" : "Nome"}:</strong> {pessoa.pes_fantasia || pessoa.pes_nome}</p>
                                {pessoa.pes_fis_jur === "cnpj" && (
                                    <p><strong>CNPJ:</strong> {pessoa.pes_cpf_cnpj}</p>
                                )}
                                {pessoa.pes_fis_jur === "cpf" && (
                                    <p><strong>CPF:</strong> {pessoa.pes_cpf_cnpj}</p>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Nenhuma pessoa cadastrada.</p>
                )}
            </div>

            <div className="relative">
                {selectedPessoa && (
                    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
                        <div className="bg-gray-100 p-6 sm:p-8 md:p-10 rounded-lg shadow-lg w-full max-w-lg md:max-w-2xl lg:max-w-3xl h-auto max-h-screen overflow-y-auto flex">

                            <div className="absolute top-1/4 left-9 flex flex-col space-y-4">
                                <CadastrarEndereco />
                                <ListEndPessoa selectedPessoa={selectedPessoa} />
                                <ListarContatos selectedPessoa={selectedPessoa} />
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
                                <CadastrarEmail selectedPessoa={selectedPessoa} />
                                <CadastrarComplementar selectedPessoa={selectedPessoa} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmpresaComponent