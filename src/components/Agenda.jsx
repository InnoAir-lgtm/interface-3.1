import React, { useState } from 'react';
import { SlCalender } from "react-icons/sl";
import { Calendar } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';

export default function Agenda() {
    const [openModal, setOpenModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [events, setEvents] = useState({});
    const [newEvent, setNewEvent] = useState('');
    const [eventTime, setEventTime] = useState('');

    const abrirModal = () => setOpenModal(true);
    const fecharModal = () => setOpenModal(false);

    const addEvent = () => {
        if (!newEvent || !eventTime) return;
        const dateKey = selectedDate.toDateString();
        setEvents(prevEvents => ({
            ...prevEvents,
            [dateKey]: [...(prevEvents[dateKey] || []), { time: eventTime, event: newEvent }]
        }));
        setNewEvent('');
        setEventTime('');
    };

    return (
        <div className="flex flex-col items-center">
            <button
                onClick={abrirModal}
                className="w-72 h-64 bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg hover:shadow-2xl hover:bg-gradient-to-br hover:from-green-200 hover:to-white transition-all duration-300 text-gray-800 font-semibold flex justify-center items-center text-center relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-green-500 opacity-10 hover:opacity-20 transition-opacity duration-300 rounded-xl"></div>
                <div className="relative flex flex-col items-center justify-center space-y-4 w-full h-full">
                    <SlCalender className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 text-3xl transition transform hover:scale-110" />
                    <span className="font-medium text-xl transition transform hover:scale-105 hover:text-gray-600">
                        Agenda
                    </span>
                </div>
            </button>

            {openModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-xl shadow-xl w-11/12 max-w-md transition-all duration-300">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">Agenda</h2>
                            <button
                                className="bg-red-500 text-white py-1 px-3 rounded-full hover:bg-red-600 transition"
                                onClick={fecharModal}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-2 rounded-lg border shadow-sm bg-gray-50">
                            <Calendar
                                compact
                                bordered
                                value={selectedDate}
                                onChange={(date) => setSelectedDate(date)}
                            />
                        </div>

                        <div className="mt-4">
                            <span className="text-gray-700 font-medium">Adicionar Evento:</span>
                            <input
                                type="text"
                                placeholder="Descrição"
                                value={newEvent}
                                onChange={(e) => setNewEvent(e.target.value)}
                                className="w-full p-2 border rounded mt-2 focus:ring-2 focus:ring-green-400"
                            />
                            <input
                                type="time"
                                value={eventTime}
                                onChange={(e) => setEventTime(e.target.value)}
                                className="w-full p-2 border rounded mt-2 focus:ring-2 focus:ring-green-400"
                            />
                            <button
                                onClick={addEvent}
                                className="w-full mt-2 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition font-semibold"
                            >
                                Adicionar
                            </button>
                        </div>

                        <div className="mt-4 text-center">
                            <span className="text-gray-700 font-medium">Eventos para {selectedDate.toLocaleDateString()}:</span>
                            <ul className="mt-2 text-gray-700 bg-gray-100 p-2 rounded-lg max-h-40 overflow-y-auto">
                                {(events[selectedDate.toDateString()] || []).map((ev, index) => (
                                    <li key={index} className="mt-1 text-sm bg-white p-2 rounded-lg shadow-sm flex justify-between items-center">
                                        <span className="font-bold text-green-600">{ev.time}</span> 
                                        <span>{ev.event}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
