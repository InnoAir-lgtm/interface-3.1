import React, { useEffect, useState } from 'react'
import { RiContactsBook3Fill } from "react-icons/ri";
import api from '../apiUrl';

export default function ListarContatos({ selectedPessoa }) {
    const [contatos, setContatos] = useState([])
    const [shopPopUp, setShoPopUp] = useState(false)

    useEffect(() => {
        if (shopPopUp && selectedPessoa) {
            listarContato(selectedPessoa.pes_id)
        }
    }, [shopPopUp, selectedPessoa])

    const listarContato = async (pes_id) => {
        try {
            const response = await api.get(`/listar-contatos-pessoa?pes_id=${pes_id}`, {
            })
            setContatos(response.data.data || []);
        } catch (error) {
            console.error('Erro ao listar Contatos:', error.message);
        }
    }

    return (
        <div>
            <button
                onClick={() => setShoPopUp(true)}
                className="px-5 py-3 flex items-center  text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
                <RiContactsBook3Fill /> Lista de contatos
            </button>


            <div
                className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg transform ${shopPopUp ? 'translate-x-0' : 'translate-x-full'
                    } transition-transform duration-300 ease-in-out z-50`}
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
                <div className="p-4">
                    {contatos.length > 0 ? (
                        <div className="grid gap-4">
                            {contatos.map((contatos, index) => (
                                <div key={index} className="p-4 border rounded-lg shadow-md bg-white">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2"> {contatos.ctt_tipo}</h3>
                                    <p>Responsavel: {contatos.ctt_contato}</p>
                                    <p>Contato: {contatos.ctt_numero_email}</p>
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
