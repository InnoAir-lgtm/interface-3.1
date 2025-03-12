import { useAuth } from '../../auth/AuthContext';
import CadastrarOpe from '../../cadastros/CadastrarOpe';
import ListarUsuarios from '../../Listagem/Listarusuarios';
import Perfil from '../../components/Perfil';


export default function DashboardAdm() {

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">

            {/* Cabeçalho */}
            <header className="py-4 shadow-lg bg-white">
                <div className="container mx-auto flex justify-between items-center px-4 sm:px-8">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight">Dashboard do Administrador</h1>
                    <div className="flex items-center space-x-4">
                        <Perfil />
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
