import { useState } from 'react';
import api from '../apiUrl';

export default function CadastrarEmail({ selectedPessoa, schema }) {
    const [contato, setContato] = useState({ email: '', numero: '', email_tipo: '', pes_id: '' });
    const [inputPlaceholder, setInputPlaceholder] = useState('');
    const [openModal, setOpenModal] = useState(false);

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
        setContato((prevState) => ({
            ...prevState,
            email_tipo: tipoContato,
        }));
    };

    const salvarContato = async () => {
        if (!schema) {
            alert('Selecione um schema antes de salvar o contato.');
            return;
        }

        if (!contato.email || !contato.numero || !contato.email_tipo) {
            alert('Preencha todos os campos obrigatórios antes de salvar o contato.');
            return;
        }

        const contatoData = {
            schema,
            ctt_contato: contato.numero,
            ctt_tipo: contato.email_tipo,
            pes_id: selectedPessoa.pes_id,
            ctt_numero_email: contato.email,
        };

        try {
            const response = await api.post('/associar-contato-pessoa', contatoData);
            alert(response.data.message);
            setOpenModal(false); // Fecha a modal ao salvar
        } catch (error) {
            console.error('Erro ao salvar contato:', error.message);
            alert('Não foi possível salvar o contato.');
        }
    };

    return (
        <div className="flex py-2 p-1 items-center">
            <button
                onClick={() => setOpenModal(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            >
                Adicionar contato
            </button>

            {openModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4 text-center">Cadastrar Contato</h2>

                        <div className="mb-4">
                            <label htmlFor="tipo_email" className="block text-sm font-medium text-gray-600">
                                Tipo de contato
                            </label>
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

                        <div className="mb-4">
                            <label htmlFor="nome_contato" className="block text-sm font-medium text-gray-600">
                                Nome do contato
                            </label>
                            <input
                                id="nome_contato"
                                className="mt-1 p-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
                                type="text"
                                placeholder="Contato"
                                onChange={(e) =>
                                    setContato((prevState) => ({
                                        ...prevState,
                                        numero: e.target.value,
                                    }))
                                }
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-600">
                                Contato
                            </label>
                            <input
                                type="text"
                                id="contato"
                                className="mt-1 p-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
                                value={contato.email}
                                placeholder={inputPlaceholder}
                                onChange={(e) =>
                                    setContato((prevState) => ({
                                        ...prevState,
                                        email: e.target.value,
                                    }))
                                }
                            />
                        </div>

                        <div className="flex justify-end space-x-2">
                            <button
                                className="bg-gray-400 text-white px-4 py-2 rounded-lg shadow-md hover:bg-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none"
                                onClick={() => setOpenModal(false)}
                            >
                                Cancelar
                            </button>
                            <button
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                                onClick={salvarContato}
                            >
                                Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
