import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { CgProfile } from "react-icons/cg";
import EmpresaComponent from '../../components/Pessoa';
import api from '../../apiUrl';
import { motion } from 'framer-motion';

export default function DashboardOperad() {
    const { logout, user, setUser } = useAuth();
    const [showPopup, setShowPopUp] = useState(false);
    const [empresas, setEmpresas] = useState([]);
    const [selectedSchema, setSelectedSchema] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [empresaData, setEmpresaData] = useState(null);
    const [selectedEmpresaName, setSelectedEmpresaName] = useState(null);
    const [motivationalPhrase, setMotivationalPhrase] = useState('');
    const [currentRole, setCurrentRole] = useState(user.papel);

    useEffect(() => {
        setCurrentRole(user.papel);
    }, [user.papel]);


    const motivationalPhrases = [
        "Acredite no seu potencial e conquiste seus objetivos!",
        "Cada dia é uma nova oportunidade de fazer diferente.",
        "O sucesso é o resultado da sua dedicação diária.",
        "Você é mais forte do que imagina. Continue em frente!",
        "Grandes realizações começam com pequenos passos.",
        "Nunca desista, o caminho para o sucesso é construído com esforço.",
        "Confie no processo e celebre cada conquista!",
        "O impossível é apenas uma questão de perspectiva.",
        "Seu trabalho duro de hoje será a recompensa de amanhã.",
        "Persista, insista e alcance seus sonhos!"
    ];

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
            fetchAssociacoes();
        }
        const randomIndex = Math.floor(Math.random() * motivationalPhrases.length);
        setMotivationalPhrase(motivationalPhrases[randomIndex]);
    }, [user]);

    const togglePop = () => {
        setShowPopUp(!showPopup);
    };

    const handleEmpresaChange = async (e) => {
        const cnpj = e.target.value;
        setSelectedSchema(null);
        setSelectedEmpresaName(null);
        if (cnpj) {
            try {
                const response = await api.get(`/buscar-schema?cnpj=${cnpj}`);
                const schema = response.data.schema;
                setSelectedSchema(schema);
                setEmpresaData(null);

                const empresaDataResponse = await api.get(`/dados-empresa?cnpj=${cnpj}`);
                setEmpresaData(empresaDataResponse.data);
                const empresa = empresas.find((emp) => emp.emp_cnpj === cnpj);
                setSelectedEmpresaName(empresa?.empresas?.emp_nome || "Empresa Desconhecida");
                const papel = empresa?.papeis?.pap_papel || "Usuário sem papel";
                const pap_id = empresa?.pap_id || null;

                setCurrentRole(papel);
                setUser((prevUser) => {
                    const updatedUser = {
                        ...prevUser,
                        papel,
                        pap_id,
                    };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    return updatedUser;
                });

                localStorage.setItem(
                    'user',
                    JSON.stringify({
                        ...user,
                        papel,
                        pap_id,
                    })
                );
            } catch (error) {
                console.error("Erro ao buscar o schema ou papel da empresa:", error);
                setError("Erro ao carregar os dados da empresa.");
            }
        }
    };

    const formatarNome = (nomeCompleto) => {
        if (!nomeCompleto) return '';
        const nomes = nomeCompleto.split(' ');
        return nomes.length > 1 ? `${nomes[0]} ${nomes[1]}` : nomes[0];
    };


    if (loading) {
        return (
            <div className="fixed inset-0 flex justify-center items-center bg-gray-100 z-50">
                <motion.div
                    initial={{ x: 0 }}
                    animate={{ x: "-100%" }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                    className="absolute left-0 top-0 w-1/2 h-full bg-black"
                />
                <motion.div
                    initial={{ x: 0 }}
                    animate={{ x: "100%" }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                    className="absolute right-0 top-0 w-1/2 h-full bg-black"
                />
                <motion.div
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0 }}
                    transition={{ delay: 1, duration: 0.5 }}
                    className="absolute flex justify-center items-center"
                >
                    <motion.div
                        className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
                        initial={{ rotate: 0 }}
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1 }}
                    />
                </motion.div>
            </div>
        );
    }



    if (error) {
        return <p>Erro: {error}</p>;
    }

    return (
        <div
        >
            <div className="flex justify-center items-center w-full bg-black border border-gray-300 shadow-md p-1 text-lg font-extralight text-white">
                Bela Arte — O conforto do cliente vem em primeiro lugar.
            </div>

            <div className='w-full p-10'>
                <div className='p-2 flex flex-col'>
                    <header className="flex flex-wrap justify-between items-center mb-8 gap-6">
                        <div className="flex-1">
                            <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-2">
                                Bem-vindo <span className='bg-green-500 text-white px-2 py-1'>{formatarNome(user.nome)}</span>
                            </h1>
                            <p className="text-lg font-light text-gray-600">{motivationalPhrase}</p>
                        </div>

                        <div className="flex items-center gap-4 flex-shrink-0 border rounded-full p-2 shadow-md">
                            <button
                                className="flex justify-center items-center w-12 h-12 rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 transition duration-200"
                                onClick={togglePop}
                            >
                                <CgProfile fontSize={28} />
                            </button>

                            <div className="text-center md:text-left hidden lg:block xl:block">
                                <p className="text-xs md:text-sm">{user.email}</p>
                                <p className="text-xs md:text-sm">{user.perfil}</p>
                            </div>
                        </div>

                    </header>


                    {showPopup && (
                        <div className="absolute top-20 right-4 bg-white p-6 rounded-lg shadow-xl w-80 z-50 transition-all duration-300">
                            <div className="flex justify-between items-center border-b pb-2 mb-4">
                                <h2 className="text-xl font-semibold text-gray-800">Perfil</h2>
                                <button onClick={togglePop} className="text-gray-600 hover:text-red-500">X</button>
                            </div>
                            <div className="space-y-2 text-gray-700">
                                <p><strong>Nº de indentifação:</strong> {user.id}</p>
                                <p><strong>Email:</strong> {user.email}</p>
                                <p><strong>Grupo:</strong> {user.grupo}</p>
                                <p><strong>Perfil:</strong> {user.perfil}</p>
                                <p><strong>Nome:</strong> {user.nome}</p>
                                <p className='className="text-xs md:text-sm'>{currentRole}</p>
                            </div>

                            <div className='mt-2 flex justify-end border-t-2 p-1 '>
                                <button
                                    onClick={logout}
                                    className="bg-red-500 w-10 text-white px-1 py-1 rounded-lg hover:bg-red-600 transition duration-200">
                                    Sair
                                </button>
                            </div>
                        </div>
                    )}

                    {showPopup && (
                        <div
                            className="fixed inset-0 bg-black opacity-50 z-40"
                            onClick={togglePop}></div>
                    )}

                    <div>
                        {empresas.length > 0 ? (
                            <select
                                className="w-72 p-3 border rounded-lg text-gray-800 shadow-md focus:ring-2 focus:ring-blue-500 transition duration-200"
                                onChange={handleEmpresaChange}
                            >
                                <option value="">Selecione uma empresa</option>
                                {empresas.map((empresa) => {
                                    const empresaNome = empresa.empresas?.emp_nome?.trim() || '';
                                    const papel = empresa.papeis?.pap_papel?.trim() || '';

                                    return (
                                        <option key={empresa.emp_cnpj} value={empresa.emp_cnpj}>
                                            {empresaNome} - {papel}
                                        </option>
                                    );
                                })}
                            </select>
                        ) : (
                            <p className="text-gray-500 mt-4">Nenhuma empresa associada encontrada.</p>
                        )}
                    </div>

                    {selectedSchema && empresaData && (
                        <div className="mt-6">
                            <EmpresaComponent schema={selectedSchema} empresaData={empresaData} empresaName={selectedEmpresaName} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
