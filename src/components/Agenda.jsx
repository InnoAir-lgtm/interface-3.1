import React, { useState, useEffect } from "react";
import api from "../apiUrl";
import { useAuth } from "../auth/AuthContext";
import { DateTime } from "luxon";
import { FaChevronDown } from "react-icons/fa";
import GestorEquipe from "./AgendaTecnicos";
import { SlCalender } from "react-icons/sl";

import { usePermissions } from "../middleware/middleware";

export default function ListagemAfazeres({ schema }) {
  const { verifyAndCreatePermission } = usePermissions();
  const { user } = useAuth();
  const [userId, setUserId] = useState(null);
  const [afazeres, setAfazeres] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [observacao, setObservacao] = useState(""); // Estado para armazenar a observação


  useEffect(() => {
    async function buscarUsuarioLogado() {
      if (!user?.email) return;
      try {
        const response = await api.get(
          `/pessoas?email=${user.email}&schema=${schema}`
        );
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
    if (!modalOpen) return;
    async function buscarAfazeresDoUsuario() {
      if (!userId) return;
      setLoading(true);
      try {
        const response = await api.get(
          `/eventos?schema=${schema}&pes_evento=${userId}`
        );
        if (Array.isArray(response.data.data)) {
          setAfazeres(response.data.data);
        }
      } catch (error) {
        console.error("Erro ao buscar afazeres do usuário:", error);
      } finally {
        setLoading(false); // Finaliza o carregamento
      }
    }
    buscarAfazeresDoUsuario();
  }, [modalOpen, userId, schema]);


  const handleCompleteEvent = async (eventId) => {
    setAfazeres((prevAfazeres) =>
      prevAfazeres.map((afazer) =>
        afazer.evt_id === eventId ? { ...afazer, evt_status: "concluido" } : afazer
      )
    );

    try {
      const response = await api.put(`/eventos/${eventId}/status-descricao?schema=${schema}`, {
        status: "concluido",
        descricao: "Tarefa finalizada pelo técnico",
        observacao: observacao || "Sem observação", // Passando a observação
        schema,
      });

      if (response.status === 200) {
        console.log("Evento marcado como concluído com sucesso!");
        setObservacao(""); // Limpa o campo de observação após salvar
      }
    } catch (error) {
      console.error("Erro ao atualizar o evento:", error);
      alert("Houve um erro ao concluir o evento.");
    }
  };



  const abrirModal = async (permissionName) => {
    const hasPermission = await verifyAndCreatePermission(permissionName);
    if (hasPermission) {
      setModalOpen(true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2">

      <button
        value="agendaTecn"
        onClick={(e) => abrirModal(e.target.value || 'agendaTecn')}
        className="w-72 h-64 bg-gradient-to-br to-gray-300 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-gray-800 font-semibold flex flex-col justify-center items-center text-center overflow-hidden"
      >

        <span className="font-medium flex items-center gap-1 text-lg transition transform hover:scale-105 hover:text-gray-600">
          <SlCalender />
        </span>
        tecnico

      </button>



      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-6xl max-h-[80vh] overflow-y-auto relative">
            <GestorEquipe schema={schema} />
            <h2 className="text-xl font-bold mb-4 text-center">Cronograma do Técnico</h2>
            <button
              className="absolute top-4 right-4 bg-red-500 text-white py-1 px-3 rounded-full hover:bg-red-600 transition"
              onClick={() => setModalOpen(false)}
            >
              &times;
            </button>

            {loading && (
              <div className="absolute inset-0 bg-white opacity-75 flex justify-center items-center">
                <div className="w-16 h-16 border-4 border-t-4 border-blue-500 rounded-full animate-spin"></div>
              </div>
            )}

            <div className="md:hidden w-full">
              {afazeres.map((afazer, index) => {
                const latitude = afazer.evt_lat;
                const longitude = afazer.evt_log;
                const mapsLink = latitude && longitude ? `https://www.google.com/maps?q=${latitude},${longitude}` : null;
                return (
                  <div key={afazer.evt_id} className="border rounded-lg p-3 mb-2">
                    <div className="flex justify-between items-center cursor-pointer" onClick={() => setSelectedRow(selectedRow === index ? null : index)}>
                      <span className="font-medium">{afazer.evt_titulo || "Sem título"}</span>
                      <FaChevronDown className={`${selectedRow === index ? "rotate-180" : "rotate-0"} transition-transform`} />
                    </div>
                    {selectedRow === index && (
                      <div className="mt-2 text-sm">
                        <p><strong>Descrição:</strong> {afazer.evt_descricao || "Sem descrição"}</p>
                        <p><strong>Data:</strong> {DateTime.fromISO(afazer.evt_evento).toFormat("dd/MM/yyyy")}</p>
                        <p><strong>Horário:</strong> {afazer.evt_inicio} - {afazer.evt_fim}</p>
                        <p><strong>Local:</strong> {afazer.evt_local || "Local não informado"}</p>
                        <div className="mt-2 flex flex-col gap-2">
                          {mapsLink && (
                            <a href={mapsLink} target="_blank" className="text-blue-500" rel="noopener noreferrer">Ver no mapa</a>
                          )}
                          {afazer.evt_status === "concluido" ? (
                            <span className="text-green-600 font-bold">Atividade Concluída</span>
                          ) : (
                            <div className="mt-2">
                              <textarea
                                value={observacao}
                                onChange={(e) => setObservacao(e.target.value)}
                                className="w-full p-2 border rounded"
                                placeholder="Digite a observação aqui"
                              />
                              <button
                                onClick={() => handleCompleteEvent(afazer.evt_id)}
                                className="mt-2 bg-green-500 text-white font-bold py-1 px-3 rounded"
                              >
                                Salvar Observação e Concluir
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Tabela para telas maiores */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full border border-gray-300">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border px-4 py-2">Título</th>
                    <th className="border px-4 py-2">Descrição</th>
                    <th className="border px-4 py-2">Data</th>
                    <th className="border px-4 py-2">Horário</th>
                    <th className="border px-4 py-2">Local</th>
                  </tr>
                </thead>
                <tbody>
                  {afazeres.length > 0 ? (
                    afazeres.map((afazer) => {
                      const latitude = afazer.evt_lat;
                      const longitude = afazer.evt_log;
                      const mapsLink =
                        latitude && longitude
                          ? `https://www.google.com/maps?q=${latitude},${longitude}`
                          : null;
                      return (
                        <tr
                          key={afazer.evt_id}
                          className="odd:bg-white even:bg-gray-100"
                        >
                          <td className="border border-gray-300 px-4 py-2">{afazer.evt_titulo || "Sem título"}</td>
                          <td className="border border-gray-300 px-4 py-2 break-words max-w-xs">{afazer.evt_descricao || "Sem descrição"}</td>
                          <td className="border border-gray-300 px-4 py-2">
                            {afazer.evt_evento &&
                              !isNaN(new Date(afazer.evt_evento))
                              ? DateTime.fromISO(afazer.evt_evento)
                                .setZone("America/Sao_Paulo")
                                .toFormat("dd/MM/yyyy")
                              : "Data não informada"}
                          </td>

                          <td className="border border-gray-300 px-4 py-2">{afazer.evt_inicio} - {afazer.evt_fim}</td>
                          <td className="border border-gray-300 px-4 py-2">{afazer.evt_local || "Local não informado"}
                            <div className="flex flex-col justify-between">
                              {mapsLink && (
                                <a
                                  href={mapsLink}
                                  target="_blank"
                                  className="text-blue-500 ml-2"
                                  rel="noopener noreferrer"
                                >
                                  Ver no mapa
                                </a>
                              )}

                              <div>
                                {afazer.evt_status === "concluido" ? (
                                  <span className="text-green-600 font-bold">Atividade Concluída</span>
                                ) : (
                                  <div className="mt-2">
                                    <textarea
                                      value={observacao}
                                      onChange={(e) => setObservacao(e.target.value)}
                                      className="w-full p-2 border rounded"
                                      placeholder="Digite a observação aqui"
                                    />
                                    <button
                                      onClick={() => handleCompleteEvent(afazer.evt_id)}
                                      className="mt-2 bg-green-500 text-white font-bold py-1 px-3 rounded"
                                    >
                                      Salvar Observação e Concluir
                                    </button>
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
                      <td
                        colSpan="6"
                        className="border border-gray-300 px-4 py-2 text-center text-gray-600"
                      >
                        Nenhum afazer encontrado.
                      </td>
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
