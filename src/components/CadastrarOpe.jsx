import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';

export default function CadastrarOpe() {
    const { user } = useAuth(); // Obtendo o usuário logado
    const [formData, setFormData] = useState({ email: '', name: '', password: '', perfil: '', grupo: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [ setPapeis] = useState([]);
    const [ setEmpresas] = useState([]);
    const [isPopUp, setIsPopUp] = useState(false);

    useEffect(() => {
        const fetchPapeis = async () => {
            try {
                const response = await fetch('http://localhost:3000/listar-papeis');
                if (!response.ok) throw new Error('Erro ao buscar papéis.');
                const data = await response.json();
                setPapeis(data);
            } catch (error) {
                console.error('Erro ao buscar papéis:', error);
            }
        };

        const fetchEmpresas = async () => {
            try {
                const response = await fetch('http://localhost:3000/lista-empresas');
                if (!response.ok) throw new Error('Erro ao buscar empresas.');
                const data = await response.json();
                setEmpresas(data);
            } catch (error) {
                console.error('Erro ao buscar empresas:', error);
            }
        };

        fetchEmpresas();
        fetchPapeis();
    }, []);

    useEffect(() => {
        if (user) {
            setFormData((prevData) => ({
                ...prevData,
                grupo: user.grupo, // Definindo o grupo automaticamente baseado no usuário logado
            }));
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validatePassword(formData.password)) {
            alert('A senha deve conter pelo menos 8 caracteres, incluindo uma letra maiúscula, um número e um caractere especial.');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/cadastrar-usuario', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: `${formData.email}@bela.com.br`,
                    nome: formData.name,
                    senha: formData.password,
                    perfil: formData.perfil,
                    grupo: formData.grupo,
                }),
            });

            if (!response.ok) throw new Error('Erro ao cadastrar usuário.');
            alert('Usuário cadastrado com sucesso!');
            setFormData({ email: '', name: '', password: '', perfil: '', grupo: user.grupo });
            setIsPopUp(false);
        } catch (error) {
            console.error('Erro ao cadastrar usuário:', error);
            alert('Falha ao cadastrar usuário.');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const togglePopUp = () => {
        setIsPopUp(!isPopUp);
    };

    const validatePassword = (password) => {
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    };

    return (
        <div>
            <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                    Cadastrar novos usuários
                </h2>
                <p className="text-gray-600">Gerencie os usuários registrados no sistema.</p>
                <button
                    onClick={togglePopUp}
                    className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
                    Cadastrar
                </button>
            </div>

            {isPopUp && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md relative">
                        <button
                            onClick={togglePopUp}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                        >
                            ✕
                        </button>
                        <h2 className="text-2xl font-semibold text-center text-gray-700 mb-6">
                            Cadastrar Usuário
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <input
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Email (sem domínio)"
                                        type="text"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                    />
                                    <span className="px-4 py-2 bg-gray-200 border border-gray-300 rounded-r-lg">
                                        @bela.com.br
                                    </span>
                                </div>

                                <div>
                                    <input
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Nome"
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="relative">
                                    <input
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Senha"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                    />
                                    <button
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                        className="absolute inset-y-0 right-2 text-gray-500 hover:text-gray-700"
                                    >
                                        {showPassword ? '🙈' : '👁️'}
                                    </button>
                                </div>

                                <div>
                                    <div className='w-full border'></div>
                                </div>
                                <div>
                                    <select
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        name="perfil"
                                        value={formData.perfil}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Selecione o Cargo</option>
                                        <option value="Administrador">Administrador</option>
                                        <option value="Operador">Operador</option>
                                    </select>
                                </div>

                                {/* Campo de Grupo, agora fixo e com valor baseado no usuário logado */}
                                <div>
                                    <input
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        name="grupo"
                                        value={formData.grupo} // Valor do grupo fixo
                                        readOnly // Campo apenas leitura
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded w-full"
                            >
                                Cadastrar
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
