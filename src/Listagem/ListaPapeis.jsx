import React, { useEffect, useState } from 'react';
import api from '../apiUrl';

export default function ListaPapeis() {
    const [papeis, setPapeis] = useState([]);
    const [permissoes, setPermissoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingPermissoes, setLoadingPermissoes] = useState(false);
    const [selectedPapel, setSelectedPapel] = useState(null);
    const [selectedPermissoes, setSelectedPermissoes] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [papeisRes, permissoesRes] = await Promise.all([
                    api.get('/listar-papeis'),
                    api.get('/listar-permissoes'),
                ]);

                setPapeis(papeisRes.data);
                setPermissoes(permissoesRes.data);
            } catch (error) {
                console.error("Erro ao carregar dados iniciais:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);


    const handlePapelClick = async (papel) => {
        setSelectedPapel(papel);
        setSelectedPermissoes([]);
        setLoadingPermissoes(true);

        try {
            const response = await api.get(`/permissoes-por-papel/${papel.pap_id}`);
            setSelectedPermissoes(response.data.map((perm) => perm.per_id));
        } catch (error) {
            console.error("Erro ao buscar permissões do papel:", error);
        } finally {
            setLoadingPermissoes(false);
        }
    };

    const handlePermissaoToggle = (permissaoId) => {
        setSelectedPermissoes((prev) =>
            prev.includes(permissaoId)
                ? prev.filter((id) => id !== permissaoId)
                : [...prev, permissaoId]
        );
    };

    const handleAssociarPermissoes = async () => {
        try {
            const response = await api.get(`/permissoes-por-papel/${selectedPapel.pap_id}`);
            const permissoesAtuais = response.data.map((perm) => perm.per_id);

            const permissoesAdicionar = selectedPermissoes.filter(
                (id) => !permissoesAtuais.includes(id)
            );
            const permissoesRemover = permissoesAtuais.filter(
                (id) => !selectedPermissoes.includes(id)
            );

            for (const permissaoId of permissoesAdicionar) {
                await api.post('/associar-permissao', {
                    papel_id: selectedPapel.pap_id,
                    permissao_id: permissaoId,
                });
            }

            for (const permissaoId of permissoesRemover) {
                await api.delete('/remover-permissao', {
                    data: {
                        papel_id: selectedPapel.pap_id,
                        permissao_id: permissaoId,
                    },
                });
            }

            alert('Permissões atualizadas com sucesso!');
            setSelectedPapel(null);
            setSelectedPermissoes([]);
        } catch (error) {
            console.error("Erro ao atualizar permissões:", error);
            alert("Erro ao atualizar permissões.");
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen text-lg">Carregando...</div>;
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6 text-center">Lista de Papéis</h1>

            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {papeis.map((papel) => (
                    <li
                        key={papel.pap_id}
                        className="bg-blue-100 p-4 rounded-lg shadow-md hover:bg-blue-200 transition cursor-pointer"
                        onClick={() => handlePapelClick(papel)}
                    >
                        {papel.pap_papel}
                    </li>
                ))}
            </ul>

            {selectedPapel && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    onClick={() => setSelectedPapel(null)}
                >
                    <div
                        className="bg-white rounded-lg shadow-lg w-11/12 sm:w-96 p-6 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-xl font-bold mb-4">{selectedPapel.pap_papel}</h2>

                        {loadingPermissoes ? (
                            <p className="text-center text-gray-500">Carregando permissões...</p>
                        ) : (
                            <ul className="mb-4">
                                {permissoes.map((permissao) => (
                                    <li key={permissao.per_id}>
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                className="mr-2"
                                                checked={selectedPermissoes.includes(permissao.per_id)}
                                                onChange={() => handlePermissaoToggle(permissao.per_id)}
                                            />
                                            {permissao.per_descricao} {/* Alterado para a chave correta */}
                                        </label>
                                    </li>
                                ))}


                            </ul>
                        )}
                        <button
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition w-full"
                            onClick={handleAssociarPermissoes}
                        >
                            Salvar Permissões
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
