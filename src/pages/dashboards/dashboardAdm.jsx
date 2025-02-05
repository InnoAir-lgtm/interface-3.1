import { useAuth } from '../../auth/AuthContext';
import CadastrarOpe from '../../components/CadastrarOpe';
import ListarUsuarios from '../../components/Listarusuarios';
import Perfil from '../../components/Perfil';


export default function DashboardAdm() {
    
    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">

            {/* Cabeçalho */}
            <header className="py-6 shadow-lg">
                <div className="container mx-auto flex justify-between items-center px-8">
                    <h1 className="text-4xl font-semibold tracking-tight">Dashboard do Administrador</h1>
                    <div className="flex items-center space-x-6">
                        <div className="relative">
                                <Perfil />
                            <div className="absolute bottom-0 right-0 bg-white w-4 h-4 rounded-full border-2 border-white"></div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-grow container mx-auto px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <CadastrarOpe />
                    <ListarUsuarios />
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
