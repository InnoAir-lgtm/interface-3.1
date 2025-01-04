import { useState } from 'react';
import api from '../apiUrl';

export default function CadastrarAdm() {
    const [formData, setFormData] = useState({ email: '', name: '', password: '', grupo: '', perfil: '' });
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === 'email') {
            setFormData({ ...formData, [name]: value });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const validatePassword = (password) => {
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validatePassword(formData.password)) {
            alert(
                'A senha deve conter pelo menos 8 caracteres, incluindo uma letra maiúscula, um número e um caractere especial.'
            );
            return;
        }

        try {
            const response = await api.post('http://localhost:3000/cadastrar-usuario', {
                email: `${formData.email}@bela.com.br`,
                nome: formData.name,
                senha: formData.password,
                grupo: formData.grupo,
                perfil: formData.perfil,
            });

            console.log('Resposta do servidor:', response.data);
            alert('Usuário cadastrado com sucesso!');
            setFormData({
                email: '',
                name: '',
                password: '',
                grupo: '',
                perfil: '',
            });
            setIsPopupOpen(false);
        } catch (error) {
            console.error('Erro ao cadastrar usuário:', error);
            alert('Falha ao cadastrar usuário.');
        }
    };

    const togglePopup = () => {
        setIsPopupOpen(!isPopupOpen);
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div>
            <button
                onClick={togglePopup}
                className="py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600"
            >
                Cadastrar adm
            </button>

            {isPopupOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md relative">
                        <button
                            onClick={togglePopup}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                        >
                            ✕
                        </button>
                        <h2 className="text-2xl font-semibold text-center text-gray-700 mb-6">
                            Cadastrar Administrador
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
                                <div>
                                    <select
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        name="grupo"
                                        value={formData.grupo}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Selecione o Grupo</option>
                                        <option value="bela_arte">Bela Arte</option>
                                    </select>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full py-2 mt-6 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
                            >
                                Cadastrar Usuário
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
