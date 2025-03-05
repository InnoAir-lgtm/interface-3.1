import React, { useState, useEffect } from "react";
import api from "../apiUrl";
import { useAuth } from "../auth/AuthContext";
import { DateTime } from "luxon";
import { FaChevronDown, FaCheck } from "react-icons/fa";
import GestorEquipe from "./AgendaTecnicos";

export default function ListagemAfazeres({ schema }) {
  const { user } = useAuth();
  const [userId, setUserId] = useState(null);
  const [afazeres, setAfazeres] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [loading, setLoading] = useState(false); // Estado para carregamento

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
    if (!modalOpen) return; // Evita carregar afazeres quando a modal não está aberta
    async function buscarAfazeresDoUsuario() {
      if (!userId) return;
      setLoading(true); // Inicia o carregamento
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
  }, [modalOpen, userId, schema]); // Carrega os afazeres sempre que a modal for aberta

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <button
        onClick={() => setModalOpen(true)}
        className="w-72 h-64 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 text-gray-800 font-semibold flex justify-center items-center text-center relative overflow-hidden border border-gray-300"
      >
        <span className="font-medium text-xl text-gray-700">Agenda Técnico</span>
      </button>

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-6xl max-h-[80vh] overflow-y-auto relative">
            <GestorEquipe schema={schema} />
            <h2 className="text-xl font-bold mb-4 text-center">Cronograma do Técnico</h2>
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
              onClick={() => setModalOpen(false)}
            >
              &times;
            </button>

            {/* Indicador de carregamento */}
            {loading && (
              <div className="absolute inset-0 bg-white opacity-75 flex justify-center items-center">
                <div className="w-16 h-16 border-4 border-t-4 border-blue-500 rounded-full animate-spin"></div>
              </div>
            )}

            {/* Dropdown para telas menores */}
            <div className="md:hidden w-full">
              {afazeres.map((afazer, index) => (
                <div key={afazer.evt_id} className="border rounded-lg p-3 mb-2">
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => setSelectedRow(selectedRow === index ? null : index)}
                  >
                    <span className="font-medium">{afazer.evt_titulo || "Sem título"}</span>
                    <FaChevronDown
                      className={`${selectedRow === index ? "rotate-180" : "rotate-0"} transition-transform`}
                    />
                  </div>
                  {selectedRow === index && (
                    <div className="mt-2 text-sm break-words whitespace-normal">
                      <p><strong>Descrição:</strong> {afazer.evt_descricao || "Sem descrição"}</p>
                      <p><strong>Data:</strong> {DateTime.fromISO(afazer.evt_evento).toFormat("dd/MM/yyyy")}</p>
                      <p><strong>Horário:</strong> {afazer.evt_inicio} - {afazer.evt_fim}</p>
                      <p><strong>Local:</strong> {afazer.evt_local || "Local não informado"}</p>
                    </div>
                  )}
                </div>
              ))}
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
                  {afazeres.map((afazer) => (
                    <tr key={afazer.evt_id} className="border">
                      <td className="p-2 items-center">
                        {afazer.evt_titulo || "Sem título"}
                      </td>
                      <td className="border px-4 py-2">{afazer.evt_descricao || "Sem descrição"}</td>
                      <td className="border px-4 py-2">{DateTime.fromISO(afazer.evt_evento).toFormat("dd/MM/yyyy")}</td>
                      <td className="border px-4 py-2">{afazer.evt_inicio} - {afazer.evt_fim}</td>
                      <td className="border px-4 py-2">{afazer.evt_local || "Local não informado"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
