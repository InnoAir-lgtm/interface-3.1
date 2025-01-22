import React, { useState } from 'react'
import { SlCalender } from "react-icons/sl";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function Agenda() {
    const [openModal, setOpenModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());

    const abrirModal = () => {
        setOpenModal(true)
    }
    const fecharModal = () => {
        setOpenModal(false)
    }

    return (
        <div>
            <button
                onClick={abrirModal}
                className="flex-1  w-72 h-64 bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-lg hover:shadow-2xl hover:bg-gradient-to-br hover:from-green-100 hover:to-white transition-all duration-300 text-gray-800 font-semibold flex justify-center items-center text-center relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-green-500 opacity-10 hover:opacity-20 transition-opacity duration-300 rounded-lg"></div>
                <div className="relative flex flex-col items-center justify-center space-y-4 w-full h-full">
                    <SlCalender className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 text-2xl transition transform hover:scale-110" />

                    <span className="font-medium text-lg transition transform hover:scale-105 hover:text-gray-600">
                        Agenda
                    </span>
                </div>
            </button>


            {openModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-11/12 max-w-sm transition-all duration-300">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-800">Agenda</h2>
                            <button
                                className="bg-red-500 text-white py-1 px-3 rounded-lg hover:bg-red-600 transition"
                                onClick={fecharModal}>
                                X
                            </button>
                        </div>

                        <DatePicker
                            selected={selectedDate}
                            onChange={(date) => setSelectedDate(date)}
                            inline
                            className="rounded-lg"
                        />

                        <div className="mt-4 text-center">
                            <span className="text-gray-700 font-medium">Data Selecionada:</span>
                            <p className="text-green-600 font-bold mt-1">
                                {selectedDate.toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>

    )
}
