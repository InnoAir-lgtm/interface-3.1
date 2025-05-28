import React, { useState, useEffect } from 'react';
import api from '../apiUrl'

export default function Atendimento({ nodes, schema }) {
    const [isOpen, setIsOpen] = useState(false);
    const [prospeccoesAtendimento, setProspeccoesAtendimento] = useState([]);
    const [formData, setFormData] = useState({});
    const toggleModal = () => setIsOpen(!isOpen);
    const [obras, setObras] = useState([]);
    const [colaboradores, setColaboradores] = useState([]);

    useEffect(() => {
        if (!schema) return;  // evita chamada com schema indefinido

        const fetchColaboradores = async () => {
            try {
                const response = await api.get(`/pessoas?schema=${schema}`);
                console.log("Resposta colaboradores:", response.data);
                if (Array.isArray(response.data.data)) {
                    setColaboradores(response.data.data);
                } else if (response.data.colaboradores) {
                    setColaboradores(response.data.colaboradores);
                } else {
                    setColaboradores([]);
                }

            } catch (error) {
                console.error("Erro ao buscar colaboradores:", error);
            }
        };

        fetchColaboradores();
    }, [schema]);



    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const opcoesImportancia = [
        { cor: 'bg-red-500', valor: 'Alta', descricao: 'Importância Alta: exige ação imediata.' },
        { cor: 'bg-yellow-400', valor: 'Média', descricao: 'Importância Média: atenção em breve.' },
        { cor: 'bg-green-500', valor: 'Baixa', descricao: 'Importância Baixa: pode esperar.' },
    ];


    useEffect(() => {
        if (nodes) {
            const atendimentos = nodes.filter((node) => node.column === 'atendimento');
            setProspeccoesAtendimento(atendimentos);
        }

        // Buscar obras da API
        const fetchObras = async () => {
            try {
                const response = await fetch('http://localhost:3000/obras?schema=belaarte');
                const data = await response.json();
                setObras(data);
            } catch (error) {
                console.error("Erro ao buscar obras:", error);
            }
        };

        fetchObras();
    }, [nodes]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data: result } = await api.post('/cadastrar-atendimento', {
                ...formData,
                ppc_id: parseInt(formData.ppc_id, 10),
                colaborador: parseInt(formData.colaborador, 10),
                obra_id: parseInt(formData.obra_id, 10),
                schema
            });

            alert('Atendimento cadastrado com sucesso!');
            toggleModal();
            setFormData({});
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Erro na requisição';
            alert('Erro: ' + errorMsg);
        }
    };


    useEffect(() => {
        if (nodes) {
            const atendimentos = nodes.filter((node) => node.column === 'atendimento');
            setProspeccoesAtendimento(atendimentos);
        }
    }, [nodes]);

    return (
        <div>
            <button
                onClick={toggleModal}
                className="bg-green-500 px-4 text-white py-2 rounded hover:bg-green-600"
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

                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <Input
                                label="Data"
                                type="date"
                                name="data"
                                value={formData.data || ''}
                                onChange={handleChange}
                            />

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Situação (Prospecções em Atendimento)
                                </label>
                                <select
                                    name="situacao"
                                    value={formData.situacao || ''}
                                    onChange={(e) => {
                                        const selectedLabel = e.target.value;
                                        const selectedItem = prospeccoesAtendimento.find(item => item.label === selectedLabel);
                                        setFormData(prev => ({
                                            ...prev,
                                            situacao: selectedLabel,
                                            ppc_id: selectedItem ? selectedItem.id : ''
                                        }));
                                    }}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                >
                                    <option value="">Selecione uma prospecção</option>
                                    {prospeccoesAtendimento.map((item) => (
                                        <option key={item.id} value={item.label}>
                                            {item.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Prioridade</label>
                                <select
                                    name="prioridade"
                                    value={formData.prioridade || ''}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                >
                                    <option value="">Selecione</option>
                                    <option value="Alta">Alta</option>
                                    <option value="Baixa">Baixa</option>
                                    <option value="Media">Média</option>
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Importância</label>
                                <div className="flex gap-4">
                                    {opcoesImportancia.map((opcao) => (
                                        <div
                                            key={opcao.valor}
                                            onClick={() =>
                                                setFormData((prev) => ({ ...prev, importancia: opcao.valor }))
                                            }
                                            className={`cursor-pointer p-4 rounded-lg text-white shadow-md transition-all border-2 
                    ${opcao.cor} 
                    ${formData.importancia === opcao.valor
                                                    ? 'border-black scale-105'
                                                    : 'border-transparent opacity-80 hover:opacity-100'
                                                }`}
                                        >
                                            <div className="font-bold">{opcao.valor}</div>
                                            <div className="text-sm">{opcao.descricao}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>


                            <div>
                                <label className="block text-sm font-medium text-gray-700">Obra</label>
                                <select
                                    name="obra_id"
                                    value={formData.obra_id || ''}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                >
                                    <option value="">Selecione uma obra</option>
                                    {obras.map((obra) => (
                                        <option key={obra.obr_id} value={obra.obr_id}>
                                            {obra.obr_eng_nome?.trim() || `Obra #${obra.obr_id}`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-4">
                                <Input
                                    label="Ambientes Importantes"
                                    name="ambientes"
                                    placeholder="Ambientes Impactados"
                                    value={formData.ambientes || ''}
                                    onChange={handleChange}
                                />
                                <Input
                                    label="Incidência de Luz"
                                    name="luz"
                                    placeholder="Direta, Indireta"
                                    value={formData.luz || ''}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Colaborador</label>
                                <select
                                    name="colaborador"
                                    value={formData.colaborador || ''}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                >
                                    <option value="">Selecione um colaborador</option>
                                    {colaboradores.map((colab) => (
                                        <option key={colab.pes_id} value={colab.pes_id}>
                                            {colab.pes_nome}
                                        </option>
                                    ))}
                                </select>
                            </div>



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

const Input = ({ label, type = "text", placeholder = "", name, value, onChange }) => (
    <div className="flex flex-col mb-4 w-full">
        <label className="mb-1 text-sm font-medium text-gray-700">{label}:</label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full border border-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
    </div>
);
