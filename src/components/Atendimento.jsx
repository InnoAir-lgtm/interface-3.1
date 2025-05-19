import React, { useState } from 'react';

export default function Atendimento() {
    const [isOpen, setIsOpen] = useState(false);
    const toggleModal = () => setIsOpen(!isOpen);

    return (
        <div>
            <button
                onClick={toggleModal}
                className="w-72 h-64 bg-gray-200 border border-gray-400 rounded-lg shadow hover:shadow-md transition-all duration-200 text-gray-800 font-semibold flex flex-col justify-center items-center text-center"
            >
                Criar Atendimento
            </button>

            {isOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white rounded-lg border border-gray-300 p-8 w-full max-w-lg relative shadow-lg">
                        <button
                            onClick={toggleModal}
                            className="absolute top-4 right-4 w-8 h-8 bg-gray-200 border border-gray-400 rounded-full text-gray-600 hover:bg-red-500 hover:text-white flex items-center justify-center transition"
                        >
                            ✕
                        </button>
                        <h2 className="text-2xl font-bold mb-6 text-gray-700 text-center">Novo Atendimento</h2>
                        <form className="space-y-4">
                            <Input label="Data" type="date" />
                            <Input label="Situação" placeholder="Ex: Em andamento" />
                            <Input label="Prioridade" placeholder="Alta, Média, Baixa" />
                            <Input label="Importância" placeholder="Ex: Alta" />
                            <Input label="Ambientes Importantes" placeholder="Ambientes Impactados" />
                            <Input label="Incidência de Luz" placeholder="Direta, Indireta" />
                            <Input label="Data Situação" type="date" />
                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition"
                                >
                                    Salvar Atendimento
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

const Input = ({ label, type = "text", placeholder = "" }) => (
    <div className="flex flex-col">
        <label className="mb-1 text-sm font-medium text-gray-700">{label}:</label>
        <input
            type={type}
            placeholder={placeholder}
            className="w-full border border-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
    </div>
);
