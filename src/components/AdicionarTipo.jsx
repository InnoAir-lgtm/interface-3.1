import React, { useState } from 'react';
import { FiTrash } from 'react-icons/fi';
import api from '../apiUrl';

export default function AdicionarTipo({
    schema,
    selectedPessoa,
    setPessoas,
    setSelectedPessoa
}) {
    const [isAddTipoModalOpen, setIsAddTipoModalOpen] = useState(false);
    const [availableTipos, setAvailableTipos] = useState([]);
    const [selectedTipo, setSelectedTipo] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchAvailableTipos = async () => {
        try {
            const response = await api.get(`/listar-tipos-pessoa?schema=${schema}`);
            setAvailableTipos(response.data.data || []);
        } catch (error) {
            console.error("Erro ao buscar tipos de pessoa:", error);
            setAvailableTipos([]);
        }
    };

    const handleDeleteTipoPessoa = async (pes_id, tpp_id) => {
        try {
            const response = await api.delete(`/deletar-tipos-pessoa?pes_id=${pes_id}&tpp_id=${tpp_id}&schema=${schema}`);
            if (response.status === 200) {
                const tiposResponse = await api.get(`/tipos-pessoa?pes_id=${pes_id}&schema=${schema}`);
                const novosTipos = tiposResponse.data.data;
                setPessoas((prev) =>
                    prev.map((p) =>
                        p.pes_id === pes_id ? { ...p, tipos: novosTipos } : p
                    )
                );
                setSelectedPessoa((prev) =>
                    prev?.pes_id === pes_id ? { ...prev, tipos: novosTipos } : prev
                );
                alert('Tipo de pessoa excluído com sucesso!');
            }
        } catch (error) {
            console.error('Erro ao excluir tipo de pessoa:', error);
            alert('Erro ao excluir tipo de pessoa.');
        }
    };

    const handleAddTipoPessoa = async (pes_id, tpp_id) => {
        try {
            await api.post(
                `/associar-tipo-pessoa?schema=${schema}`,
                { pes_id, tpp_id },
                { headers: { 'Content-Type': 'application/json' } }
            );

            // Fechar o modal
            setIsAddTipoModalOpen(false);
            setSelectedTipo(null);

            // Mostrar o alert
            alert('Tipo associado com sucesso!');

            // Atualizar os dados da pessoa com os tipos atualizados
            const tiposResponse = await api.get(`/tipos-pessoa?pes_id=${pes_id}&schema=${schema}`);
            const novosTipos = tiposResponse.data.data;

            setPessoas((prev) =>
                prev.map((p) =>
                    p.pes_id === pes_id ? { ...p, tipos: novosTipos } : p
                )
            );
            setSelectedPessoa((prev) =>
                prev?.pes_id === pes_id ? { ...prev, tipos: novosTipos } : prev
            );
        } catch (error) {
            console.error('Erro ao adicionar tipo de pessoa:', error);
            alert('Erro ao adicionar tipo de pessoa.');
        }
    };

    return (
        <div className="mb-3">
            <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                    Tipos Pessoa
                </label>
                <button
                    className="bg-green-500 text-white p-1 rounded-lg"
                    onClick={async (e) => {
                        e.preventDefault();
                        await fetchAvailableTipos();
                        setIsAddTipoModalOpen(true);
                    }}
                >
                    Adicionar Tipos
                </button>
            </div>

            <div className="flex flex-wrap gap-2 mt-2 border p-2">
                {selectedPessoa?.tipos.map((tipo, index) => (
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

            {isAddTipoModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
                        <h3 className="text-xl font-semibold mb-4">Adicionar Tipo de Pessoa</h3>
                        <select
                            className="w-full p-2 border border-gray-300 rounded-lg mb-4"
                            onChange={(e) => setSelectedTipo(e.target.value)}
                            value={selectedTipo || ''}
                        >
                            <option value="">Selecione um tipo</option>
                            {availableTipos.map((tipo) => (
                                <option key={tipo.tpp_id} value={tipo.tpp_id}>
                                    {tipo.tpp_descricao}
                                </option>
                            ))}
                        </select>
                        <div className="flex justify-end gap-2">
                            <button
                                className="bg-gray-300 text-black px-4 py-2 rounded-lg"
                                onClick={() => setIsAddTipoModalOpen(false)}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                                onClick={async (e) => {
                                    e.preventDefault();
                                    if (selectedTipo) {
                                        await handleAddTipoPessoa(selectedPessoa.pes_id, selectedTipo);
                                    } else {
                                        alert('Selecione um tipo primeiro.');
                                    }
                                }}
                            >
                                Adicionar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {loading && (
                <div className="mt-4 text-center text-gray-500">Carregando...</div>
            )}
        </div>
    );
}
