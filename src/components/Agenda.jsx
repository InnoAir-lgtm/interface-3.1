import React, { useState, useEffect } from "react";
import api from "../apiUrl";
import { useAuth } from "../auth/AuthContext";
import { DateTime } from "luxon";
import { FaCheck } from "react-icons/fa";
import { usePermissions } from "../middleware/middleware";

import GestorEquipe from "./AgendaTecnicos";

export default function ListagemAfazeres({ schema }) {
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
          const usuario = response.data.data[0];
          setUserId(usuario.pes_id);
        }
      } catch (error) {
        console.error("Erro ao buscar usuário logado:", error);
      }
    }
    buscarUsuarioLogado();
  }, [user?.email]);


  const [selectedRow, setSelectedRow] = useState(null); // Estado para controlar qual linha está expandida

  const handleRowClick = (index) => {
    // Alterna a visibilidade do dropdown da linha clicada
    setSelectedRow(selectedRow === index ? null : index);
  };

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
    async function buscarAfazeresDoUsuario() {
      if (!userId) return;
      try {
        const response = await api.get(
          `/eventos?schema=${schema}&pes_evento=${userId}`
        );
        if (Array.isArray(response.data.data)) {
          setAfazeres(response.data.data);
        } else {
          console.error("Formato de eventos inválido:", response.data);
        }
      } catch (error) {
        console.error("Erro ao buscar afazeres do usuário:", error);
      }
    }
    buscarAfazeresDoUsuario();
  }, [userId, schema]);

  const handleConfirm = async (afazerId) => {
    try {
      const response = await api.put(`/eventos/${afazerId}`, {
        status,
        observacao,
      });
      console.log("Trabalho confirmado:", response);
      setAfazeres((prevAfazeres) =>
        prevAfazeres.map((afazer) =>
          afazer.evt_id === afazerId
            ? { ...afazer, status, observacao }
            : afazer
        )
      );
      setConfirm(false);
    } catch (error) {
      console.error("Erro ao confirmar trabalho:", error);
    }
  };
  const abrirModal = () => {
    setModalOpen(true);
  };

  const fecharModal = () => {
    setModalOpen(false);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <button
        onClick={(e) => abrirModal(e.target.value)}
        className="w-72 h-64 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 text-gray-800 font-semibold flex justify-center items-center text-center relative overflow-hidden border border-gray-300 z-10"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-50 opacity-30"></div>
        <div className="relative flex flex-col items-center justify-center space-y-4 w-full h-full">
          <span className="font-medium text-xl text-gray-700">
            Agenda Técnico
          </span>
        </div>
      </button>

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-6xl max-h-[80vh] overflow-y-auto relative z-30">
            <GestorEquipe schema={schema} />

            <h2 className="text-xl font-bold mb-4 text-center">
              Cronôgrama do Técnico
            </h2>
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
              onClick={fecharModal}
            >
              &times;
            </button>
            <div className="mb-4">
              <select
                value={userId || ""}
                disabled
                className="w-full border-gray-300 border p-2 rounded-lg bg-gray-200 cursor-not-allowed"
              >
                <option value={userId}>{user?.nome || "Carregando..."}</option>
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border border-gray-300 px-4 py-2 text-sm md:text-base">Título</th>
                    <th className="border border-gray-300 px-4 py-2 text-sm md:text-base">Descrição</th>
                    <th className="border border-gray-300 px-4 py-2 text-sm md:text-base">Data</th>
                    <th className="border border-gray-300 px-4 py-2 text-sm md:text-base">Horário</th>
                    <th className="border border-gray-300 px-4 py-2 text-sm md:text-base">Local</th>
                  </tr>
                </thead>
                <tbody>
                  {afazeres.length > 0 ? (
                    afazeres.map((afazer, index) => {
                      const latitude = afazer.evt_lat;
                      const longitude = afazer.evt_log;
                      const mapsLink = latitude && longitude
                        ? `https://www.google.com/maps?q=${latitude},${longitude}`
                        : null;

                      return (
                        <React.Fragment key={afazer.evt_id}>
                          <tr
                            className="odd:bg-white even:bg-gray-100 cursor-pointer"
                            onClick={() => handleRowClick(index)} // Altera o estado ao clicar na linha
                          >
                            <td className="border border-gray-300 px-4 py-2 text-sm md:text-base">
                              {afazer.evt_titulo || "Sem título"}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 break-words max-w-xs text-sm md:text-base hidden sm:table-cell">
                              {afazer.evt_descricao || "Sem descrição"}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-sm md:text-base hidden sm:table-cell">
                              {afazer.evt_evento && !isNaN(new Date(afazer.evt_evento))
                                ? DateTime.fromISO(afazer.evt_evento).setZone('America/Sao_Paulo').toFormat('dd/MM/yyyy')
                                : "Data não informada"}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-sm md:text-base hidden sm:table-cell">
                              {afazer.evt_inicio} - {afazer.evt_fim}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-sm md:text-base hidden sm:table-cell">
                              {afazer.evt_local || "Local não informado"}
                            </td>
                          </tr>

                          {/* Dropdown com detalhes do evento (visível apenas em telas pequenas) */}
                          {selectedRow === index && (
                            <tr className="bg-gray-50">
                              <td colSpan="5" className="border border-gray-300 px-4 py-2">
                                <div className="sm:hidden"> {/* Só visível em telas pequenas */}
                                  <div><strong>Descrição:</strong> {afazer.evt_descricao || "Sem descrição"}</div>
                                  <div><strong>Data:</strong> {afazer.evt_evento && !isNaN(new Date(afazer.evt_evento))
                                    ? DateTime.fromISO(afazer.evt_evento).setZone('America/Sao_Paulo').toFormat('dd/MM/yyyy')
                                    : "Data não informada"}
                                  </div>
                                  <div><strong>Horário:</strong> {afazer.evt_inicio} - {afazer.evt_fim}</div>
                                  <div><strong>Local:</strong> {afazer.evt_local || "Local não informado"}</div>
                                  {mapsLink && (
                                    <div className="mt-2">
                                      <a href={mapsLink} target="_blank" className="text-blue-500" rel="noopener noreferrer">
                                        Ver no mapa
                                      </a>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="border border-gray-300 px-4 py-2 text-center text-gray-600">
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



// <div>
//   <button
//     onClick={() => setConfirmingAfazerId(afazer.evt_id)}
//     className="bg-green-600 p-2 rounded-lg text-white"
//   >
//     <FaCheck />
//   </button>

//   {confirmingAfazerId === afazer.evt_id && (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
//       <div className="bg-white p-6 rounded-lg shadow-lg w-[50%] max-w-6xl max-h-[80vh] overflow-y-auto relative z-30">
//         <button
//           className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
//           onClick={() => setConfirmingAfazerId(null)}
//         >
//           &times;
//         </button>
//         <div>
//           <div className="mb-4">
//             <label htmlFor="status" className="block text-gray-700">Status:</label>
//             <select
//               id="status"
//               value={status}
//               onChange={(e) => setStatus(e.target.value)}
//               className="w-full border-gray-300 border p-2 rounded-lg"
//             >
//               <option value="">Selecione o status</option>
//               <option value="confirmado">Confirmado</option>
//               <option value="pendente">Pendente</option>
//               <option value="concluido">Concluído</option>
//             </select>
//           </div>
//           <div className="mb-4">
//             <label htmlFor="observacao" className="block text-gray-700">Observação:</label>
//             <textarea
//               id="observacao"
//               value={observacao}
//               onChange={(e) => setObservacao(e.target.value)}
//               rows="4"
//               className="w-full border-gray-300 border p-2 rounded-lg"
//               placeholder="Adicione uma observação"
//             />
//           </div>
//           <button
//             onClick={() => handleConfirm(afazer.evt_id)}
//             className="bg-blue-500 text-white p-2 rounded-lg"
//           >
//             Confirmar
//           </button>
//         </div>
//       </div>
//     </div>
//   )}
// </div> 