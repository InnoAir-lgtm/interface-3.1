import  { useState } from 'react';
import api from '../apiUrl';

export default function CadastrarEmail({ selectedPessoa }) {
    const [contato, setContato] = useState({ email: '', numero: '', email_tipo: '', pes_id: '' });
    const [inputPlaceholder, setInputPlaceholder] = useState('');

    const handleTipoContatoChange = (e) => {
        const tipoContato = e.target.value;
        let placeholder = '';
        switch (tipoContato) {
            case 'Instagram':
                placeholder = '@';
                break;
            case 'Telefone comercial':
            case 'Telefone pessoal':
                placeholder = '+55 ()';
                break;
            default:
                placeholder = '';
        }

        setInputPlaceholder(placeholder);
        setContato(prevState => ({
            ...prevState,
            email_tipo: tipoContato,
        }));
    };

    const salvarContato = async () => {
        if (!contato.email || !contato.numero || !contato.email_tipo) {
            alert('Preencha todos os campos obrigatórios antes de salvar o contato.');
            return;
        }

        const contatoData = {
            ctt_contato: contato.numero,
            ctt_tipo: contato.email_tipo,
            pes_id: selectedPessoa.pes_id,
            ctt_numero_email: contato.email,
        };

        try {
            const response = await api.post('/associar-contato-pessoa', contatoData);


        
            alert(response.data.message);
        } catch (error) {
            console.error('Erro ao salvar contato:', error.message);
            alert('Não foi possível salvar o contato.');
        }
    };

    return (
        <div>
            <div className="flex gap-4 mb-4">
                <div className="w-1/2">
                    <label htmlFor="tipo_email" className="block text-sm font-medium text-gray-600">Tipo de contato</label>
                    <select
                        id="tipo_email"
                        className="mt-1 p-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        onChange={handleTipoContatoChange}
                    >
                        <option value="">Selecione o tipo de contato</option>
                        <option value="Email NFE">Email NFE</option>
                        <option value="Email NFSE">Email NFSE</option>
                        <option value="Telefone comercial">Telefone comercial</option>
                        <option value="Telefone pessoal">Telefone pessoal</option>
                        <option value="Whatsapp">Whatsapp</option>
                        <option value="Home Page">Home Page</option>
                        <option value="Instagram">Instagram</option>
                        <option value="Facebook">Facebook</option>
                        <option value="Linkedin">Linkedin</option>
                    </select>
                </div>

                <div className="w-1/2">
                    <label htmlFor="nome_contato" className="block text-sm font-medium text-gray-600">Nome contato</label>
                    <input
                        id="nome_contato"
                        className="mt-1 p-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        type="text"
                        placeholder="Contato"
                        onChange={(e) => setContato(prevState => ({
                            ...prevState,
                            numero: e.target.value
                        }))}
                    />
                </div>
            </div>

            <div className="flex gap-4 mb-6">
                <div className="w-1/2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-600">Contato</label>
                    <input
                        type="text"
                        id="contato"
                        className="mt-1 p-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        value={contato.email}
                        placeholder={inputPlaceholder}
                        onChange={(e) => setContato(prevState => ({
                            ...prevState,
                            email: e.target.value
                        }))}
                    />
                </div>

                <div className="w-1/2 flex items-end">
                    <button
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        onClick={salvarContato}
                    >
                        Adicionar contato
                    </button>
                </div>
            </div>
        </div>
    );
}
