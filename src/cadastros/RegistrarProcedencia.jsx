import React, { useState, useEffect } from 'react'; 
import api from '../apiUrl';

export default function RegistrarProcedencia({ schema }) {
    const [procedencia, setProcedencia] = useState('');
    const [procedencias, setProcedencias] = useState([]);
    const [abrirModal, setAbrirModal] = useState(false);
    const [message, setMessage] = useState('');

    const buscarProcedencias = async () => {
        if (!schema) return;
        try {
            const response = await api.get(`/procedencias?schema=${schema.trim()}`);
            setProcedencias(response.data.procedencias || []);
        } catch (error) {
            console.error("Erro ao buscar procedencias:", error);
        }
    };

    useEffect(() => {
        buscarProcedencias();
    }, [schema]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!schema || schema.trim() === '') {
            setMessage('Erro: O schema não foi identificado corretamente.');
            return;
        }

        try {
            const response = await api.post('/cadastrar-procedencia', {
                schema: schema.trim(),
                procedencia,
            });

            if (response.status === 201) {
                setMessage('Procedência cadastrada com sucesso!');
                setProcedencia('');
                buscarProcedencias(); // Atualiza a lista após cadastrar
            } else {
                throw new Error('Erro ao cadastrar tipo. Status inesperado.');
            }
        } catch (error) {
            console.error("Erro ao cadastrar tipo:", error);
            setMessage(`Erro: ${error.response?.data?.message || error.message}`);
        }
    };

    const openModal = () => {
        setAbrirModal(true);
    };

    const closeModal = () => {
        setAbrirModal(false);
    };

    return (
        <div>
            <button
                onClick={openModal}
                className="w-full flex items-center gap-2 p-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-all duration-300"
            >
                Registrar procedência
            </button>

            {abrirModal && (
                <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50 z-50 w-screen h-screen">
                    <div className="bg-white text-black p-6 rounded shadow-lg w-full max-w-md relative">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-bold">Registrar procedência</h2>
                            <button
                                onClick={closeModal}
                                className="bg-red-500 rounded-full text-white px-4 py-2 hover:bg-red-600"
                            >
                                X
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="mt-4">
                                <label htmlFor="descricao" className="block text-gray-700">Descrição</label>
                                <input
                                    type="text"
                                    id="descricao"
                                    value={procedencia}
                                    onChange={(e) => setProcedencia(e.target.value)}
                                    className="w-full p-2 text-black border rounded"
                                    required
                                />
                            </div>

                            <button type="submit" className="mt-4 w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                                Cadastrar
                            </button>
                        </form>

                        {/* Mostrar mensagem de sucesso/erro */}
                        {message && <p className="mt-4 text-center">{message}</p>}

                        {/* Listar Procedências */}
                        <div className="mt-6">
                            <h3 className="font-semibold mb-2">Procedências cadastradas:</h3>
                            <ul className="max-h-40 overflow-y-auto">
                                {procedencias.length > 0 ? (
                                    procedencias.map((item) => (
                                        <li key={item.pcd_id} className="border-b p-2">
                                            {item.pcd_procedencia}
                                        </li>
                                    ))
                                ) : (
                                    <li className="text-gray-500">Nenhuma procedência cadastrada.</li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
