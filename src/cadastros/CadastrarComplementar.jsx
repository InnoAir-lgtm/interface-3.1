import { useState, useEffect } from 'react';
import { useEndereco } from '../auth/ProviderEndereco';
import api from '../apiUrl';

export default function CadastrarComplementar({ selectedPessoa, schema }) {
    const [enderecos] = useEndereco();
    const [complementar, setComplementar] = useState({
        cep: '',
        complemento: '',
        latitude: '',
        longitude: '',
        numero: '',
        epe_tipo: ''
    });
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (enderecos.length > 0) {
            const ultimoEndereco = enderecos[enderecos.length - 1];
            setComplementar({
                cep: ultimoEndereco.cep || '',
                latitude: ultimoEndereco.latitude || '',
                longitude: ultimoEndereco.longitude || '',
                complemento: ultimoEndereco.complemento || '',
                numero: ultimoEndereco.epe_numero || ''
            });
        }
    }, [enderecos]);

    const salvarEndereco = async () => {
        setMessage('');
        if (!schema) {
            setMessage('Selecione um schema antes de cadastrar.');
            return;
        }

        if (!selectedPessoa) {
            setMessage('Nenhuma pessoa selecionada.');
            return;
        }

        const enderecoData = {
            schema,
            pes_id: selectedPessoa.pes_id,
            epe_numero: complementar.numero || '',
            epe_complemento: complementar.complemento || '',
            epe_tipo: complementar.epe_tipo,
            end_cep: complementar.cep.replace('-', ''),
            epe_latitude: complementar.latitude || '',
            epe_longitude: complementar.longitude || ''
        };

        console.log(enderecoData);

        try {
            const response = await api.post('/associar-endereco', enderecoData);
            setMessage(response.data.message);
        } catch (error) {
            console.error('Erro ao salvar o endereço:', error.message);
            setMessage('Erro ao salvar o endereço.');
        }
    };

    return (
        <div className='mt-4'>
            <form className="grid gap-4">
                {message && <p className="text-red-600">{message}</p>}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <input
                        type="text"
                        value={complementar.cep}
                        readOnly
                        placeholder="CEP"
                        className="border p-2 rounded w-full"
                    />
                    <input
                        type="text"
                        placeholder="Número"
                        className="border p-2 rounded w-full"
                        onChange={(e) => setComplementar({ ...complementar, numero: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="Complemento"
                        className="border p-2 rounded w-full"
                        onChange={(e) => setComplementar({ ...complementar, complemento: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <input
                        type="text"
                        value={complementar.latitude}
                        readOnly
                        placeholder="Latitude"
                        className="border p-2 rounded w-full"
                    />
                    <input
                        type="text"
                        value={complementar.longitude}
                        readOnly
                        placeholder="Longitude"
                        className="border p-2 rounded w-full"
                    />
                    <select
                        className="border p-2 rounded w-full"
                        value={complementar.epe_tipo}
                        onChange={(e) => setComplementar({ ...complementar, epe_tipo: e.target.value })}
                    >
                        <option>Selecione tipo de endereço</option>
                        <option value="Residencial">Residencial</option>
                        <option value="Comercial">Comercial</option>
                        <option value="Entrega">Entrega</option>
                        <option value="Cobrança">Cobrança</option>
                    </select>
                </div>

                <button
                    type="button"
                    className="bg-blue-600 text-white py-2 rounded w-full sm:w-auto"
                    onClick={salvarEndereco}
                >
                    Salvar
                </button>
            </form>
        </div>
    );
}
