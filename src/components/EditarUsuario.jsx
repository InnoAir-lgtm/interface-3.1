import React, { useEffect, useState } from 'react';
import api from '../apiUrl';
import { FaUserEdit } from "react-icons/fa";

export default function EditarUsuario({ selectedPessoa, schema, fetchPessoas }) {
    const [openModal, setOpenModal] = useState(false);
    const [formData, setFormData] = useState({
        pes_cpf_cnpj: '',
        pes_dn: '',
        pes_nome: '',
        pes_rg: '',
        pes_ie: '',
        pes_fantasia: '',
        pes_fis_jur: '',
    });

    const abrirModal = () => setOpenModal(true);
    const fecharModal = () => setOpenModal(false);

    useEffect(() => {
        if (selectedPessoa) {
            setFormData({
                pes_cpf_cnpj: selectedPessoa.pes_cpf_cnpj || '',
                pes_dn: selectedPessoa.pes_dn || '',
                pes_nome: selectedPessoa.pes_nome || '',
                pes_rg: selectedPessoa.pes_rg || '',
                pes_ie: selectedPessoa.pes_ie || '',
                pes_fantasia: selectedPessoa.pes_fantasia || '',
                pes_fis_jur: selectedPessoa.pes_fis_jur || '',
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
                            <div className="grid grid-cols-2 gap-4">
                                <label className="block">
                                    Nome:
                                    <input type="text" name="pes_nome" value={formData.pes_nome} onChange={handleChange} className="w-full border p-2 rounded-md" />
                                </label>
                                <label className="block">
                                    CPF/CNPJ:
                                    <input type="text" name="pes_cpf_cnpj" value={formData.pes_cpf_cnpj} onChange={handleChange} className="w-full border p-2 rounded-md" />
                                </label>
                                <label className="block">
                                    RG:
                                    <input type="text" name="pes_rg" value={formData.pes_rg} onChange={handleChange} className="w-full border p-2 rounded-md" />
                                </label>
                                <label className="block">
                                    IE:
                                    <input type="text" name="pes_ie" value={formData.pes_ie} onChange={handleChange} className="w-full border p-2 rounded-md" />
                                </label>
                                <label className="block">
                                    Data de Nascimento:
                                    <input type="date" name="pes_dn" value={formData.pes_dn || ''} onChange={handleChange} className="w-full border p-2 rounded-md" />
                                </label>
                                <label className="block">
                                    Nome Fantasia:
                                    <input type="text" name="pes_fantasia" value={formData.pes_fantasia} onChange={handleChange} className="w-full border p-2 rounded-md" />
                                </label>
                                <label className="block col-span-2">
                                    Tipo (Física/Jurídica):
                                    <select name="pes_fis_jur" value={formData.pes_fis_jur} onChange={handleChange} className="w-full border p-2 rounded-md">
                                        <option value="">Selecione</option>
                                        <option value="F">Física</option>
                                        <option value="J">Jurídica</option>
                                    </select>
                                </label>
                            </div>

                            <div className="mt-6 text-right">
                                <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded-md">
                                    Atualizar
                                </button>
                            </div>
                        </form>

                    </div>
                </div>
            )}
        </div>
    );
}
