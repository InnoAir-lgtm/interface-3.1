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
                className="flex justify-center items-center gap-2 bg-red-500 py-2 px-4 shadow-lg hover:bg-green-600 transition duration-200 text-white rounded-md w-full sm:w-auto"
                onClick={abrirModal}
            >
                <SlCalender className="text-xl" />
                Agenda
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
