import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { CgProfile } from "react-icons/cg";
import EmpresaComponent from '../../components/Pessoa';

import api from '../../apiUrl';
export default function DashboardOperad() {
    const { logout, user } = useAuth();
    const [showPopup, setShowPopUp] = useState(false);
    const [empresas, setEmpresas] = useState([]);
    const [selectedSchema, setSelectedSchema] = useState("");
    const [loading, setLoading] = useState(true);
    const [error] = useState("");

    const fetchAssociacoes = async () => {
        try {
            const response = await api.get(`/listar-associacoes/${user.id}`);
            const data = response.data;

            const empresasUnicas = data.filter(
                (empresa, index, self) =>
                    index === self.findIndex((e) => e.emp_cnpj === empresa.emp_cnpj)
            );

            setEmpresas(empresasUnicas);
        } catch (error) {
            console.error('Erro ao buscar associações:', error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        if (user?.id) {
            console.log('Buscando associações para o usuário:', user.id);
            fetchAssociacoes();
        }
    }, [user]);

    const togglePop = () => {
        setShowPopUp(!showPopup);
    };

    const handleEmpresaChange = (e) => {
        const cnpj = e.target.value;
        setSelectedSchema(cnpj);

        console.log('CNPJ selecionado:', cnpj);
    };

    if (loading) {
        return <p>Carregando...</p>;
    }

    if (error) {
        return <p>Erro: {error}</p>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="flex">
                <div className="flex-1 p-8">
                    <header className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-semibold text-gray-800">Bem-vindo ao Dashboard</h1>
                        <div className="flex space-x-4">
                            <button
                                onClick={logout}
                                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition duration-200">
                                Sair
                            </button>

                            <button
                                className="flex justify-center items-center w-12 h-12 rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 transition duration-200"
                                onClick={togglePop}>
                                <CgProfile fontSize={28} />
                            </button>
                        </div>
                    </header>

                    {showPopup && (
                        <div className="absolute top-20 right-4 bg-white p-6 rounded-lg shadow-xl w-80 z-50 transition-all duration-300">
                            <div className="flex justify-between items-center border-b pb-2 mb-4">
                                <h2 className="text-xl font-semibold text-gray-800">Perfil</h2>
                                <button onClick={togglePop} className="text-gray-600 hover:text-red-500">X</button>
                            </div>
                            <div className="space-y-2 text-gray-700">
                                <p><strong>Identificação:</strong> {user.id}</p>
                                <p><strong>Email:</strong> {user.email}</p>
                                <p><strong>Grupo:</strong> {user.grupo}</p>
                                <p><strong>Perfil:</strong> {user.perfil}</p>
                            </div>
                        </div>
                    )}

                    {showPopup && (
                        <div
                            className="fixed inset-0 bg-black opacity-50 z-40"
                            onClick={togglePop}></div>
                    )}

                    <div className="mb-5">
                        {empresas.length > 0 ? (
                            <select
                                className="w-72 p-3 border rounded-lg text-gray-800 shadow-md focus:ring-2 focus:ring-blue-500 transition duration-200"
                                onChange={handleEmpresaChange}>
                                <option value="">Selecione uma empresa</option>
                                {empresas.map((empresa) => (
                                    <option key={empresa.emp_cnpj} value={empresa.emp_cnpj}>
                                        {empresa.empresas.emp_nome}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <p className="text-gray-500 mt-4">Nenhuma empresa associada encontrada.</p>
                        )}
                    </div>

                    {selectedSchema && (
                        <div className="mt-6">
                            <EmpresaComponent schema={selectedSchema} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
