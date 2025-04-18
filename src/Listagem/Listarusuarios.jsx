import React, { useEffect, useState } from 'react';
import api from '../apiUrl';
import { CiCircleList } from "react-icons/ci";
import { PiPersonArmsSpreadThin } from "react-icons/pi";

export default function ListarUsuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [usuariosFiltrados, setUsuariosFiltrados] = useState([]);
    const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [papeis, setPapeis] = useState([]);
    const [empresas, setEmpresas] = useState([]);
    const [selectedPapeis, setSelectedPapeis] = useState({});
    const [selectedEmpresas, setSelectedEmpresas] = useState([]);
    const [isUserListModalOpen, setIsUserListModalOpen] = useState(false);
    const [expandedEmpresas, setExpandedEmpresas] = useState({});
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        async function fetchUsuarios() {
            try {
                const response = await api.get('/listar-usuarios');
                const usuariosFiltrados = response.data.filter((usuario) =>
                    usuario.usr_perfil !== 'Master' && usuario.usr_perfil !== 'Administrador'
                );
                setUsuarios(usuariosFiltrados);
            } catch (error) {
                console.error(error);
            }
        }

        async function fetchPapeis() {
            try {
                const response = await api.get('/listar-papeis');
                setPapeis(response.data);
            } catch (error) {
                console.error(error);
            }
        }

        async function fetchEmpresas() {
            try {
                const response = await api.get('/lista-empresas');
                setEmpresas(response.data);
            } catch (error) {
                console.error(error);
            }
        }

        fetchUsuarios();
        fetchPapeis();
        fetchEmpresas();
    }, []);

    const abrirModal = async (usuario) => {
        setUsuarioSelecionado(usuario);
        try {
            const response = await api.get(`/listar-associacoes/${usuario.usr_id}`);

            if (!response.data) throw new Error('Erro ao buscar associações');

            const papeisPorEmpresa = {};
            const empresas = [];

            response.data.forEach((assoc) => {
                if (!papeisPorEmpresa[assoc.emp_cnpj]) {
                    papeisPorEmpresa[assoc.emp_cnpj] = [];
                    empresas.push(assoc.emp_cnpj);
                }
                papeisPorEmpresa[assoc.emp_cnpj].push(assoc.pap_id);
            });

            setSelectedPapeis(papeisPorEmpresa);
            setSelectedEmpresas(empresas);
            const expandState = {};
            empresas.forEach((empresaCnpj) => {
                expandState[empresaCnpj] = true;
            });
            setExpandedEmpresas(expandState);
        } catch (error) {
            console.error(error);
        }

        setIsModalOpen(true);
    };



    const abrirUserListModal = () => {
        setIsUserListModalOpen(true);
    };

    const fecharUserListModal = () => {
        setIsUserListModalOpen(false);
    };

    const fecharModal = () => {
        setIsModalOpen(false);
        setUsuarioSelecionado(null);
        setSelectedPapeis({});
        setSelectedEmpresas([]);
    };

    const togglePapelSelection = (papelId, empresaCnpj) => {
        setSelectedPapeis((prev) => {
            const empresaPapeis = prev[empresaCnpj] || [];
            const updatedPapeis = empresaPapeis.includes(papelId)
                ? empresaPapeis.filter((id) => id !== papelId)
                : [...empresaPapeis, papelId];
            return { ...prev, [empresaCnpj]: updatedPapeis };
        });
    };



    const toggleEmpresaSelection = (cnpj) => {
        setSelectedEmpresas((prev) =>
            prev.includes(cnpj) ? prev.filter((id) => id !== cnpj) : [...prev, cnpj]
        );
        setExpandedEmpresas((prev) => ({
            ...prev,
            [cnpj]: !prev[cnpj],
        }));
    };

    const associarPapeisEmpresas = async () => {
        try {
            const associacoes = Object.entries(selectedPapeis).map(([emp_cnpj, papeis]) => ({
                emp_cnpj,
                papeis,
            }));

            const response = await api.post('/atualizar-associacoes', {
                usr_id: usuarioSelecionado.usr_id,
                associacoes,
            });

            if (response.data.message !== 'Associações atualizadas com sucesso!') {
                throw new Error('Erro ao atualizar associações');
            }
            alert('Papéis e empresas atualizados com sucesso');
            fecharModal();
        } catch (error) {
            console.error(error);
            const errorMessage = error.response?.data?.error || 'Erro ao atualizar papéis e empresas';
            alert(errorMessage);
        }
    };

    useEffect(() => {
        const resultado = usuarios.filter(usuario =>
            usuario.usr_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            usuario.usr_email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setUsuariosFiltrados(resultado);
    }, [searchTerm, usuarios]);




    return (
        <div>
            <div className="bg-[#D9D9D9] backdrop-blur-lg h-auto rounded-lg p-7 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                <div className="flex flex-col justify-between h-full gap-4 sm:gap-3">
                    <div className="flex gap-5 sm:gap-3 flex-wrap items-center">
                        <div className="flex justify-center items-center bg-black w-16 h-16 rounded-full sm:w-12 sm:h-12">
                            <CiCircleList className="text-white text-[40px] sm:text-[30px]" />
                        </div>

                        <h2 className="text-2xl font-semibold text-black tracking-wider hover:text-white transition-all duration-300 sm:text-xl">
                            Usuários registrados
                            <p className="text-lg font-extralight mb-6 sm:mb-2 sm:text-sm">
                                Total de usuários cadastrados:
                            </p>
                        </h2>
                    </div>

                    <div className="flex justify-center items-center gap-5 flex-wrap sm:gap-3">
                        <PiPersonArmsSpreadThin className="text-[50px] sm:text-[40px]" />
                        <div className="text-[50px] sm:text-[40px]">{usuarios.length}</div>
                    </div>

                    <button
                        onClick={abrirUserListModal}
                        className="mt-auto text-[20px] bg-green-500 text-white py-2 px-6 rounded-[20px] shadow-md transform transition-all duration-300 hover:scale-105 sm:text-[16px] sm:py-2 sm:px-4">
                        Ver usuários
                    </button>
                </div>

            </div>



            {isUserListModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white rounded-lg shadow-lg p-6 relative w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={fecharUserListModal}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                        >
                            ✕
                        </button>

                        <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
                            Lista de Usuários
                        </h2>

                        <input
                            type="text"
                            placeholder="Buscar usuário..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-2 mb-4 border border-gray-300 rounded"
                        />

                        <ul className="space-y-2">
                            {usuariosFiltrados.length > 0 ? (
                                usuariosFiltrados.map((usuario) => (
                                    <li
                                        key={usuario.usr_id}
                                        className="flex flex-wrap sm:flex-nowrap justify-between items-center bg-gray-100 hover:bg-gray-200 transition-transform cursor-pointer rounded-lg p-4 shadow-sm"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-800 truncate">{usuario.usr_nome}</p>
                                            <p className="text-sm text-gray-500 truncate">{usuario.usr_email}</p>
                                        </div>
                                        <button
                                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                                            onClick={() => abrirModal(usuario)}
                                        >
                                            Editar
                                        </button>
                                    </li>
                                ))
                            ) : (
                                <p className="text-gray-600 text-center">Nenhum usuário encontrado</p>
                            )}
                        </ul>
                    </div>
                </div>
            )}


            {isModalOpen && usuarioSelecionado && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50 transition-all duration-300 ease-in-out">
                    <div className="bg-white p-6 rounded-md shadow-lg w-96 max-w-lg transform transition-all duration-200 ease-in-out">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Detalhes do Usuário</h2>
                        <div className="mb-4">
                            <p className="text-gray-700"><strong className="font-medium text-gray-800">Nome:</strong> {usuarioSelecionado.usr_nome}</p>
                            <p className="text-gray-700"><strong className="font-medium text-gray-800">Email:</strong> {usuarioSelecionado.usr_email}</p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-800 font-medium">Empresas</label>
                            <div className="space-y-2">
                                {empresas.map((empresa) => (
                                    <div key={empresa.emp_cnpj}>
                                        <label className="flex items-center space-x-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedEmpresas.includes(empresa.emp_cnpj)}
                                                onChange={() => toggleEmpresaSelection(empresa.emp_cnpj)}
                                                className="form-checkbox h-4 w-4 text-green-600 border-gray-300 focus:ring-2 focus:ring-green-400"
                                            />
                                            <span className="text-gray-700">{empresa.emp_nome}</span>
                                        </label>
                                        {expandedEmpresas[empresa.emp_cnpj] && (
                                            <div className="ml-6 mt-2 space-y-2">
                                                {papeis.map((papel) => (
                                                    <label key={papel.pap_id} className="flex items-center space-x-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedPapeis[empresa.emp_cnpj]?.includes(papel.pap_id) || false}
                                                            onChange={() => togglePapelSelection(papel.pap_id, empresa.emp_cnpj)}
                                                            className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-400"
                                                        />
                                                        <span className="text-gray-700">{papel.pap_papel}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-end space-x-4 mt-6">
                            <button
                                className="bg-blue-600 text-white px-6 py-2 rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                onClick={associarPapeisEmpresas}
                            >
                                Associar Papéis e Empresas
                            </button>
                            <button
                                className="bg-gray-400 text-white px-6 py-2 rounded-md shadow-md hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400"
                                onClick={fecharModal}
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}