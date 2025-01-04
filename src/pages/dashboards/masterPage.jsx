import { useAuth } from '../../auth/AuthContext';
import CadastrarAdm from '../../components/CadastrarAdm';
import CadastrarPapel from '../../components/CadastrarPapel';
import CadastrarPerm from '../../components/CadastrarPerm';
import ListaPapeis from '../../components/ListaPapeis';



export default function MasterPage() {
    const { logout } = useAuth()



    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <header className="bg-white shadow-md rounded-lg p-6 mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Dashboard Master</h1>
                    <p className="text-gray-600 mt-2">Gerencie usuários e grupos com facilidade.</p>
                </div>

                <div className='flex justify-center items-center gap-5'>
                    <img
                        src="https://via.placeholder.com/150"
                        alt="Dashboard Illustration"
                        className="w-24 h-24 rounded-full shadow-lg"
                    />

                    <button
                        onClick={logout}
                        className='flex justify-center items-center w-[50px] h-[50px] px-4 py-2 bg-red-500 text-white rounded-full shadow hover:bg-red-600'
                    >
                        Sair
                    </button>
                </div>


            </header>


            <div className='flex gap-5'>
                <CadastrarPapel />

                <CadastrarAdm />

                <CadastrarPerm />
            </div>





            <ListaPapeis />

        </div >
    );
}
