import React, { useState, useEffect } from 'react';
import { DndContext, useDroppable, useDraggable, DragOverlay } from '@dnd-kit/core';
import { FaPhone, FaHandshake, FaCheckCircle, FaPen } from 'react-icons/fa';
import { IoMdClose } from "react-icons/io";
import Modal from 'react-modal';
import api from '../apiUrl';
import { useAuth } from '../auth/AuthContext';
Modal.setAppElement('#root');

const initialNodes = [
  { id: '1', label: 'Prospecção Inicial', icon: <FaPhone />, column: 'prospeccao' },
  { id: '2', label: 'Engajamento', icon: <FaHandshake />, column: 'engajamento' },
  { id: '3', label: 'Atendimento', icon: <FaCheckCircle />, column: 'atendimento' },
];

const DroppableColumn = ({ id, title, nodes, onDrop, onEditClick }) => {
  const { setNodeRef } = useDroppable({ id });

  const getColumnBgColor = (title) => {
    switch (title) {
      case 'Prospecção': return 'bg-blue-100';
      case 'Engajamento': return 'bg-yellow-100';
      case 'Atendimento': return 'bg-green-100';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div ref={setNodeRef} className={`w-1/3 p-2 rounded ${getColumnBgColor(title)}`}>
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      {nodes.map((node) => (
        <DraggableCard key={node.id} node={node} onEditClick={onEditClick} />
      ))}
    </div>
  );
};

const DraggableCard = ({ node, onEditClick }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: node.id });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners} // Drag em todo o card
      className={`p-2 mb-2 rounded text-white transition-transform transition-shadow duration-200 ease-in-out
        ${isDragging ? 'opacity-70 scale-105 rotate-1 shadow-2xl cursor-grabbing' : 'shadow-md cursor-grab'}
        ${node.label === 'Prospecção Inicial' ? 'bg-blue-500' :
          node.label === 'Engajamento' ? 'bg-yellow-500' :
            'bg-green-500'
        }
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {node.icon} <span>{node.label}</span>
        </div>
        <div className="flex items-center">
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}  // <- O CERTO pra evitar drag no botão
            onClick={(e) => {
              e.stopPropagation();  // <- Garante que só clique
              onEditClick(node);
            }}
            className="ml-2"
          >
            <FaPen className="text-white hover:text-gray-300" />
          </button>
        </div>
      </div>
    </div>
  );
};


const Prospeccao = ({ schema }) => {
  const { user } = useAuth();
  const [activeId, setActiveId] = useState(null);
  const [nodes, setNodes] = useState(initialNodes);
  const [isOpen, setIsOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    ppc_data: '',
    ppc_pessoa: '',
    ppc_email: '',
    ppc_telefone: '',
    ppc_valor_estimado: '',
    ppc_profissional: '',
    ppc_engenheiro: '',
    ppc_email_usuario: '',
    pcd_id: '',
    tpp_id: '',
    epd_id: '',
  });
  const [procedencias, setProcedencias] = useState([]);
  const [empreendimentos, setEmpreendimentos] = useState([]);
  const [tipoProduto, setTipoProduto] = useState([]);
  const [abrirModal, setAbrirModal] = useState(false);

  const openModal = () => {
    setFormData({  // limpa TODOS os campos antes de abrir cadastro
      ppc_data: '',
      ppc_pessoa: '',
      ppc_email: '',
      ppc_telefone: '',
      ppc_valor_estimado: '',
      ppc_profissional: '',
      ppc_engenheiro: '',
      ppc_email_usuario: user.email || '',
      pcd_id: '',
      tpp_id: '',
      epd_id: '',
    });
    setAbrirModal(true);
  };

  const closeModal = () => {
    setAbrirModal(false);
    setFormData({  // limpa form ao fechar modal cadastro
      ppc_data: '',
      ppc_pessoa: '',
      ppc_email: '',
      ppc_telefone: '',
      ppc_valor_estimado: '',
      ppc_profissional: '',
      ppc_engenheiro: '',
      ppc_email_usuario: '',
      pcd_id: '',
      tpp_id: '',
      epd_id: '',
    });
  };


  const handleEditClick = (item) => {
    setSelectedItem(item);
    const itemData = item.data;
    setFormData({
      ppc_id: itemData.ppc_id,
      epd_id: itemData.epd_id,
      ppc_data: itemData.ppc_data,
      ppc_pessoa: itemData.ppc_pessoa,
      ppc_email: itemData.ppc_email,
      ppc_telefone: itemData.ppc_telefone,
      ppc_valor_estimado: formatCurrency(itemData.ppc_valor_estimado),
      ppc_profissional: itemData.ppc_profissional,
      ppc_engenheiro: itemData.ppc_engenheiro,
      ppc_email_usuario: itemData.ppc_email_usuario,
      pcd_id: itemData.pcd_id,
      tpp_id: itemData.tpp_id,
      ppc_data_trabalho: itemData.ppc_data_trabalho,
    });
    setEditModalOpen(true);
  };
  const closeEditModal = () => {
    setEditModalOpen(false);
    setSelectedItem(null);
    setFormData({
      ppc_data: '',
      ppc_pessoa: '',
      ppc_email: '',
      ppc_telefone: '',
      ppc_valor_estimado: '',
      ppc_profissional: '',
      ppc_engenheiro: '',
      ppc_email_usuario: '',
      pcd_id: '',
      tpp_id: '',
      epd_id: '',
    });
  };
  const handleSubmitEdit = async () => {
    if (!formData.ppc_id) {
      console.error('ppc_id não definido!');
      alert('Erro: ID da prospecção não encontrado.');
      return;
    }

    const valorEstimadoRaw = parseFloat(
      formData.ppc_valor_estimado.replace(/[^\d,]/g, '').replace(',', '.')
    );

    const dataToSend = {
      schema: schema,
      ...formData,
      ppc_valor_estimado: isNaN(valorEstimadoRaw) ? null : valorEstimadoRaw
    };

    try {
      const response = await api.put(`/editar-prospeccao/${formData.ppc_id}`, dataToSend);
      console.log(response.data.message);

      setNodes((prevNodes) =>
        prevNodes.map((node) =>
          node.id === formData.ppc_id.toString()
            ? { ...node, label: formData.ppc_pessoa }
            : node
        )
      );

      closeEditModal();
    } catch (error) {
      console.error('Erro ao editar prospecção:', error.response?.data || error.message);
    }
  };




  useEffect(() => {
    if (isOpen) {
      api.get(`/procedencias?schema=${schema}`)
        .then(({ data }) => {
          setProcedencias(data.procedencias || []);
        })
        .catch(err => console.error('Erro ao buscar procedências:', err));

      api.get(`/listar-empreendimentos?schema=${schema}`)
        .then(({ data }) => {
          setEmpreendimentos(data.data || []);
        })
        .catch(err => console.error('Erro ao buscar empreendimentos:', err));

      api.get(`/listar-tipo-produto?schema=${schema}`)
        .then(({ data }) => {
          setTipoProduto(data.data || []);
        })
        .catch(err => console.error('Erro ao buscar Tipo Produto:', err));
    }
  }, [isOpen, schema]);


  const openProspeccao = () => setIsOpen(true);
  const closeProspeccao = () => setIsOpen(false);
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'ppc_valor_estimado') {
      const cleanValue = value.replace(/[^\d]/g, '');
      const number = parseFloat(cleanValue) / 100;
      setFormData((prev) => ({
        ...prev,
        [name]: isNaN(number) ? '' : number.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };


  const formatCurrency = (value) => {
    if (!value) return '';
    const cleanValue = value.toString().replace(/[^\d]/g, '');
    const number = parseFloat(cleanValue) / 100;
    if (isNaN(number)) return '';
    return number.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };




  const handleSubmit = async () => {
    if (!formData.pcd_id || !formData.tpp_id || !formData.epd_id) {
      alert('Por favor, selecione Procedência, Tipo Produto e Empreendimento.');
      return;
    }
    try {
      const response = await api.post('/cadastrar-prospeccao', {
        ...formData,
        ppc_situacao: 'Prospecção',
        schema: schema
      });
      alert('Prospecção cadastrada com sucesso!');
      setAbrirModal(false);
      fetchProspeccoes();

    } catch (error) {
      console.error('❌ Erro ao cadastrar prospecção:', error.response?.data?.error || error.message || error);
      alert(`Erro: ${error.response?.data?.error || 'Erro ao cadastrar prospecção.'}`);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (over && active.id) {
      const newColumn = over.id;
      setNodes((prevNodes) =>
        prevNodes.map((node) =>
          node.id === active.id ? { ...node, column: newColumn } : node
        )
      );

      try {
        const newSituacao = newColumn === 'prospeccao' ? 'Prospecção' :
          newColumn === 'engajamento' ? 'Engajamento' :
            'Atendimento';
        await api.put(`/atualizar-situacao/${active.id}`, {
          ppc_situacao: newSituacao,
          schema: schema,
        });
      } catch (error) {
        console.error('Erro ao atualizar situação:', error.response?.data?.error || error.message || error);
        alert('Erro ao atualizar situação da prospecção.');
      }
    }
  };

  const fetchProspeccoes = async () => {
    try {
      const response = await api.get(`/listar-prospeccao?schema=${schema}`);
      const data = response.data.data;

      const updatedNodes = data.map((item) => ({
        id: item.ppc_id.toString(),
        label: item.ppc_pessoa,
        column: item.ppc_situacao === 'Prospecção' ? 'prospeccao' :
          item.ppc_situacao === 'Engajamento' ? 'engajamento' :
            item.ppc_situacao === 'Atendimento' ? 'atendimento' :
              'prospeccao',
        data: item
      }));
      setNodes(updatedNodes);
    } catch (error) {
      console.error('Erro ao buscar prospecções:', error);
    }
  };


  useEffect(() => {
    fetchProspeccoes();
  }, [schema]);


  return (
    <div>
      <button
        onClick={openProspeccao}
        className="w-72 h-64 bg-gradient-to-br to-gray-300 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-gray-800 font-semibold flex flex-col justify-center items-center text-center overflow-hidden"

      >
        Criar Prospecção
      </button>

      <Modal
        isOpen={isOpen}
        onRequestClose={closeProspeccao}
        contentLabel="Prospecção Modal"
        className="w-full md:w-3/4 lg:w-3/4 p-4 bg-white rounded shadow-lg relative z-[9999]"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[9998]"
      >
        <div className='flex items-center justify-between mb-4'>
          <button
            onClick={openModal}
            className="bg-green-500 px-4 text-white py-2 rounded hover:bg-green-600"
          >
            Cadastrar Prospecção
          </button>

          <button
            onClick={closeProspeccao}
            className="bg-red-500 p-2 text-white text-[18px] hover:bg-red-600 rounded-full"
          >
            <IoMdClose />
          </button>
        </div>

        {/* FORMULÁRIO */}
        {abrirModal && (
          <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-60 z-50">
            <div className="bg-white text-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-4xl border border-gray-300">
              <div className="flex justify-between items-center border-b pb-4 mb-6">
                <h2 className="text-2xl font-bold">Cadastrar Prospecção</h2>
                <button
                  onClick={closeModal}
                  className="bg-red-500 p-3 text-[17px] rounded-full text-white transition"
                >
                  <IoMdClose />
                </button>
              </div>

              <form
                onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
                className="grid grid-cols-1 md:grid-cols-1 gap-6"
              >

                <div className="flex gap-4">
                  <div className="w-1/3">
                    <label className="block text-sm font-medium mb-1">Pessoa:</label>
                    <input
                      type="text"
                      value={formData.pessoa || ''}
                      onChange={(e) => setFormData({ ...formData, pessoa: e.target.value })}
                      className="border rounded-md px-3 py-2 w-full"
                    />
                  </div>

                  <div className="w-1/3">
                    <label className="block text-sm font-medium mb-1">Procedência:</label>
                    <select
                      value={formData.pcd_id || ''}
                      onChange={(e) => setFormData({ ...formData, pcd_id: parseInt(e.target.value) })}
                      className="border rounded-md px-3 py-2 w-full"
                    >
                      <option value="">Selecione</option>
                      {procedencias.map((item) => (
                        <option key={item.pcd_id} value={item.pcd_id}>
                          {item.pcd_procedencia}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-1/3">
                    <label className="block text-sm font-medium mb-1">Data:</label>
                    <input
                      type="date"
                      value={formData.data || ''}
                      onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                      className="border rounded-md px-3 py-2 w-full"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-1/3">
                    <label className="block text-sm font-medium mb-1">E-mail:</label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="border rounded-md px-3 py-2 w-full"
                    />
                  </div>

                  <div className="w-1/3">
                    <label className="block text-sm font-medium mb-1">Telefone:</label>
                    <input
                      type="text"
                      value={formData.telefone || ''}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      className="border rounded-md px-3 py-2 w-full"
                    />
                  </div>

                  <div className="w-1/3">
                    <label className="block text-sm font-medium mb-1">E-mail Usuário:</label>
                    <input
                      type="email"
                      name="ppc_email_usuario"
                      value={formData.ppc_email_usuario || ''}
                      readOnly
                      className="border rounded-md px-3 py-2 w-full  cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-1/3">
                    <label className="block text-sm font-medium mb-1">Tipo Produto:</label>
                    <select
                      name="tpp_id"
                      value={formData.tpp_id}
                      onChange={handleInputChange}
                      className="border rounded-md px-3 py-2 w-full"
                    >
                      <option value="">Selecione</option>
                      {tipoProduto.map((item) => (
                        <option key={item.tpp_id} value={item.tpp_id}>
                          {item.tpp_descricao}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-1/3">
                    <label className="block text-sm font-medium mb-1">Valor Estimado:</label>
                    <input
                      type="text"
                      name="ppc_valor_estimado"
                      value={formData.ppc_valor_estimado}
                      onChange={handleInputChange}
                      className="border rounded px-2 py-1 w-full"
                    />
                  </div>
                  <div className="w-1/3">
                    <label className="block text-sm font-medium mb-1">Data Trabalho:</label>
                    <input
                      type="date"
                      value={formData.data_trabalho || ''}
                      onChange={(e) => setFormData({ ...formData, data_trabalho: e.target.value })}
                      className="border rounded-md px-3 py-2 w-full"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="block text-sm font-medium mb-1">Profissional:</label>
                    <input
                      type="text"
                      value={formData.profissional || ''}
                      onChange={(e) => setFormData({ ...formData, profissional: e.target.value })}
                      className="border rounded-md px-3 py-2 w-full"
                    />
                  </div>

                  <div className="w-1/2">
                    <label className="block text-sm font-medium mb-1">Engenheiro:</label>
                    <input
                      type="text"
                      value={formData.engenheiro || ''}
                      onChange={(e) => setFormData({ ...formData, engenheiro: e.target.value })}
                      className="border rounded-md px-3 py-2 w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Empreendimento:</label>
                  <select
                    value={formData.epd_id || ''}
                    onChange={(e) => setFormData({ ...formData, epd_id: parseInt(e.target.value) })}
                    className="border rounded-md px-3 py-2 w-full"
                  >
                    <option value="">Selecione</option>
                    {empreendimentos.map((item) => (
                      <option key={item.epd_id} value={item.epd_id}>
                        {item.epd_nome}
                      </option>
                    ))}
                  </select>
                </div>


              </form>

              <div className="flex justify-end mt-8 space-x-4 border-t pt-6">
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}





        {/* KANBAN PROSPECCAO */}
        <div className="flex h-[50vh]">
          <div className="flex-1 p-4">
            <DndContext
              onDragStart={(event) => setActiveId(event.active.id)}
              onDragEnd={(event) => {
                handleDragEnd(event);
                setActiveId(null);
              }}
              onDragCancel={() => setActiveId(null)}
            >
              <div className="flex gap-4 mt-4">
                <DroppableColumn
                  id="prospeccao"
                  title="Prospecção"
                  nodes={nodes.filter(node => node.column === 'prospeccao')}
                  onDrop={handleDragEnd}
                  onEditClick={handleEditClick}
                />
                <DroppableColumn
                  id="engajamento"
                  title="Engajamento"
                  nodes={nodes.filter(node => node.column === 'engajamento')}
                  onDrop={handleDragEnd}
                  onEditClick={handleEditClick}
                />
                <DroppableColumn
                  id="atendimento"
                  title="Atendimento"
                  nodes={nodes.filter(node => node.column === 'atendimento')}
                  onDrop={handleDragEnd}
                  onEditClick={handleEditClick}
                />
              </div>

              <DragOverlay>
                {activeId ? (
                  <DraggableCard node={nodes.find((n) => n.id === activeId)} />
                ) : null}
              </DragOverlay>
            </DndContext>

          </div>
        </div>
      </Modal >


      <Modal
        isOpen={editModalOpen}
        onRequestClose={closeEditModal}
        contentLabel="Editar Prospecção"
        className="w-full md:w-3/4 lg:w-3/4 p-6 bg-white rounded-xl shadow-xl relative z-[9999]"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[9998]"
      >
        <h2 className="text-2xl font-semibold mb-6">Editar Prospecção</h2>

        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col flex-1 min-w-[200px]">
              <label htmlFor="ppc_pessoa" className="mb-1 font-medium">Pessoa</label>
              <input type="text" id="ppc_pessoa" name="ppc_pessoa" value={formData.ppc_pessoa} onChange={handleInputChange} className="border rounded p-3 w-full" />
            </div>

            <div className="flex flex-col flex-1 min-w-[200px]">
              <label htmlFor="ppc_data" className="mb-1 font-medium">Data de Trabalho</label>
              <input type="date" id="ppc_data" name="ppc_data" value={formData.ppc_data} onChange={handleInputChange} className="border rounded p-3 w-full" />
            </div>

            <div className="flex flex-col flex-1 min-w-[200px]">
              <label htmlFor="epd_id" className="mb-1 font-medium">Procedência</label>
              <select
                id="epd_id"
                name="epd_id"
                value={formData.epd_id}
                onChange={handleInputChange}
                className="border rounded p-3 w-full"
              >
                <option value="">Selecione uma Procedência</option>
                {procedencias.map((proc) => (
                  <option key={proc.epd_id} value={proc.epd_id}>
                    {proc.pcd_procedencia}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col flex-1 min-w-[200px]">
              <label htmlFor="ppc_email" className="mb-1 font-medium">Email</label>
              <input type="text" id="ppc_email" name="ppc_email" value={formData.ppc_email} onChange={handleInputChange} className="border rounded p-3 w-full" />
            </div>

            <div className="flex flex-col flex-1 min-w-[200px]">
              <label htmlFor="ppc_telefone" className="mb-1 font-medium">Telefone</label>
              <input type="text" id="ppc_telefone" name="ppc_telefone" value={formData.ppc_telefone} onChange={handleInputChange} className="border rounded p-3 w-full" />
            </div>

            <div className="flex flex-col flex-1 min-w-[200px]">
              <label htmlFor="ppc_email_usuario" className="mb-1 font-medium">Email do Usuário</label>
              <input type="email" id="ppc_email_usuario" name="ppc_email_usuario" value={formData.ppc_email_usuario} onChange={handleInputChange} className="border rounded p-3 w-full" />
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col flex-1 min-w-[200px]">
              <label htmlFor="ppc_valor_estimado" className="mb-1 font-medium">Valor Estimado</label>
              <input
                type="text"
                name="ppc_valor_estimado"
                value={formData.ppc_valor_estimado}
                onChange={handleInputChange}
                placeholder="Digite valores separados (;)"
                className="border p-3 rounded w-full"
              />
            </div>

            <div className="flex flex-col flex-1 min-w-[200px]">
              <label htmlFor="ppc_data_trabalho" className="mb-1 font-medium">Data de Trabalho</label>
              <input type="date" id="ppc_data_trabalho" name="ppc_data_trabalho" value={formData.ppc_data_trabalho} onChange={handleInputChange} className="border rounded p-3 w-full" />
            </div>

            <div className="flex flex-col flex-1 min-w-[200px]">
              <label htmlFor="tpp_id" className="mb-1 font-medium">Procedência</label>
              <select
                id="tpp_id"
                name="tpp_id"
                value={formData.tpp_id}
                onChange={handleInputChange}
                className="border rounded p-3 w-full"
              >
                <option value="">Selecione uma Procedência</option>
                {tipoProduto.map((proc) => (
                  <option key={proc.tpp_id} value={proc.tpp_id}>
                    {proc.tpp_descricao}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col flex-1 min-w-[200px]">
              <label htmlFor="ppc_profissional" className="mb-1 font-medium">Profissional</label>
              <input type="text" id="ppc_profissional" name="ppc_profissional" value={formData.ppc_profissional} onChange={handleInputChange} className="border rounded p-3 w-full" />
            </div>

            <div className="flex flex-col flex-1 min-w-[200px]">
              <label htmlFor="ppc_engenheiro" className="mb-1 font-medium">Engenheiro</label>
              <input type="text" id="ppc_engenheiro" name="ppc_engenheiro" value={formData.ppc_engenheiro} onChange={handleInputChange} className="border rounded p-3 w-full" />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <button onClick={handleSubmitEdit} className="bg-green-500 text-white px-5 py-2 rounded-lg hover:bg-green-600">Salvar</button>
          <button onClick={closeEditModal} className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600">Cancelar</button>
        </div>
      </Modal>

    </div >
  );
};

export default Prospeccao;
