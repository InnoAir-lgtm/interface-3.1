import  { useState } from 'react';
import axios from 'axios';

export default function CadastrarPapel() {
    const [isRolePopupOpen, setIsRolePopupOpen] = useState(false);
    const [roleData, setRoleData] = useState({ roleName: '', });
    
    const handleRoleInputChange = (e) => {
        const { name, value } = e.target;
        setRoleData({ ...roleData, [name]: value });
    };

    const handleRoleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3000/cadastrar-papeis', {
                papel: roleData.roleName,
            });

            console.log('Resposta do servidor:', response.data);
            alert('Papel cadastrado com sucesso!');
            setRoleData({ roleName: '' });
            setIsRolePopupOpen(false);
            fetchRoles(); // Atualizar lista de papéis
        } catch (error) {
            console.error('Erro ao cadastrar papel:', error);
            alert('Falha ao cadastrar papel.');
        }
    };


    const toggleRolePopup = () => {
        setIsRolePopupOpen(!isRolePopupOpen);
    };

    return (
        <div>
            <button
                onClick={toggleRolePopup}
                className="py-2 px-4 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600"
            >
                Cadastrar Cargo
            </button>



            <div>
                {isRolePopupOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md relative">
                            <button
                                onClick={toggleRolePopup}
                                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                            >
                                ✕
                            </button>
                            <h2 className="text-2xl font-semibold text-center text-gray-700 mb-6">
                                Cadastrar Cargo
                            </h2>
                            <form onSubmit={handleRoleSubmit}>
                                <div className="space-y-4">
                                    <div>
                                        <input
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Nome do Papel"
                                            type="text"
                                            name="roleName"
                                            value={roleData.roleName}
                                            onChange={handleRoleInputChange}
                                        />
                                    </div>

                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-2 mt-6 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                >
                                    Cadastrar Cargo
                                </button>
                            </form>
                        </div>
                    </div >
                )
                }</div>
        </div>
    )
}
