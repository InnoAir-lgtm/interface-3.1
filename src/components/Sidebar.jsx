import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import { useEmpresa } from "./EmpresaContext";
import api from "../apiUrl";
import { Link, useLocation } from "react-router-dom";
import { FiHome, FiChevronDown, FiChevronUp, FiMenu, FiX } from "react-icons/fi";
import { TbTableSpark } from "react-icons/tb";
import CadastrarTipoModal from "../cadastros/CadastrarTipo";
import CadastrarTipoProduto from "../cadastros/CadastrarTipoProduto";
import RegistrarProcedencia from "../cadastros/RegistrarProcedencia";


export default function Sidebar({ selectedEmpresa, selectedSchema }) {
    const { logout } = useAuth();
    const { user } = useAuth();
    const { setSelectedEmpresa } = useEmpresa();
    const [empresas, setEmpresas] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const location = useLocation();
    const [currentRole, setCurrentRole] = useState(user.papel);

    useEffect(() => {
        setCurrentRole(user.papel);
    }, [user.papel]);

    useEffect(() => {
        const fetchEmpresas = async () => {
            try {
                const response = await api.get(`/listar-associacoes/${user.id}`);
                const empresasUnicas = response.data.filter((empresa, index, self) =>
                    index === self.findIndex((e) => e.emp_cnpj === empresa.emp_cnpj)
                );
                setEmpresas(empresasUnicas);
                if (empresasUnicas.length > 0 && !selectedEmpresa) {
                    setSelectedEmpresa(empresasUnicas[0].emp_cnpj);
                }
            } catch (error) {
                console.error("Erro ao buscar empresas:", error);
            }
        };
        if (user?.id) {
            fetchEmpresas();
        }
    }, [user.id, selectedEmpresa]);

    const handleEmpresaChange = (e) => {
        setSelectedEmpresa(e.target.value);
    };

    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const menuItems = [
        { name: "Operador", path: "/operador", icon: <FiHome /> },
    ];

    return (
        <>
            <button
                onClick={toggleSidebar}
                className="text-white p-4 md:hidden fixed top-0 left-0 z-[110]"
            >
                {isSidebarOpen ? <FiX size={24} /> : <FiMenu className="text-black" size={24} />}
            </button>

            <div className={`fixed z-[100] left-0 top-0 h-screen bg-gray-900 text-white p-6 shadow-xl transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:w-64`}>
                <h2 className="text-2xl font-bold mb-6 text-center">🚀 Bem Vindo</h2>

                <div className="flex flex-col items-center gap-4 p-3 rounded-lg bg-blue-600 shadow-md mb-6">
                    <img src="https://avatars.githubusercontent.com/u/69748654?v=4" alt="Perfil" className="w-12 h-12 rounded-full" />
                    <div className="w-full">
                        <h3 className="text-sm font-semibold truncate">{user.nome || "Usuário"}</h3>
                        <p className="text-xs text-gray-200 truncate">{user.email || "email@example.com"}</p>
                        <p className="text-xs truncate">{currentRole}</p>
                    </div>
                </div>

                <div className="mb-6">
                    {empresas.length > 0 ? (
                        <select
                            className="w-full p-2 border rounded-lg text-gray-800"
                            onChange={handleEmpresaChange}
                            value={selectedEmpresa}
                        >
                            {empresas.map((empresa) => (
                                <option key={empresa.emp_cnpj} value={empresa.emp_cnpj}>
                                    {empresa.empresas?.emp_nome} - {empresa.papeis?.pap_papel}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <p className="text-gray-500">Nenhuma empresa encontrada.</p>
                    )}
                </div>

                <nav className="flex flex-col gap-3">
                    {menuItems.slice(0, 3).map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-4 p-3 rounded-lg text-lg transition-all duration-300 font-medium
                    ${location.pathname === item.path ? "bg-blue-600 shadow-md scale-105" : "hover:bg-gray-800 hover:scale-105"}
                    `}
                        >
                            <span className="text-xl">{item.icon}</span>
                            {item.name}
                        </Link>
                    ))}

                    <div className="relative">
                        <button
                            onClick={toggleDropdown}
                            className="flex items-center gap-4 p-3 rounded-lg text-lg transition-all duration-300 font-medium hover:bg-gray-800 hover:scale-105 w-full"
                        >
                            <TbTableSpark className="text-xl" />
                            Tabelas
                            {isDropdownOpen ? <FiChevronUp /> : <FiChevronDown />}
                        </button>

                        {isDropdownOpen && (
                            <div className="ml-6 mt-2 flex flex-col gap-2 bg-gray-800 p-3 rounded-md shadow-lg">
                                <CadastrarTipoModal schema={selectedSchema || ''} />
                            </div>
                        )}

                        {isDropdownOpen && (
                            <div className="ml-6 mt-2 flex flex-col gap-2 bg-gray-800 p-3 rounded-md shadow-lg">
                                <CadastrarTipoProduto schema={selectedSchema || ''} />
                            </div>
                        )}

                        {isDropdownOpen && (
                            <div className="ml-6 mt-2 flex flex-col gap-2 bg-gray-800 p-3 rounded-md shadow-lg">
                                <RegistrarProcedencia schema={selectedSchema || ''} />
                            </div>
                        )}

                    </div>

                    {menuItems.slice(3).map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-4 p-3 rounded-lg text-lg transition-all duration-300 font-medium
                    ${location.pathname === item.path ? "bg-blue-600 shadow-md scale-105" : "hover:bg-gray-800 hover:scale-105"}
                            `}
                        >
                            <span className="text-xl">{item.icon}</span>
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <button
                    onClick={logout}
                    className="absolute bottom-4 left-6 right-6 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                >
                    Sair
                </button>

            </div>

        </>
    );
}

