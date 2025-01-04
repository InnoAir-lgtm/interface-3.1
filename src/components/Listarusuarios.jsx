import React, { useEffect, useState } from 'react';
import api from '../apiUrl';

export default function ListarUsuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [papeis, setPapeis] = useState([]);
    const [empresas, setEmpresas] = useState([]);
    const [selectedPapeis, setSelectedPapeis] = useState([]);
    const [selectedEmpresas, setSelectedEmpresas] = useState([]);
    const [isUserListModalOpen, setIsUserListModalOpen] = useState(false);


    useEffect(() => {
        async function fetchUsuarios() {
            try {
                const response = await api.get('/listar-usuarios');
                const data = await response.json();
                setUsuarios(data);
            } catch (error) {
                console.error(error);
            }
        }

        async function fetchPapeis() {
            try {
                const response = await api.get('/listar-papeis');
                const data = await response.json();
                setPapeis(data);
            } catch (error) {
                console.error(error);
            }
        }

        async function fetchEmpresas() {
            try {
                const response = await fetch('http://localhost:3000/lista-empresas');
                if (!response.ok) throw new Error('Erro ao buscar empresas');
                const data = await response.json();
                setEmpresas(data);
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
            const response = await fetch(`http://localhost:3000/listar-associacoes/${usuario.usr_id}`);
            if (!response.ok) throw new Error('Erro ao buscar associações');

            const data = await response.json();
            const papeis = data.map((assoc) => assoc.pap_id);
            const empresas = data.map((assoc) => assoc.emp_cnpj);

            setSelectedPapeis(papeis);
            setSelectedEmpresas(empresas);
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
        setSelectedPapeis([]);
        setSelectedEmpresas([]);
    };

    const togglePapelSelection = (papelId) => {
        setSelectedPapeis((prev) =>
            prev.includes(papelId) ? prev.filter((id) => id !== papelId) : [...prev, papelId]
        );
    };

    const toggleEmpresaSelection = (cnpj) => {
        setSelectedEmpresas((prev) =>
            prev.includes(cnpj) ? prev.filter((id) => id !== cnpj) : [...prev, cnpj]
        );
    };

    const associarPapeisEmpresas = async () => {
        try {
            const response = await fetch('http://localhost:3000/atualizar-associacoes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    usr_id: usuarioSelecionado.usr_id,
                    papeis: selectedPapeis,
                    empresas: selectedEmpresas,
                }),
            });

            if (!response.ok) throw new Error('Erro ao atualizar associações');
            alert('Papeis e empresas atualizados com sucesso');
            fecharModal();
        } catch (error) {
            console.error(error);
            alert('Erro ao atualizar papéis e empresas');
        }
    };

    return (
        <div>

            <div className="bg-white shadow-md rounded-lg p-6">
                <div>
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">
                        Usuários registrados
                    </h2>
                    <p className="text-gray-600">Total de usuários cadastrados: {usuarios.length}</p>
                    <button
                        onClick={abrirUserListModal}
                        className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
                        Ver usuários
                    </button>

                </div>
            </div>



            {isUserListModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md relative">

                        <button
                            onClick={fecharUserListModal}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                        >
                            ✕
                        </button>

                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Lista de Usuários</h2>
                        <ul className="max-h-96 overflow-y-auto">
                            {usuarios.length > 0 ? (
                                usuarios.map((usuario) => (
                                    <li
                                        key={usuario.usr_id}
                                        className="flex justify-between items-center bg-gray-100 hover:bg-gray-200 rounded-lg p-4 mb-2"
                                    >
                                        <div>
                                            <p className="font-semibold">{usuario.usr_nome}</p>
                                            <p className="text-sm text-gray-500">{usuario.usr_email}</p>
                                        </div>
                                        <button
                                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                            onClick={() => abrirModal(usuario)}
                                        >
                                            Editar
                                        </button>
                                    </li>
                                ))
                            ) : (
                                <p className="text-gray-600">Nenhum usuário encontrado</p>
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
                <label className="block text-gray-800 font-medium">Papéis</label>
                <div className="space-y-2">
                    {papeis.map((papel) => (
                        <label key={papel.pap_id} className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                checked={selectedPapeis.includes(papel.pap_id)}
                                onChange={() => togglePapelSelection(papel.pap_id)}
                                className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-400"
                            />
                            <span className="text-gray-700">{papel.pap_papel}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-gray-800 font-medium">Empresas</label>
                <div className="space-y-2">
                    {empresas.map((empresa) => (
                        <label key={empresa.emp_cnpj} className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                checked={selectedEmpresas.includes(empresa.emp_cnpj)}
                                onChange={() => toggleEmpresaSelection(empresa.emp_cnpj)}
                                className="form-checkbox h-4 w-4 text-green-600 border-gray-300 focus:ring-2 focus:ring-green-400"
                            />
                            <span className="text-gray-700">{empresa.emp_nome}</span>
                        </label>
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
