import { useState } from 'react';
import api from '../apiUrl';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import "./style.css"

export default function LoginMaster() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [mensagem, setMensagem] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/login-master', { email, senha });
            const { user } = response.data;
            login(user);

            if (user.perfil === 'Master') {
                navigate('/master');
            } else if (user.perfil === 'Administrador') {
                navigate('/adminDashboard');
            } else if (user.perfil === 'Operador') {
                navigate('/operador');
            } else {
                setMensagem('Perfil não autorizado.');
            }
        } catch (error) {
            setMensagem(error.response?.data?.message || 'Erro ao fazer login.');
        }
    };


    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 bg">
            <form
                onSubmit={handleLogin}
                className="bg-white p-8 rounded-lg shadow-lg w-full sm:w-96"
            >
                <h2 className="text-2xl font-semibold text-center text-gray-700 mb-6">
                    Login innoAir
                </h2>
                <div className="space-y-4">
                    <div>
                        <input
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <input
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Senha"
                            type="password"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    className="w-full py-2 mt-6 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
                >
                    Logar
                </button>
                {mensagem && (
                    <p className="mt-4 text-center text-red-500">{mensagem}</p>
                )}
            </form>
        </div>
    );
}
