import React, { useState, useEffect } from 'react';
import { DndContext, useDroppable, useDraggable, DragOverlay } from '@dnd-kit/core';
import { FaPhone, FaHandshake, FaCheckCircle, FaPen } from 'react-icons/fa';
import { IoMdClose } from "react-icons/io";
import Modal from 'react-modal';
import api from '../apiUrl';
import Prospect from '../assets/prospect.png';


Modal.setAppElement('#root');

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
            {...listeners}
            className={`p-2 mb-2 rounded text-white transition-transform transition-shadow duration-200 ease-in-out
        ${isDragging ? 'opacity-70 scale-105 rotate-1 shadow-2xl cursor-grabbing' : 'shadow-md cursor-grab'}
        ${node.column === 'prospeccao' ? 'bg-blue-500' :
                    node.column === 'engajamento' ? 'bg-yellow-500' :
                        'bg-green-500'
                }
      `}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {node.icon} <span>{node.label}</span>
                </div>
                <button
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                        e.stopPropagation();
                        onEditClick(node);
                    }}
                    className="ml-2"
                >
                    <FaPen className="text-white hover:text-gray-300" />
                </button>
            </div>
        </div>
    );
};

const AtendimenteoKanban = ({ schema }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeId, setActiveId] = useState(null);
    const [nodes, setNodes] = useState([
        { id: '1', label: 'Cliente X', icon: <FaPhone />, column: 'prospeccao' },
        { id: '2', label: 'Cliente Y', icon: <FaHandshake />, column: 'engajamento' },
        { id: '3', label: 'Cliente Z', icon: <FaCheckCircle />, column: 'atendimento' },
    ]);

    useEffect(() => {
        const fetchAtendimentos = async () => {
            try {
                const response = await api.get(`/atendimentos?schema=${schema}`);
                const data = response.data;

                const mapped = data.map((item) => ({
                    id: String(item.atd_id),
                    label: item.atd_situacao,
                    icon: <FaPhone />,
                    column: 'prospeccao'
                }));

                setNodes(mapped);
            } catch (error) {
                console.error('Erro ao buscar atendimentos:', error);
            }
        };

        fetchAtendimentos();
    }, [schema]);


    const openProspeccao = () => setIsOpen(true);
    const closeProspeccao = () => setIsOpen(false);

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over?.id && over?.id) {
            setNodes((prev) =>
                prev.map((node) =>
                    node.id === active.id ? { ...node, column: over.id } : node
                )
            );
        }
    };

    const handleEditClick = (node) => {
        console.log('Editar node:', node);
    };

    return (
        <div>
            <button
                onClick={openProspeccao}
                className="w-72 h-64 bg-gradient-to-br to-gray-300 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-gray-800 font-semibold flex flex-col justify-center items-center text-center overflow-hidden"
            >
                <img src={Prospect} alt="icone-prospec" className="w-24 h-24 mb-2" />
                Atendimento Kanban
            </button>

            <Modal
                isOpen={isOpen}
                onRequestClose={closeProspeccao}
                contentLabel="Prospecção Modal"
                className="w-full md:w-3/4 lg:w-3/4 p-4 bg-white rounded shadow-lg relative z-[9999]"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[9998]"
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Kanban de Atendimento</h2>
                    <button onClick={closeProspeccao}>
                        <IoMdClose className="text-2xl" />
                    </button>
                </div>

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
                                    onEditClick={handleEditClick}
                                />
                                <DroppableColumn
                                    id="engajamento"
                                    title="Engajamento"
                                    nodes={nodes.filter(node => node.column === 'engajamento')}
                                    onEditClick={handleEditClick}
                                />
                                <DroppableColumn
                                    id="atendimento"
                                    title="Atendimento"
                                    nodes={nodes.filter(node => node.column === 'atendimento')}
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
            </Modal>
        </div>
    );
};

export default AtendimenteoKanban;
