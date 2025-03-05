import React, { useEffect, useState } from 'react';
import api from '../apiUrl';
import { FaUserEdit } from "react-icons/fa";

export default function EditarUsuario({ selectedPessoa, schema, fetchPessoas }) {
    const [openModal, setOpenModal] = useState(false);
    const [formData, setFormData] = useState({
        pes_cpf_cnpj: '',
        pes_dn: '',
        pes_nome: '',
    });

    const abrirModal = () => setOpenModal(true);
    const fecharModal = () => setOpenModal(false);

    useEffect(() => {
        if (selectedPessoa) {
            setFormData({
                pes_cpf_cnpj: selectedPessoa.pes_cpf_cnpj || '',
                pes_dn: selectedPessoa.pes_dn || '',
                pes_nome: selectedPessoa.pes_nome || '',
            });
        }
    }, [selectedPessoa]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdate = async (e, pes_id, schema) => {
        e.preventDefault();
        const updatedData = { ...formData };
        if (!updatedData.pes_dn || updatedData.pes_dn.trim() === '') {
            updatedData.pes_dn = null;
        }
        try {
            const response = await api.put(`/pessoas/${pes_id}?schema=${schema}`, updatedData);
            alert(response.data.message);
            fetchPessoas(); 
            fecharModal();
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            alert('Erro ao atualizar usuário.');
        }
    };

    return (
        <div>
            <button onClick={abrirModal} className="text-[30px]">
                <FaUserEdit />
            </button>

            {openModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
                        <div className="flex justify-between items-center mb-7">
                            <button
                                className="bg-red-500 text-white py-1 px-3 rounded-full hover:bg-red-600 transition"
                                onClick={fecharModal}
                            >
                                ✕
                            </button>
                            <h2 className="text-xl font-semibold">Editar Usuário</h2>
                        </div>

                        <form onSubmit={(e) => handleUpdate(e, selectedPessoa.pes_id, schema)}>
                            <label className="block">
                                Nome:
                                <input
                                    type="text"
                                    name="pes_nome"
                                    value={formData.pes_nome}
                                    onChange={handleChange}
                                    className="w-full border p-2 rounded-md"
                                />
                            </label>
                            <label className="block">
                                CPF/CNPJ:
                                <input
                                    type="text"
                                    name="pes_cpf_cnpj"
                                    value={formData.pes_cpf_cnpj}
                                    onChange={handleChange}
                                    className="w-full border p-2 rounded-md"
                                />
                            </label>
                            <button type="submit" className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md">
                                Atualizar
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}