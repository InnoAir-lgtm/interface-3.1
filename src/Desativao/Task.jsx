import React, { useState } from 'react';

export default function Task() {
    const [openModal, setOpenModal] = useState(false);

    const handleModalToggle = () => {
        setOpenModal(!openModal);
    };

    return (
        <div className="p-4">
            <div>
                <button
                    onClick={handleModalToggle}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Tasks
                </button>
            </div>

            {openModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 shadow-lg w-80">
                        <h1 className="text-lg font-bold mb-4">Teste</h1>
                        <p className="text-gray-600">Conteúdo da modal.</p>
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={handleModalToggle}
                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
