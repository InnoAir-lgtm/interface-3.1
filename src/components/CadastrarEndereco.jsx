import { useState } from 'react';
import api from '../apiUrl';

import { useEndereco } from '../auth/ProviderEndereco';

export default function CadastrarEndereco() {
    const { addEndereco } = useEndereco(); // Certifique-se de usar a desestruturação correta
    const [endereco, setEndereco] = useState({ cep: '', logradouro: '', bairro: '', cidade: '', uf: '' });
    const [showSidebar, setShowSidebar] = useState(false);

    const handleChange = async (e) => {
        e.preventDefault();
        if (!endereco.cep) {
            alert('Por favor, insira um CEP.');
            return;
        }
        try {
            const formattedCep = endereco.cep.replace('-', '');
            const response = await api.post('/cadastrar-endereco', {
                cep: formattedCep,
                logradouro: endereco.logradouro,
                bairro: endereco.bairro,
                cidade: endereco.cidade,
                uf: endereco.uf,
                latitude: endereco.latitude || '',
                longitude: endereco.longitude || '',
            });
            console.log(response);
            alert('Endereço cadastrado com sucesso!');

            addEndereco(endereco); // Chamada correta da função
            setEndereco({ cep: '', logradouro: '', bairro: '', cidade: '', uf: '' });
            setShowSidebar(false);
        } catch (error) {
            console.error('Erro ao cadastrar endereço:', error.message);
            alert('Falha ao cadastrar endereço.');
        }
    };

    const fetchEndereco = async (cep) => {
        const cleanCep = cep.replace('-', '');
        if (!cleanCep || cleanCep.length !== 8) return;

        try {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(cleanCep)}&key=AIzaSyDtW8rulgb5mXwwiU7LvfgXOhFHZBV0xWQ`
            );
            const data = await response.json();

            if (data.status === 'OK') {
                const result = data.results[0];
                const endereco = result.address_components.reduce((acc, component) => {
                    const type = component.types[0];
                    switch (type) {
                        case 'route':
                            acc.logradouro = component.long_name;
                            break;
                        case 'sublocality_level_1':
                        case 'political':
                            acc.bairro = component.long_name;
                            break;
                        case 'administrative_area_level_1':
                            acc.uf = component.short_name;
                            break;
                        case 'administrative_area_level_2':
                        case 'locality':
                            acc.cidade = component.long_name;
                            acc.latitude = result.geometry.location.lat;
                            acc.longitude = result.geometry.location.lng;
                            break;
                        default:
                            break;
                    }
                    return acc;
                }, {});

                addEndereco(endereco); // Chamada correta da função
                setEndereco({ ...endereco, cep });
            } else {
                console.error('Erro ao buscar endereço:', data.status);
            }
        } catch (error) {
            console.error('Erro ao chamar a API:', error.message);
        }
    };

    return (
        <div>
            <button
                onClick={() => setShowSidebar(true)}
                className="px-5 py-3  text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
                + Adicionar endereço
            </button>

            {showSidebar && (
                <div className="fixed inset-0 flex z-50">
                    {/* Sidebar */}
                    <div className="w-96 bg-white shadow-lg h-full overflow-y-auto transition-transform transform translate-x-0">
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Cadastro de Endereço</h2>
                            <form onSubmit={handleChange} className="space-y-4">
                                <input
                                    type="text"
                                    name="cep"
                                    value={endereco.cep}
                                    onChange={(e) => {
                                        let cepValue = e.target.value;
                                        cepValue = cepValue.replace(/[^\d-]/g, '');
                                        setEndereco({ ...endereco, cep: cepValue });
                                        if (cepValue.length === 9) {
                                            fetchEndereco(cepValue);
                                        }
                                    }}
                                    placeholder="CEP"
                                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-400"
                                    required
                                />
                                <input
                                    type="text"
                                    name="logradouro"
                                    value={endereco.logradouro}
                                    onChange={(e) => setEndereco({ ...endereco, logradouro: e.target.value })}
                                    placeholder="Logradouro"
                                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-400"
                                    required
                                />
                                <input
                                    type="text"
                                    name="bairro"
                                    value={endereco.bairro}
                                    onChange={(e) => setEndereco({ ...endereco, bairro: e.target.value })}
                                    placeholder="Bairro"
                                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-400"
                                    required
                                />
                                <input
                                    type="text"
                                    name="cidade"
                                    value={endereco.cidade}
                                    onChange={(e) => setEndereco({ ...endereco, cidade: e.target.value })}
                                    placeholder="Cidade"
                                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-400"
                                    required
                                />
                                <input
                                    type="text"
                                    name="uf"
                                    value={endereco.uf}
                                    onChange={(e) => setEndereco({ ...endereco, uf: e.target.value })}
                                    placeholder="UF"
                                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-400"
                                    required
                                />
                                <div className="flex justify-between">
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
                                    >
                                        Cadastrar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowSidebar(false)}
                                        className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                                    >
                                        Fechar
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div>
                            <form action="">
                                {/* Dados da tabela endereco */}
                            </form>
                        </div>
                    </div>

                    {/* Background Overlay */}
                    <div
                        className="flex-1 bg-black bg-opacity-50"
                        onClick={() => setShowSidebar(false)}
                    />
                </div>
            )}
        </div>
    );
}
