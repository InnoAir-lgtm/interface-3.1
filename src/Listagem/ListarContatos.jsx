import React, { useEffect, useState } from 'react'
import api from '../apiUrl';
import { IoIosContacts } from "react-icons/io";
import CadastrarEmail from '../cadastros/CadastrarEmail';
import { FiTrash } from "react-icons/fi";

export default function ListarContatos({ selectedPessoa, schema }) {
    const [contatos, setContatos] = useState([])
    const [isHovered, setIsHovered] = useState(false);
    const [shopPopUp, setShoPopUp] = useState(false)

    useEffect(() => {
        if (shopPopUp && selectedPessoa) {
            listarContato(selectedPessoa.pes_id, schema)
        }
    }, [shopPopUp, selectedPessoa, schema])

    const listarContato = async (pes_id, schema) => {
        try {
            const response = await api.get(`/listar-contatos-pessoa?pes_id=${pes_id}&schema=${schema}`);
            setContatos(response.data.data || []);
        } catch (error) {
            console.error('Erro ao listar Contatos:', error.message);
        }
    };

    const deletarContato = async (ctt_id, schema) => {
        try {
            await api.delete(`/deletar-contato?ctt_id=${ctt_id}&schema=${schema}`);
            listarContato(selectedPessoa.pes_id, schema);
        } catch (error) {
            console.error('Erro ao deletar contato:', error.message);
        }
    };

    return (
        <div>
            <button
                onClick={() => setShoPopUp(true)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="flex items-center justify-center w-12 hover:w-48 overflow-hidden transition-all duration-300 ease-in-out text-white bg-blue-500 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 p-3"
            >
                <IoIosContacts className="text-white text-lg transition-all duration-300" />
                <span className={`ml-2 whitespace-nowrap transition-all duration-300 ${isHovered ? "opacity-100 w-auto" : "opacity-0 w-0"}`}>
                    Lista de contatos
                </span>
            </button>

            <div
                className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg transform ${shopPopUp ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out z-50`}
            >
                <div className="p-4 border-b border-gray-300 flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Lista de contatos</h2>
                    <button
                        onClick={() => setShoPopUp(false)}
                        className="bg-red-600 text-white p-2 rounded-full focus:outline-none hover:bg-red-700"
                    >
                        ✕
                    </button>
                </div>

                <CadastrarEmail selectedPessoa={selectedPessoa} schema={schema} atualizarListaContatos={() => listarContato(selectedPessoa.pes_id, schema)} />

                <div className="p-4">
                    {contatos.length > 0 ? (
                        <div className="grid gap-4">
                            {contatos.map((contato, index) => (
                                <div key={index} className="p-4 border rounded-lg shadow-md bg-white">
                                    <button
                                        className="text-red-500 hover:text-red-700 transition-transform transform hover:scale-110"
                                        onClick={() => deletarContato(contato.ctt_id, schema)}
                                    >
                                        <FiTrash className="w-5 h-5" />
                                    </button>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{contato.ctt_tipo}</h3>
                                    <p>Responsável: {contato.ctt_contato}</p>
                                    <p>Contato: {contato.ctt_numero_email}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">Nenhum endereço associado ao usuário.</p>
                    )}
                </div>
            </div>

            {shopPopUp && (
                <div
                    onClick={() => setShoPopUp(false)}
                    className="fixed inset-0 bg-black bg-opacity-50 z-40"
                ></div>
            )}
        </div>
    )
}
