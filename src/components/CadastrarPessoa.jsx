import React, { useEffect, useState } from "react";
import { GoPlus } from "react-icons/go";
import api from "../apiUrl";

export default function CadastrarPessoa() {
    const [tipoPessoa, setTipoPessoa] = useState("");
    const [nome, setNome] = useState("");
    const [cpf, setCpf] = useState("");
    const [rg, setRg] = useState("");
    const [dataNascimento, setDataNascimento] = useState("");
    const [cnpj, setCnpj] = useState("");
    const [inscricaoEstadual, setInscricaoEstadual] = useState("");
    const [fantasia, setNomeFantasia] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    const [tipoPessoaT, setTipoPessoaT] = useState([]);
    const [selectedTipo, setSelectedTipo] = useState('');

    useEffect(() => {
        const fetchTipoPessoaT = async () => {
            try {
                const response = await api.get("/listar-tipos-pessoa");
                if (response.status === 200) {
                    const resultData = Array.isArray(response.data.data) ? response.data.data : [];
                    setTipoPessoaT(resultData);
                } else {
                    console.error("Erro ao buscar tipos de pessoa:", response.statusText);
                }
            } catch (error) {
                console.error("Erro na conexão com a API:", error);
            }
        };
    
        fetchTipoPessoaT();
    }, []);

    const handleSelection = (e) => {
        setSelectedTipo(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
    
        const dados = {
            tipoPessoa,
            nome,
            cpf,
            rg,
            dataNascimento,
            cnpj,
            inscricaoEstadual,
            fantasia,
        };
    
        try {
            const response = await api.post("/cadastrar-pessoa", dados, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
    
            console.log("Resposta da API ao cadastrar pessoa:", response);
    
            if (response.status === 200 && response.data) { 
                const result = response.data;
                const pes_id = result.data[0].pes_id; 
    
                setMessage("Cadastro realizado com sucesso!");
                console.log("Pessoa cadastrada com sucesso:", result);
    
                if (selectedTipo && pes_id) {
                    const tipoPessoaResponse = await api.post("/cadastrar-tipo-pessoa", {
                        pes_id: pes_id, 
                        tpp_id: selectedTipo,
                    }, {
                        headers: {
                            "Content-Type": "application/json",
                        },
                    });
    
                    if (tipoPessoaResponse.status === 200) {
                        console.log("Cadastro na tabela pessoas_tipo realizado com sucesso!");
                    } else {
                        console.error("Erro ao cadastrar na tabela pessoas_tipo:", tipoPessoaResponse.statusText);
                        setMessage(`Erro ao cadastrar tipo de pessoa: ${tipoPessoaResponse.statusText}`);
                    }
                }
    
                setTipoPessoa("");
                setNome("");
                setCpf("");
                setRg("");
                setDataNascimento("");
                setCnpj("");
                setInscricaoEstadual("");
                setNomeFantasia("");
            } else {
                setMessage(`Erro ao realizar o cadastro. Status: ${response.status} - ${response.statusText}`);
                console.error("Erro na resposta da API:", response);
            }
        } catch (error) {
            setMessage("Erro na conexão com a API.");
            console.error("Erro na requisição:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(true)}
                className="items-center justify-center gap-2 flex bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <div className="flex items-center justify-center w-[30px] h-[30px] rounded bg-green-500">
                    <GoPlus className="text-white" />
                </div>
                Cadastrar pessoa
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex justify-center items-center bg-gray-800 bg-opacity-50">
                    <div className="bg-white border border-gray-300 shadow-lg rounded-lg p-6 w-full max-w-lg relative">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex justify-center items-center"
                        >
                            &times;
                        </button>
                        <h1 className="text-xl font-bold text-gray-800 mb-4 text-center">
                            Cadastro de Pessoa
                        </h1>
                        {message && <p className="text-center text-sm mb-4 text-red-600">{message}</p>}


                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Tipo Pessoa select */}
                            <div>
                                <label htmlFor="tipoPessoa" className="block text-sm font-semibold text-gray-700 mb-1">
                                    Tipo de Pessoa:
                                </label>
                                <select
                                    id="tipoPessoa"
                                    value={tipoPessoa}
                                    onChange={(e) => setTipoPessoa(e.target.value)}
                                    required
                                    className="w-full border border-gray-400 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                                >
                                    <option value="">Selecione</option>
                                    <option value="cpf">CPF</option>
                                    <option value="cnpj">CNPJ</option>
                                </select>
                            </div>

                            {/* Condicional para CPF */}
                            {tipoPessoa === "cpf" && (
                                <>
                                    <div>
                                        <label htmlFor="nome" className="block text-sm font-semibold text-gray-700 mb-1">
                                            Nome:
                                        </label>
                                        <input
                                            id="nome"
                                            type="text"
                                            value={nome}
                                            onChange={(e) => setNome(e.target.value)}
                                            maxLength={80}
                                            required
                                            placeholder="Digite o nome"
                                            className="w-full border border-gray-400 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="cpf" className="block text-sm font-semibold text-gray-700 mb-1">
                                            CPF:
                                        </label>
                                        <input
                                            id="cpf"
                                            type="text"
                                            value={cpf}
                                            onChange={(e) => setCpf(e.target.value)}
                                            maxLength={14}
                                            required
                                            placeholder="Digite o CPF"
                                            className="w-full border border-gray-400 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="rg" className="block text-sm font-semibold text-gray-700 mb-1">
                                            RG:
                                        </label>
                                        <input
                                            id="rg"
                                            type="text"
                                            value={rg}
                                            onChange={(e) => setRg(e.target.value)}
                                            required
                                            placeholder="Digite o RG"
                                            className="w-full border border-gray-400 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="dataNascimento" className="block text-sm font-semibold text-gray-700 mb-1">
                                            Data de Nascimento:
                                        </label>
                                        <input
                                            id="dataNascimento"
                                            type="date"
                                            value={dataNascimento}
                                            onChange={(e) => setDataNascimento(e.target.value)}
                                            required
                                            className="w-full border border-gray-400 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                                        />
                                    </div>

                                    {/* Selecione o tipo de pessoa */}
                                    <div>
                                        <label htmlFor="tipoPessoa">Selecione o Tipo de Pessoa:</label>
                                        <select
                                            id="tipoPessoa"
                                            value={selectedTipo}
                                            onChange={handleSelection}
                                            className="w-full border border-gray-400 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                                        >
                                            <option value="">-- Selecione --</option>
                                            {tipoPessoaT.map((tipo) => (
                                                <option key={tipo.tpp_id} value={tipo.tpp_id}>
                                                    {tipo.tpp_descricao}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </>
                            )}

                            {/* Condicional para CNPJ */}
                            {tipoPessoa === "cnpj" && (
                                <>
                                    <div>
                                        <label htmlFor="nome" className="block text-sm font-semibold text-gray-700 mb-1">
                                            Nome:
                                        </label>
                                        <input
                                            id="nome"
                                            type="text"
                                            value={nome}
                                            onChange={(e) => setNome(e.target.value)}
                                            maxLength={80}
                                            required
                                            placeholder="Digite o nome"
                                            className="w-full border border-gray-400 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="cnpj" className="block text-sm font-semibold text-gray-700 mb-1">
                                            CNPJ:
                                        </label>
                                        <input
                                            id="cnpj"
                                            type="text"
                                            value={cnpj}
                                            onChange={(e) => setCnpj(e.target.value)}
                                            maxLength={18}
                                            required
                                            placeholder="Digite o CNPJ"
                                            className="w-full border border-gray-400 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="inscricaoEstadual" className="block text-sm font-semibold text-gray-700 mb-1">
                                            Inscrição Estadual:
                                        </label>
                                        <input
                                            id="inscricaoEstadual"
                                            type="text"
                                            value={inscricaoEstadual}
                                            onChange={(e) => setInscricaoEstadual(e.target.value)}
                                            maxLength={30}
                                            required
                                            placeholder="Digite a inscrição estadual"
                                            className="w-full border border-gray-400 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="fantasia" className="block text-sm font-semibold text-gray-700 mb-1">
                                            Nome Fantasia:
                                        </label>
                                        <input
                                            id="fantasia"
                                            type="text"
                                            value={fantasia}
                                            onChange={(e) => setNomeFantasia(e.target.value)}
                                            maxLength={80}
                                            required
                                            placeholder="Digite o nome fantasia"
                                            className="w-full border border-gray-400 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                </>
                            )}

                            <div className="text-center">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full py-2 px-4 rounded bg-blue-500 text-white font-semibold ${loading ? 'opacity-50' : 'hover:bg-blue-700'}`}
                                >
                                    {loading ? "Cadastrando..." : "Cadastrar"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
