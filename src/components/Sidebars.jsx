import React, { useState } from 'react';
import { FaHome, FaRegBell } from 'react-icons/fa';
import { SlCalender } from "react-icons/sl";
import Agenda from './Agenda';

export default function Sidebars() {
  const [activeComponent, setActiveComponent] = useState('inicio');

  const renderComponent = () => {
    switch (activeComponent) {
      case 'agenda':
        return <Agenda />;
      // Adicione outros casos conforme necessário
      default:
        return <div>Conteúdo Início</div>; // O conteúdo inicial pode ser um outro componente ou mensagem
    }
  };

  const menuItems = [
    { icon: <FaHome />, label: 'Início', target: 'inicio' },
    { icon: <SlCalender />, label: 'Agenda', target: 'agenda' },
    { icon: <FaRegBell />, label: 'Notificações', target: 'notificacoes' },
  ];

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="bg-gray-800 text-white h-80 w-14 rounded-full flex flex-col items-center p-3 transition-all duration-500">
        <div className="flex-1 flex flex-col gap-6 mt-4">
          {menuItems.map((item, index) => (
            <div
              key={index}
              className="group flex items-center w-full gap-4 p-2 cursor-pointer hover:bg-gray-700 rounded-md"
              title={item.label}
              onClick={() => setActiveComponent(item.target)}
            >
              <div className="text-lg">{item.icon}</div>
              <span className="hidden group-hover:block absolute left-20 bg-gray-700 text-white px-2 py-1 rounded-md shadow-lg">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

     
    </div>
  );
}
