import React, { useEffect, useState } from 'react'
import { RiContactsBook3Fill } from "react-icons/ri";
import api from '../apiUrl';
import { IoMdArrowDropright } from "react-icons/io"
import CadastrarEmail from '../cadastros/CadastrarEmail';
import { FiTrash } from "react-icons/fi";

export default function ListarContatos({ selectedPessoa, schema }) {
    const [contatos, setContatos] = useState([])
    const [shopPopUp, setShoPopUp] = useState(false)

    useEffect(() => {
        if (shopPopUp && selectedPessoa) {
            listarContato(selectedPessoa.pes_id, schema)
        }
    }, [shopPopUp, selectedPessoa, schema])

    const listarContato = async (pes_id, schema) => {
        try {
            const response = await api.get(`/listar-contatos-pessoa?pes_id=${pes_id}&schema=${schema}`, {
            })
            setContatos(response.data.data || []);
        } catch (error) {
            console.error('Erro ao listar Contatos:', error.message);
        }
    }


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
                className="px-5 py-3 flex justify-center items-center w-48  transition-transform transform -translate-x-32 hover:translate-x-0 duration-300 ease-in-out  text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
                <RiContactsBook3Fill /> Lista de contatos <IoMdArrowDropright />
            </button>


            <div
                className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg transform ${shopPopUp ? 'translate-x-0' : 'translate-x-full'
                    } transition-transform duration-300 ease-in-out z-50`}
            >
                <div className="p-4  border-b border-gray-300 flex justify-between items-center">
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
                                        onClick={() => deletarContato(contato.ctt_id, schema)} // Usar 'ctt_id'
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
                    onClick={() => setShowSidebar(false)}
                    className="fixed inset-0 bg-black bg-opacity-50 z-40"
                ></div>
            )}
        </div>
    )
}
