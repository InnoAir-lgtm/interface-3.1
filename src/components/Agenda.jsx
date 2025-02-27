import React, { useState, useEffect } from "react";
import api from "../apiUrl";
import { useAuth } from "../auth/AuthContext";
import { DateTime } from 'luxon';
import { FaCheck } from "react-icons/fa";
import { usePermissions } from "../middleware/middleware";

export default function ListagemAfazeres({ schema }) {
    const { verifyAndCreatePermission } = usePermissions()
    const { user } = useAuth();

    const [userId, setUserId] = useState(null);
    const [afazeres, setAfazeres] = useState([]);
    const [confirm, setConfirm] = useState(false);
    const [status, setStatus] = useState('');
    const [observacao, setObservacao] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [confirmingAfazerId, setConfirmingAfazerId] = useState(null);
    const [tecnicos, setTecnicos] = useState([]);
    const [tecnicoSelecionado, setTecnicoSelecionado] = useState("");
    const [isGestor, setIsGestor] = useState(false);


    useEffect(() => {
        async function verificarPermissao() {
            const hasPermission = await verifyAndCreatePermission("gestorEquipe");
            setIsGestor(hasPermission);
        }
        verificarPermissao();
    }, []);

    useEffect(() => {
        async function buscarUsuarioLogado() {
            if (!user?.email) return;
            try {
                const response = await api.get(`/pessoas?email=${user.email}&schema=${schema}`);
                if (response.data.data.length > 0) {
                    setUserId(response.data.data[0].pes_id);
                }
            } catch (error) {
                console.error("Erro ao buscar usuário logado:", error);
            }
        }
        buscarUsuarioLogado();
    }, [user?.email]);


    useEffect(() => {
        async function encontrarPessoas() {
            if (!isGestor) return; // Apenas gestores carregam todos os técnicos

            try {
                const response = await api.get(`/pessoas?schema=${schema}`);
                if (Array.isArray(response.data.data)) {
                    const pessoasTecnicas = await Promise.all(
                        response.data.data.map(async (pessoa) => {
                            try {
                                const tipoResponse = await api.get(`/tipos-pessoa?pes_id=${pessoa.pes_id}&schema=${schema}`);
                                if (Array.isArray(tipoResponse.data.data)) {
                                    const temTipoTecnico = tipoResponse.data.data.some(
                                        (tipo) => tipo.tpp_descricao.toLowerCase() === "tecnico"
                                    );
                                    return temTipoTecnico ? pessoa : null;
                                }
                            } catch (error) {
                                console.error(`Erro ao buscar tipos para a pessoa ${pessoa.pes_id}:`, error);
                            }
                            return null;
                        })
                    );
                    setTecnicos(pessoasTecnicas.filter(Boolean));
                }
            } catch (error) {
                console.error("Erro ao buscar técnicos:", error);
            }
        }
        encontrarPessoas();
    }, [isGestor, schema]);

    useEffect(() => {
        async function buscarAfazeres() {
            if (!userId) return;

            let idParaBuscar = userId; 
            if (isGestor && tecnicoSelecionado) {
                idParaBuscar = tecnicoSelecionado;
            } else if (isGestor) {
                idParaBuscar = null; 
            }

            try {
                const url = idParaBuscar
                    ? `/eventos?schema=${schema}&pes_evento=${idParaBuscar}`
                    : `/eventos?schema=${schema}`; 

                const response = await api.get(url);

                if (Array.isArray(response.data.data)) {
                    setAfazeres(response.data.data);
                } else {
                    console.error("Formato de eventos inválido:", response.data);
                }
            } catch (error) {
                console.error("Erro ao buscar afazeres:", error);
            }
        }

        buscarAfazeres();
    }, [isGestor, tecnicoSelecionado, userId, schema]);



    const handleConfirm = async (afazerId) => {
        try {
            const response = await api.put(`/eventos/${afazerId}`, { status, observacao });
            console.log('Trabalho confirmado:', response);
            setAfazeres(prevAfazeres =>
                prevAfazeres.map(afazer =>
                    afazer.evt_id === afazerId
                        ? { ...afazer, status, observacao }
                        : afazer
                )
            );
            setConfirm(false);
        } catch (error) {
            console.error('Erro ao confirmar trabalho:', error);
        }
    };
    const abrirModal = async (permissionName) => {
        if (!permissionName) {
            console.error("Erro: Nome da permissão não fornecido.");
            return;
        }
        const hasPermission = await verifyAndCreatePermission(permissionName);
        if (hasPermission) {
            setModalOpen(true);
        }
    }

    const fecharModal = () => {
        setModalOpen(false);
    }

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <button
                value="gestorEquipe"
                onClick={(e) => abrirModal(e.target.value || "gestorEquipe")}
                className="w-72 h-64 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 text-gray-800 font-semibold flex justify-center items-center text-center relative overflow-hidden border border-gray-300 z-10"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-50 opacity-30"></div>
                <div className="relative flex flex-col items-center justify-center space-y-4 w-full h-full">
                    <span className="font-medium text-xl text-gray-700">Agenda Técnico</span>
                </div>
            </button>


            {modalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-6xl max-h-[80vh] overflow-y-auto relative z-30">
                        <h2 className="text-xl font-bold mb-4 text-center">Cronograma do Técnico</h2>
                        <button
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
                            onClick={fecharModal}
                        >
                            &times;
                        </button>

                        {isGestor ? (
                            <div className="mb-4">
                                <select
                                    id="tecnicos"
                                    value={tecnicoSelecionado}
                                    onChange={(e) => setTecnicoSelecionado(e.target.value)}
                                    className="w-full border-gray-300 border p-2 rounded-lg"
                                >
                                    <option value="">Escolha um técnico</option>
                                    {tecnicos.map((tecnico) => (
                                        <option key={tecnico.pes_id} value={tecnico.pes_id}>
                                            {tecnico.pes_nome}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <p className="text-center font-semibold">
                                Você só pode visualizar sua própria agenda.
                            </p>
                        )}



                        <div className="overflow-x-auto">
                            <table className="min-w-full border-collapse border border-gray-300">
                                <thead>
                                    <tr className="bg-gray-200">
                                        <th className="border border-gray-300 px-4 py-2">Título</th>
                                        <th className="border border-gray-300 px-4 py-2">Descrição</th>
                                        <th className="border border-gray-300 px-4 py-2">Data</th>
                                        <th className="border border-gray-300 px-4 py-2">Horário</th>
                                        <th className="border border-gray-300 px-4 py-2">Local</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {afazeres.length > 0 ? (
                                        afazeres.map((afazer) => {
                                            const latitude = afazer.evt_lat;
                                            const longitude = afazer.evt_log;
                                            const mapsLink = latitude && longitude
                                                ? `https://www.google.com/maps?q=${latitude},${longitude}`
                                                : null;

                                            return (
                                                <tr key={afazer.evt_id} className="odd:bg-white even:bg-gray-100">
                                                    <td className="border border-gray-300 px-4 py-2">{afazer.evt_titulo || "Sem título"}</td>
                                                    <td className="border border-gray-300 px-4 py-2 break-words max-w-xs">{afazer.evt_descricao || "Sem descrição"}</td>
                                                    <td className="border border-gray-300 px-4 py-2">
                                                        {afazer.evt_evento && !isNaN(new Date(afazer.evt_evento)) ?
                                                            DateTime.fromISO(afazer.evt_evento).setZone('America/Sao_Paulo').toFormat('dd/MM/yyyy') : 'Data não informada'}
                                                    </td>
                                                    <td className="border border-gray-300 px-4 py-2">{afazer.evt_inicio} - {afazer.evt_fim}</td>
                                                    <td className="border border-gray-300 px-4 py-2">
                                                        {afazer.evt_local || "Local não informado"}

                                                        <div className="flex justify-between">
                                                            {mapsLink && (
                                                                <a href={mapsLink} target="_blank" className="text-blue-500 ml-2" rel="noopener noreferrer">
                                                                    Ver no mapa
                                                                </a>
                                                            )}

                                                            <div>
                                                                <button
                                                                    onClick={() => setConfirmingAfazerId(afazer.evt_id)}
                                                                    className="bg-green-600 p-2 rounded-lg text-white"
                                                                >
                                                                    <FaCheck />
                                                                </button>

                                                                {confirmingAfazerId === afazer.evt_id && (
                                                                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
                                                                        <div className="bg-white p-6 rounded-lg shadow-lg w-[50%] max-w-6xl max-h-[80vh] overflow-y-auto relative z-30">
                                                                            <button
                                                                                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
                                                                                onClick={() => setConfirmingAfazerId(null)}
                                                                            >
                                                                                &times;
                                                                            </button>
                                                                            <div>
                                                                                <div className="mb-4">
                                                                                    <label htmlFor="status" className="block text-gray-700">Status:</label>
                                                                                    <select
                                                                                        id="status"
                                                                                        value={status}
                                                                                        onChange={(e) => setStatus(e.target.value)}
                                                                                        className="w-full border-gray-300 border p-2 rounded-lg"
                                                                                    >
                                                                                        <option value="">Selecione o status</option>
                                                                                        <option value="confirmado">Confirmado</option>
                                                                                        <option value="pendente">Pendente</option>
                                                                                        <option value="concluido">Concluído</option>
                                                                                    </select>
                                                                                </div>
                                                                                <div className="mb-4">
                                                                                    <label htmlFor="observacao" className="block text-gray-700">Observação:</label>
                                                                                    <textarea
                                                                                        id="observacao"
                                                                                        value={observacao}
                                                                                        onChange={(e) => setObservacao(e.target.value)}
                                                                                        rows="4"
                                                                                        className="w-full border-gray-300 border p-2 rounded-lg"
                                                                                        placeholder="Adicione uma observação"
                                                                                    />
                                                                                </div>
                                                                                <button
                                                                                    onClick={() => handleConfirm(afazer.evt_id)}
                                                                                    className="bg-blue-500 text-white p-2 rounded-lg"
                                                                                >
                                                                                    Confirmar
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="border border-gray-300 px-4 py-2 text-center text-gray-600">Nenhum afazer encontrado.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
