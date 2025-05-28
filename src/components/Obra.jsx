import React, { useState, useEffect } from 'react';
import api from '../apiUrl';

export default function Obra({ schema, empreendimentoSelecionado }) {
    const [isOpen, setIsOpen] = useState(false);
    const [pessoas, setPessoas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const toggleModal = () => setIsOpen(!isOpen);

    const [clienteId, setClienteId] = useState(null);
    const [profissionalId, setProfissionalId] = useState(null);
    const [complemento, setComplemento] = useState('');
    const [nomeEngenheiro, setNomeEngenheiro] = useState('');
    const [telefoneEngenheiro, setTelefoneEngenheiro] = useState('');
    const [emailEngenheiro, setEmailEngenheiro] = useState('');




    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const body = {
                schema,
                epd_id: empreendimentoSelecionado?.epd_id,
                cliente_id: clienteId,
                profissional_id: profissionalId,
                complemento,
                eng_nome: nomeEngenheiro,
                eng_telefone: telefoneEngenheiro,
                eng_email: emailEngenheiro,
            };


            await api.post('/cadastrar-obra', body);
            alert("Obra cadastrada com sucesso!");
            toggleModal();
        } catch (error) {
            console.error("Erro ao cadastrar obra:", error);
            alert("Erro ao cadastrar obra. Verifique os dados e tente novamente.");
        }
    };


    useEffect(() => {
        const fetchPessoas = async () => {
            try {
                const response = await api.get(`/pessoas?schema=${schema}`);
                const data = response.data;

                if (!data || data.length === 0) {
                    setError("Nenhuma pessoa encontrada para o schema especificado.");
                } else {
                    const pessoasComTipo = await Promise.all(data.data.map(async (pessoa) => {
                        const tiposResponse = await api.get(`/tipos-pessoa?pes_id=${pessoa.pes_id}&schema=${schema}`);
                        return {
                            ...pessoa,
                            tipos: tiposResponse.data.data
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
        fetchPessoas();
    }, [schema]);

    const clientes = pessoas.filter(p =>
        p.tipos.some(tipo => tipo.tpp_descricao.toLowerCase() === 'cliente')
    );

    const profissionais = pessoas.filter(p =>
        p.tipos.some(tipo => tipo.tpp_descricao.toLowerCase() !== 'cliente')
    );

    return (
        <div>
            <button
                onClick={toggleModal}
                className="bg-green-500 px-4 text-white py-2 rounded hover:bg-green-600"
            >
                Obra
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
                        <h2 className="text-2xl font-bold mb-6 text-gray-700 text-center">Nova Obra</h2>
                        {loading ? (
                            <p className="text-center text-gray-500">Carregando pessoas...</p>
                        ) : error ? (
                            <p className="text-center text-red-500">{error}</p>
                        ) : (
                            <form className="space-y-4" onSubmit={handleSubmit}>
                                <div>
                                    <label htmlFor="">Nome empreendimento</label>
                                    <input
                                        type="text"
                                        value={empreendimentoSelecionado?.epd_nome || ''}
                                        readOnly
                                        className="w-full px-4 py-2 border border-gray-300 rounded"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <select
                                        value={clienteId || ''}
                                        onChange={(e) => setClienteId(Number(e.target.value))}
                                        className="w-full border border-gray-400 rounded-md px-3 py-2"
                                    >
                                        <option value="">Selecione o Cliente</option>
                                        {clientes.map(cliente => (
                                            <option key={cliente.pes_id} value={cliente.pes_id}>
                                                {cliente.pes_nome}
                                            </option>
                                        ))}
                                    </select>

                                    <select
                                        value={profissionalId || ''}
                                        onChange={(e) => setProfissionalId(Number(e.target.value))}
                                        className="w-full border border-gray-400 rounded-md px-3 py-2"
                                    >
                                        <option value="">Selecione o Profissional</option>
                                        {profissionais.map(profissional => (
                                            <option key={profissional.pes_id} value={profissional.pes_id}>
                                                {profissional.pes_nome} ({profissional.tipos.map(t => t.tpp_descricao).join(', ')})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <Input label="Complemento" value={complemento} onChange={setComplemento} placeholder="Complemento" />
                                <Input label="Nome Engenheiro" value={nomeEngenheiro} onChange={setNomeEngenheiro} placeholder="Nome do Engenheiro" />
                                <Input label="Telefone Engenheiro" value={telefoneEngenheiro} onChange={setTelefoneEngenheiro} placeholder="Telefone" />
                                <Input label="Email Engenheiro" value={emailEngenheiro} onChange={setEmailEngenheiro} placeholder="Email" />

                                <div className="flex justify-end pt-4">
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition"
                                    >
                                        Salvar Obra
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

const Input = ({ label, type = "text", placeholder = "", value, onChange }) => (
    <div className="flex flex-col">
        <label className="mb-1 text-sm font-medium text-gray-700">{label}:</label>
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full border border-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
    </div>
);

