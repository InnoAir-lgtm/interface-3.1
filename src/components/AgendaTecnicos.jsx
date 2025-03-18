import React, { useState, useEffect } from "react";
import api from "../apiUrl";
import { useAuth } from "../auth/AuthContext";
import { DateTime } from "luxon";
import { usePermissions } from "../middleware/middleware";
import { FaChevronDown } from "react-icons/fa";  // Adicionado ícone para dropdown

export default function GestorEquipe({ schema }) {
  const { verifyAndCreatePermission } = usePermissions();
  const { user } = useAuth();
  const [userId, setUserId] = useState(null);
  const [afazeres, setAfazeres] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [tecnicos, setTecnicos] = useState([]);
  const [tecnicoSelecionado, setTecnicoSelecionado] = useState("");
  const [selectedRow, setSelectedRow] = useState(null); // Controle de linha selecionada
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

  const handleCompleteEvent = async (eventId) => {
    setAfazeres((prevAfazeres) =>
      prevAfazeres.map((afazer) =>
        afazer.evt_id === eventId ? { ...afazer, evt_status: "Concluído" } : afazer
      )
    );

    try {
      const response = await api.put(`/eventos/${eventId}/status-descricao?schema=${schema}`, {
        status: "Concluído",
        descricao: "Tarefa finalizada pelo técnico",
        schema,
      });

      if (response.status === 200) {
        console.log("Evento marcado como concluído com sucesso!");
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
              className="absolute top-4 right-4 bg-red-500 text-white py-1 px-3 rounded-full hover:bg-red-600 transition"
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

            <div className="md:hidden w-full">
              {afazeres.map((afazer, index) => {
                const latitude = afazer.evt_lat;
                const longitude = afazer.evt_log;
                const mapsLink =
                  latitude && longitude
                    ? `https://www.google.com/maps?q=${latitude},${longitude}`
                    : null;
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
                              <button
                                onClick={() => handleCompleteEvent(afazer.evt_id)}
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded"
                              >
                                Concluir
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

            <div className="hidden md:block">
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border border-gray-300 px-4 py-2">Título</th>
                      <th className="border border-gray-300 px-4 py-2">Descrição</th>
                      <th className="border border-gray-300 px-4 py-2">Data</th>
                      <th className="border border-gray-300 px-4 py-2">Local</th>
                    </tr>
                  </thead>
                  <tbody>
                    {afazeres.map((afazer) => (
                      <tr key={afazer.evt_id}>
                        <td className="border border-gray-300 px-4 py-2">{afazer.evt_titulo || "Sem título"}</td>
                        <td className="border border-gray-300 px-4 py-2">{afazer.evt_descricao || "Sem descrição"}</td>
                        <td className="border border-gray-300 px-4 py-2">
                          {DateTime.fromISO(afazer.evt_evento).toFormat("dd/MM/yyyy")}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          <p>Local:{afazer.evt_local || "Local não informado"}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}





