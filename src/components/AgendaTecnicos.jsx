import React, { useState, useEffect } from "react";
import api from "../apiUrl";
import { useAuth } from "../auth/AuthContext";
import { DateTime } from "luxon";
import { FaCheck } from "react-icons/fa";
import { usePermissions } from "../middleware/middleware";

export default function GestorEquipe({ schema }) {
  const { verifyAndCreatePermission } = usePermissions();
  const { user } = useAuth();

  const [userId, setUserId] = useState(null);
  const [afazeres, setAfazeres] = useState([]);
  const [confirm, setConfirm] = useState(false);
  const [status, setStatus] = useState("");
  const [observacao, setObservacao] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmingAfazerId, setConfirmingAfazerId] = useState(null);
  const [tecnicos, setTecnicos] = useState([]);
  const [tecnicoSelecionado, setTecnicoSelecionado] = useState("");

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
    async function encontrarPessoas() {
      try {
        const response = await api.get(`/pessoas?schema=${schema}`);
        if (Array.isArray(response.data.data)) {
          const todasPessoas = response.data.data;
          const pessoasTecnicas = await Promise.all(
            todasPessoas.map(async (pessoa) => {
              try {
                const tipoResponse = await api.get(
                  `/tipos-pessoa?pes_id=${pessoa.pes_id}&schema=${schema}`
                );
                if (Array.isArray(tipoResponse.data.data)) {
                  const temTipoTecnico = tipoResponse.data.data.some(
                    (tipo) =>
                      tipo.pes_nome &&
                      tipo.tpp_descricao.toLowerCase() === "tecnico"
                  );
                  return temTipoTecnico ? pessoa : null;
                }
              } catch (error) {
                console.error(
                  `Erro ao buscar tipos para a pessoa ${pessoa.pes_id}:`,
                  error
                );
              }
              return null;
            })
          );
          setTecnicos(pessoasTecnicas.filter(Boolean));
        } else {
          console.error(
            "Dados recebidos não são um array:",
            response.data.data
          );
        }
      } catch (error) {
        console.error("Erro ao buscar técnicos:", error);
      }
    }
    encontrarPessoas();
  }, [schema]);

  useEffect(() => {
    async function buscarAfazeresDoTecnico() {
      if (!tecnicoSelecionado) {
        setAfazeres([]);
        return;
      }
      try {
        const response = await api.get(
          `/eventos?schema=${schema}&pes_evento=${tecnicoSelecionado}`
        );
        if (Array.isArray(response.data.data)) {
          setAfazeres(response.data.data);
        } else {
          console.error("Formato de eventos inválido:", response.data);
        }
      } catch (error) {
        console.error("Erro ao buscar afazeres do técnico:", error);
      }
    }
    buscarAfazeresDoTecnico();
  }, [tecnicoSelecionado, schema]);

  const handleUpdateEvent = async () => {
    if (!status || !observacao) {
      alert("Os campos Status e Observação são obrigatórios.");
      return;
    }

    const formattedEvent = {
      descricao: observacao,  // Atualiza o campo de descrição
      status: status,         // Atualiza o campo de status
      schema                  // Adiciona o schema à requisição
    };

    console.log('Tentando atualizar o evento com os seguintes dados:', formattedEvent);

    const url = `/eventos/${confirmingAfazerId}/status-descricao?schema=${schema}`;
    console.log('Requisição para a URL:', url);

    try {
      const response = await api.put(url, formattedEvent);
      console.log('Resposta da requisição: ', response);

      if (response.status === 200) {
        console.log('Evento atualizado com sucesso');
        setTimeout(() => fetchEvents(), 500);  // Atualiza a lista de eventos após a confirmação
        setConfirmingAfazerId(null);
      } else {
        console.error("Erro ao atualizar evento:", response.data);
      }
    } catch (error) {
      console.error("Erro ao conectar com o backend:", error);
    }
  };

  const abrirModal = async (permissionName) => {
    const hasPermission = await verifyAndCreatePermission(permissionName);
    if (hasPermission) {
      setModalOpen(true);
    }
  };
  

  const fecharModal = () => {
    setModalOpen(false);
  };

  return (
    <div className="flex items-center">
      <button
        value="gestorEquipe"
        onClick={(e) => abrirModal(e.target.value || 'gestorEquipe')}
        className=" p-2 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 text-gray-800 font-semibold flex justify-center items-center text-center relative overflow-hidden border border-gray-300 z-10"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-50 opacity-30"></div>
        <div className="relative flex flex-col items-center justify-center space-y-4 w-full h-full">
          <span className="font-medium text-gray-700">Tecnicos</span>
        </div>
      </button>

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-6xl max-h-[80vh] overflow-y-auto relative z-30">
            <h2 className="text-xl font-bold mb-4 text-center">
              Gestão equipe
            </h2>
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
              onClick={fecharModal}
            >
              &times;
            </button>
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

            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border border-gray-300 px-4 py-2">Título</th>
                    <th className="border border-gray-300 px-4 py-2">
                      Descrição
                    </th>
                    <th className="border border-gray-300 px-4 py-2">Data</th>
                    <th className="border border-gray-300 px-4 py-2">
                      Horário
                    </th>
                    <th className="border border-gray-300 px-4 py-2">Local</th>
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
                          <td className="border border-gray-300 px-4 py-2">
                            {afazer.evt_titulo || "Sem título"}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 break-words max-w-xs">
                            {afazer.evt_descricao || "Sem descrição"}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {afazer.evt_evento &&
                              !isNaN(new Date(afazer.evt_evento))
                              ? DateTime.fromISO(afazer.evt_evento)
                                .setZone("America/Sao_Paulo")
                                .toFormat("dd/MM/yyyy")
                              : "Data não informada"}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {afazer.evt_inicio} - {afazer.evt_fim}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {afazer.evt_local || "Local não informado"}

                            <div className="flex justify-between">
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
                                <button
                                  onClick={() =>
                                    setConfirmingAfazerId(afazer.evt_id)
                                  }
                                  className="bg-green-600 p-2 rounded-lg text-white"
                                >
                                  <FaCheck />
                                </button>

                                {confirmingAfazerId === afazer.evt_id && (
                                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
                                    <div className="bg-white p-6 rounded-lg shadow-lg w-[50%] max-w-6xl max-h-[80vh] overflow-y-auto relative z-30">
                                      <button
                                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
                                        onClick={() =>
                                          setConfirmingAfazerId(null)
                                        }
                                      >
                                        &times;
                                      </button>
                                      <div>
                                        <div className="mb-4">
                                          <label
                                            htmlFor="status"
                                            className="block text-gray-700"
                                          >
                                            Status:
                                          </label>

                                          <select
                                            id="status"
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value)}
                                            className="w-full border-gray-300 border p-2 rounded-lg"
                                          >
                                            <option value="">Selecione o status</option>
                                            <option value="confirmado">Confirmado</option>
                                            <option value="cancelado">Cancelado</option>
                                          </select>

                                        </div>
                                        <div className="mb-4">
                                          <label
                                            htmlFor="observacao"
                                            className="block text-gray-700"
                                          >
                                            Observação:
                                          </label>
                                          <textarea
                                            id="observacao"
                                            value={observacao}
                                            onChange={(e) =>
                                              setObservacao(e.target.value)
                                            }
                                            rows="4"
                                            className="w-full border-gray-300 border p-2 rounded-lg"
                                            placeholder="Adicione uma observação"
                                          />
                                        </div>
                                        <button
                                          onClick={handleUpdateEvent}
                                          className="bg-blue-500 text-white p-2 rounded-lg"
                                        >
                                          Confirmar
                                        </button>;
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
