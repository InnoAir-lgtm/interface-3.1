import { useState } from 'react';
import { useEndereco } from '../auth/ProviderEndereco';
import { usePermissions } from '../middleware/middleware';
import { BsMailboxFlag } from "react-icons/bs";
import api from '../apiUrl';

export default function CadastrarEndereco({ schema }) {
    const [enderecos, addEndereco] = useEndereco();
    const { verifyAndCreatePermission } = usePermissions();
    const [endereco, setEndereco] = useState({ cep: '', logradouro: '', bairro: '', cidade: '', uf: '' });
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const handleChange = async (e) => {
        e.preventDefault();

        if (!schema) {
            alert('Selecione um schema antes de cadastrar.');
            return;
        }

        if (!endereco.cep) {
            alert('Por favor, insira um CEP.');
            return;
        }

        const formattedCep = endereco.cep.replace('-', '');

        try {
            const checkResponse = await api.get(`/buscar-endereco?schema=${schema}&cep=${formattedCep}`);
            const checkData = await checkResponse.data;

            if (checkData.data?.length > 0) {
                alert('CEP já existe. Endereço carregado!');
                const enderecoBD = checkData.data[0];

                const enderecoFormatado = {
                    cep: enderecoBD.end_cep,
                    logradouro: enderecoBD.end_logradouro,
                    bairro: enderecoBD.end_bairro,
                    cidade: enderecoBD.end_cidade,
                    uf: enderecoBD.end_uf || '',
                };

                addEndereco(enderecoFormatado);
                setEndereco(enderecoFormatado);
                setIsOpen(false);
                return;
            }


            const response = await api.post('/cadastrar-endereco', {
                schema,
                cep: formattedCep,
                logradouro: endereco.logradouro,
                bairro: endereco.bairro,
                cidade: endereco.cidade,
                uf: endereco.uf,
                latitude: endereco.latitude || '',
                longitude: endereco.longitude || '',
            });

            alert('Endereço cadastrado com sucesso!');
            addEndereco(endereco);
            setEndereco({ cep: '', logradouro: '', bairro: '', cidade: '', uf: '' });
            setIsOpen(false);
        } catch (error) {
            console.error('Erro ao cadastrar endereço:', error.message);
            alert('Falha ao cadastrar endereço.');
        }
    };


    const fetchEndereco = async (cep) => {
        const cleanCep = cep.replace('-', '');
        if (!cleanCep || cleanCep.length !== 8) return;

        try {
            const localResponse = await api.get(`/buscar-endereco?schema=${schema}&cep=${cleanCep}`);
            const localData = await localResponse.data;

            if (localData.data?.length > 0) {
                const enderecoBD = localData.data[0];
                const enderecoFormatado = {
                    cep: enderecoBD.end_cep,
                    logradouro: enderecoBD.end_logradouro,
                    bairro: enderecoBD.end_bairro,
                    cidade: enderecoBD.end_cidade,
                    uf: enderecoBD.end_uf || '',
                };

                addEndereco(enderecoFormatado);
                setEndereco(enderecoFormatado);
                return;
            }

            const checkData = await checkResponse.data;
            console.log('Dados retornados do backend:', checkData);

            const apiResponse = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(cleanCep)}&key=AIzaSyDtW8rulgb5mXwwiU7LvfgXOhFHZBV0xWQ`
            );
            const data = await apiResponse.json();

            if (data.status === 'OK') {
                const result = data.results[0];
                const enderecoAPI = result.address_components.reduce((acc, component) => {
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
                            break;
                        default:
                            break;
                    }
                    return acc;
                }, {});

                enderecoAPI.latitude = result.geometry.location.lat;
                enderecoAPI.longitude = result.geometry.location.lng;

                const enderecoFinal = { ...enderecoAPI, cep };

                addEndereco(enderecoFinal);
                setEndereco(enderecoFinal);
            } else {
                console.error('Erro ao buscar endereço na API:', data.status);
            }
        } catch (error) {
            console.error('Erro geral ao buscar endereço:', error.message);
        }
    };


    const abrirModal = async (permissionName) => {
        const hasPermission = await verifyAndCreatePermission(permissionName);
        if (hasPermission) {
            setIsOpen(true);
        }
    };

    const closeModal = () => {
        setIsOpen(false);
    };

    const handleCloseSidebar = () => {
        setEndereco({ cep: '', logradouro: '', bairro: '', cidade: '', uf: '' });
        setIsOpen(false); // Fecha o modal
    };

    return (
        <div>
            <button
                value="adicionarEndereco"
                onClick={(e) => abrirModal(e.target.value)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="flex justify-center items-center w-12 hover:w-48 overflow-hidden transition-all duration-300 ease-in-out text-white bg-blue-500 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 p-3"
            >
                <BsMailboxFlag className="text-white text-lg transition-all duration-300" />

                <span
                    className={`ml-2 whitespace-nowrap transition-all duration-300 ${isHovered ? "opacity-100 w-auto" : "opacity-0 w-0"
                        }`}
                >
                    Adicionar endereço
                </span>
            </button>

            {isOpen && (
                <div className="fixed inset-0 flex z-50">
                    <div className="w-96 bg-white shadow-lg h-full overflow-y-auto transition-transform transform translate-x-0">
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Cadastro de Endereço</h2>
                            <form onSubmit={handleChange} className="space-y-4">
                                <input
                                    type="text"
                                    name="cep"
                                    value={endereco.cep}
                                    onChange={(e) => {
                                        let cepValue = e.target.value.replace(/\D/g, '');

                                        if (cepValue.length > 5) {
                                            cepValue = `${cepValue.slice(0, 5)}-${cepValue.slice(5, 8)}`;
                                        }

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
                                        onClick={handleCloseSidebar}
                                        className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                                    >
                                        Fechar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div
                        className="flex-1 bg-black bg-opacity-50"
                        onClick={handleCloseSidebar}
                    />
                </div>
            )}
        </div>
    );
}
