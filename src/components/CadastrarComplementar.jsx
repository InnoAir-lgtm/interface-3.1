import  { useState, useEffect } from 'react';
import { useEndereco } from '../auth/ProviderEndereco';

export default function CadastrarComplementar({ selectedPessoa }) {
    const [enderecos] = useEndereco();
    const [complementar, setComplementar] = useState({
        cep: '',
        complemento: '',
        latitude: '',
        longitude: '',
        numero: '',
        epe_tipo: '' 
    });

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
        if (!selectedPessoa) {
            alert('Nenhuma pessoa selecionada.');
            return;
        }

        const enderecoData = {
            pes_id: selectedPessoa.pes_id,
            epe_numero: complementar.numero || '',  
            epe_complemento: complementar.complemento || '',  
            epe_tipo: complementar.epe_tipo,
            end_cep: complementar.cep.replace('-', ''),  
            epe_latitude: complementar.latitude || '',
            epe_longitude: complementar.longitude || ''
        };

        console.log(enderecoData)
        try {
            const response = await fetch('http://localhost:3000/associar-endereco', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(enderecoData)
            });

            if (!response.ok) {
                throw new Error('Erro ao associar endereço');
            }

            const data = await response.json();
            alert(data.message);
        } catch (error) {
            console.error('Erro ao salvar o endereço:', error.message);
            alert('Erro ao salvar o endereço.');
        }
    };

    return (
        <div>
            <form className="grid gap-2">
                <div className="flex w-full gap-4">
                    <input
                        type="text"
                        value={complementar.cep}
                        readOnly
                        placeholder="CEP"
                        className="border p-2 rounded flex-1"
                    />
                    <input
                        type="text"
                        placeholder="Número"
                        className="border p-2 rounded w-24"
                        onChange={(e) => setComplementar({ ...complementar, numero: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="Complemento"
                        className="border p-2 rounded flex-1"
                        onChange={(e) => setComplementar({ ...complementar, complemento: e.target.value })}
                    />
                </div>

                <div className="flex w-full gap-4 mb-10">
                    <input
                        type="text"
                        value={complementar.latitude}
                        readOnly
                        placeholder="Latitude"
                        className="border p-2 rounded w-40"
                    />
                    <input
                        type="text"
                        value={complementar.longitude}
                        readOnly
                        placeholder="Longitude"
                        className="border p-2 rounded w-40"
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
                    className="bg-blue-600 text-white py-2 rounded"
                    onClick={salvarEndereco}
                >
                    Salvar
                </button>
            </form>
        </div>
    );
}
