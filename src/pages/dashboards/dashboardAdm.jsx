import { useAuth } from '../../auth/AuthContext';
import CadastrarOpe from '../../components/CadastrarOpe';
import ListarUsuarios from '../../components/Listarusuarios';
import Perfil from '../../components/Perfil';
import { IoLogOutOutline } from "react-icons/io5";

export default function DashboardAdm() {
    const { logout } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">

            {/* Cabeçalho */}
            <header className="bg-gradient-to-r from-blue-400 to-teal-500 text-white py-6 shadow-lg">
                <div className="container mx-auto flex justify-between items-center px-8">
                    <h1 className="text-4xl font-semibold tracking-tight">Dashboard do Administrador</h1>
                    <div className="flex items-center space-x-6">
                        {/* Botão Sair */}
                        <button
                            onClick={logout}
                            className="group bg-red-500 hover:bg-red-600 w-12 h-12 flex justify-center items-center rounded-full transition transform hover:scale-110 shadow-md focus:outline-none">
                            <IoLogOutOutline fontSize={28} className="text-white group-hover:text-gray-200" />
                        </button>

                        {/* Botão de Perfil */}
                        <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-green-400 flex justify-center items-center shadow-lg">
                                <Perfil />
                            </div>
                            <div className="absolute bottom-0 right-0 bg-white w-4 h-4 rounded-full border-2 border-white"></div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-grow container mx-auto px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="col-span-1 bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                        <CadastrarOpe />
                    </div>

                    <div className="col-span-1 bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                        <ListarUsuarios />
                    </div>
                </div>
            </main>

            <footer className="bg-gray-800 text-white py-6 mt-8">
                <div className="container mx-auto text-center">
                    <p className="text-sm">&copy; 2024 Dashboard do Administrador. Todos os direitos reservados.</p>
                </div>
            </footer>

        </div>
    );
}
