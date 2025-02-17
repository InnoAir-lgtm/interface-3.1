import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import { SlCalender } from "react-icons/sl";
import { FaTrash } from "react-icons/fa";
import "../style/calendarStyles.css";
import "moment/locale/pt-br";
import api from "../apiUrl";

export default function GoogleCalendarClone({ schema }) {
    const [openModal, setOpenModal] = useState(false);
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedPersonId, setSelectedPersonId] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [newEvent, setNewEvent] = useState({
        title: "",
        description: "",
        start: new Date(),
        end: new Date(),
        status: "agendado",
        type: "", person: "",
    });
    const [filterType, setFilterType] = useState("");
    const [people, setPeople] = useState([]);
    const [filteredPeople, setFilteredPeople] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const localizer = momentLocalizer(moment);
    const DnDCalendar = withDragAndDrop(Calendar);
    const abrirModal = () => setOpenModal(true);
    const fecharModal = () => setOpenModal(false);
    const statusColors = { agendado: "#3182ce", confirmado: "#38a169", cancelado: "#e53e3e", pendente: "#f6ad55" };

    const buscarEnderecos = async (pes_id) => {
        try {
            const response = await api.get(`/listar-endereco?pes_id=${pes_id}&schema=${schema}`);
            if (Array.isArray(response.data.data)) {
                setAddresses(response.data.data);
            } else {
                console.error("Dados de endereços inválidos:", response.data.data);
            }
        } catch (error) {
            console.error("Erro ao buscar endereços:", error);
        }
    };


    useEffect(() => {
        if (newEvent.pes_destino) {
            buscarEnderecos(newEvent.pes_destino);
        } else {
            setAddresses([]);
        }
    }, [newEvent.pes_destino, schema]);


    const handleSelectAddress = (e) => {
        const addressId = e.target.value;
        const address = addresses.find(addr => String(addr.epe_id) === String(addressId));
        if (!address) {
            console.error("Endereço não encontrado!");
            return;
        }

        setSelectedAddress(address);

        setNewEvent(prevEvent => ({
            ...prevEvent,
            evt_local: `${address.epe_complemento}, Nº ${address.epe_numero} - ${address.epe_tipo}, - CEP: ${address.end_cep}`,
            epe_latitude: address.epe_latitude,
            epe_longitude: address.epe_longitude
        }));

        console.log("Novo evento atualizado:", newEvent);
    };

    useEffect(() => {
        if (people.length > 0) {
            if (filterType) {
                setFilteredPeople(people.filter(person => person.type === filterType));
            } else {
                setFilteredPeople(people);
            }
        }
    }, [filterType, people]);

    useEffect(() => {
        async function encontrarPessoas() {
            try {
                const response = await api.get(`/pessoas?schema=${schema}`);
                console.log("Resposta da API de pessoas:", response.data);
                if (Array.isArray(response.data.data)) {
                    setPeople(response.data.data);
                } else {
                    console.error("Dados recebidos não são um array:", response.data.data);
                }
            } catch (error) {
                console.error("Erro ao buscar pessoas:", error);
            }
        }
        encontrarPessoas();
    }, [schema]);

    const handleSelectSlot = ({ start, end }) => {
        if (start < new Date()) {
            alert("Não é possível agendar eventos em datas passadas.");
            return;
        }
        if (!selectedPersonId) {
            alert("Selecione um técnico antes de marcar um evento.");
            return;
        }
        setNewEvent((prev) => ({
            title: "",
            description: "",
            date: moment(start).format("YYYY-MM-DD"),
            startTime: moment(start).format("HH:mm"),
            endTime: moment(end).format("HH:mm"),
            status: "agendado",
            evt_local: "",
            pes_destino: "",
            pes_evento: selectedPersonId,
            epe_latitude: null,
            epe_longitude: null,
        }));
        setModalOpen(true);
    };
    useEffect(() => {
        async function fetchEvents() {
            if (!selectedPersonId) {
                setEvents([]);
                return;
            }
            try {
                const endpoint = `/eventos?schema=${schema}&pes_evento=${selectedPersonId}`;
                const response = await api.get(endpoint);
                const eventData = response.data.data;

                if (Array.isArray(eventData)) {
                    const loadedEvents = eventData.map(event => ({
                        id: event.evt_id,
                        start: new Date(`${event.evt_evento}T${event.evt_inicio}`),
                        end: new Date(`${event.evt_evento}T${event.evt_fim}`),
                        title: event.evt_titulo || "Sem título",
                        description: event.evt_descricao || "Sem descrição",
                        evt_local: event.evt_local || "Local não informado",
                        pes_destino: event.pes_destino || "Cliente não informado",
                        epe_latitude: event.epe_latitude || null,
                        epe_longitude: event.epe_longitude || null,
                        status: event.evt_status,
                        color: statusColors[event.status],
                    }));
                    setEvents(loadedEvents);
                } else {
                    console.error("Formato de eventos inválido:", response.data);
                }
            } catch (error) {
                console.error("Erro ao buscar eventos:", error);
            }
        }
        fetchEvents();
    }, [selectedPersonId, schema]);

    const handleSaveEvent = async () => {
        if (!newEvent.title || !newEvent.date || !newEvent.startTime || !newEvent.endTime) {
            alert("Todos os campos são obrigatórios.");
            return;
        }
        const startDateTime = `${newEvent.date}T${newEvent.startTime}:00`;
        const endDateTime = `${newEvent.date}T${newEvent.endTime}:00`;
        const formattedEvent = {
            evt_titulo: newEvent.title,
            evt_descricao: newEvent.description,
            evt_evento: newEvent.date,
            evt_inicio: newEvent.startTime + ":00",
            evt_fim: newEvent.endTime + ":00",
            evt_status: newEvent.status,
            evt_local: newEvent.evt_local || "",
            evt_lat: newEvent.epe_latitude || null,
            evt_log: newEvent.epe_longitude || null,
            pes_evento: newEvent.pes_evento,
            pes_destino: newEvent.pes_destino,
            schema
        };
        try {
            const response = await api.post(`/eventos?schema=${schema}`, formattedEvent);
            if (response.status === 201) {
                const savedEvent = {
                    ...formattedEvent,
                    start: new Date(startDateTime),
                    end: new Date(endDateTime),
                    color: statusColors[newEvent.status],
                    id: response.data.id,
                };
                setEvents(prevEvents => [...prevEvents, savedEvent]);
                setModalOpen(false);
                fetchEvents();
                setSelectedEvent(null);
            } else {
                console.error("Erro ao salvar evento:", response.data);
            }
        } catch (error) {
            console.error("Erro ao conectar com o backend:", error);
        }
    };

    const handleEventClick = (event) => {
        if (event) {
            console.log("Evento selecionado:", event);
            setNewEvent({
                title: event.title || "Sem título",
                description: event.description || "Sem descrição",
                date: moment(event.start).format("YYYY-MM-DD"),
                startTime: moment(event.start).format("HH:mm"),
                endTime: moment(event.end).format("HH:mm"),
                status: event.status,
                evt_local: event.evt_local || "Local não informado",
                pes_destino: event.pes_destino || "Cliente não informado",
                epe_latitude: event.epe_latitude || "",
                epe_longitude: event.epe_longitude || "",
                pes_evento: event.pes_evento || newEvent.pes_evento,
            });
            setSelectedPersonId(event.pes_evento || selectedPersonId);
            setTimeout(() => setModalOpen(true), 100);
        }
    };

    const handleSelectPerson = (e, type) => {
        const personId = e.target.value;
        if (type === "cliente") {
            setNewEvent(prevEvent => ({ ...prevEvent, pes_destino: personId }));
        } else if (type === "tecnico") {
            setNewEvent(prevEvent => ({ ...prevEvent, pes_evento: personId }));
            setSelectedPersonId(personId);
        }
    };
    const handleDeleteEvent = async (eventId) => {
        if (window.confirm("Deseja deletar este evento?")) {
            try {
                const response = await api.delete(`/deletar-evento?evt_id=${eventId}&schema=${schema}`);
                console.log("Resposta do servidor:", response);
                if (response.status === 200) {
                    alert("Evento deletado com sucesso!");
                    setEvents(prevEvents => prevEvents.filter(evt => evt.evt_id !== eventId));
                    setModalOpen(false);
                } else {
                    console.error("Erro ao deletar evento:", response.data);
                }
            } catch (error) {
                console.error("Erro ao conectar com o backend:", error);
            }
        }
    };


    const onEventResize = ({ event, start, end }) => {
        setEvents(prevEvents => prevEvents.map(evt =>
            evt.id === event.id ? { ...event, start, end } : evt
        ));
    };

    return (
        <div className="flex flex-col items-center">
            <button
                onClick={abrirModal}
                className="w-72 h-64 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 text-gray-800 font-semibold flex justify-center items-center text-center relative overflow-hidden border border-gray-300"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-50 opacity-30"></div>
                <div className="relative flex flex-col items-center justify-center space-y-4 w-full h-full">
                    <SlCalender className="text-blue-600 text-5xl transition transform hover:scale-110" />
                    <span className="font-medium text-xl text-gray-700">Abrir Agenda</span>
                </div>
            </button>

            {openModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-5xl relative">
                        <select
                            value={newEvent.pes_evento || ""}
                            onChange={(e) => handleSelectPerson(e, "tecnico")}
                            className="border p-2 rounded"
                        >
                            <option value="">Selecione um técnico</option>
                            {people.map(person => (
                                <option key={person.pes_id} value={person.pes_id}>
                                    {person.pes_nome}
                                </option>
                            ))}
                        </select>

                        <button
                            className="absolute top-4 right-4 bg-red-500 text-white py-1 px-3 rounded-full hover:bg-red-600 transition"
                            onClick={fecharModal}
                        >
                            ✕
                        </button>

                        <DnDCalendar
                            localizer={localizer}
                            events={events}
                            selectable
                            onSelectSlot={handleSelectSlot}
                            onSelectEvent={handleEventClick}
                            startAccessor="start"
                            endAccessor="end"
                            style={{ height: 600 }}
                            className="rbc-calendar"
                            eventPropGetter={(event) => ({
                                style: {
                                    backgroundColor: event.color,
                                    color: "white",
                                    borderRadius: "5px",
                                    padding: "2px",
                                    border: "none",
                                    fontWeight: "normal",
                                    fontSize: "14px",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                },

                            })}
                            resizable
                            onEventResize={onEventResize}
                            draggableAccessor={() => true}

                        />
                    </div>
                </div>
            )}

            {modalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <div>
                            <button
                                onClick={() => setModalOpen(false)}
                                className=" bg-red-500 text-white py-1 px-3 rounded-full hover:bg-red-600 transition"
                            >
                                X
                            </button>
                        </div>

                        <h2 className="text-xl font-semibold text-gray-700">
                            {selectedEvent ? "Editar Evento" : "Adicionar Evento"}
                        </h2>

                        <select
                            value={newEvent.pes_destino || ""}
                            onChange={(e) => handleSelectPerson(e, "cliente")}
                            className="border p-2 rounded"
                        >
                            <option value="">Selecione um Cliente</option>
                            {people.map(person => (
                                <option key={person.pes_id} value={person.pes_id}>
                                    {person.pes_nome}
                                </option>
                            ))}
                        </select>

                        <select
                            value={selectedAddress ? selectedAddress.epe_id : ""}
                            onChange={handleSelectAddress}
                            className="w-full p-2 border rounded mt-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Selecione um endereço</option>
                            {addresses.length > 0 && addresses.map(address => (
                                <option key={address.epe_id} value={address.epe_id}>
                                    {address.epe_complemento}
                                </option>
                            ))}
                        </select>

                        {/* Titulo */}
                        <input
                            type="text"
                            placeholder="Título do evento"
                            value={newEvent.title}
                            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                            className="w-full p-2 border rounded mt-3"
                        />

                        <textarea
                            placeholder="Descrição do evento"
                            value={newEvent.description}
                            onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                            className="w-full p-2 border rounded mt-3"
                        />

                        {/* Local */}
                        <textarea
                            placeholder="Local"
                            className="w-full p-2 border rounded mt-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={newEvent.evt_local}
                            onChange={(e) => setNewEvent({ ...newEvent, evt_local: e.target.value })}
                        />

                        {/* Latitude */}
                        <div className="flex space-x-2 mt-3">
                            <input
                                placeholder="Latitude"
                                type="text"
                                className="w-1/2 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={selectedAddress ? selectedAddress.epe_latitude : ""}
                                onChange={(e) => setNewEvent({ ...newEvent, epe_latitude: e.target.value })}
                                readOnly
                            />

                            {/* Longitude */}
                            <input
                                placeholder="Longitude"
                                type="text"
                                className="w-1/2 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={selectedAddress ? selectedAddress.epe_longitude : ""}
                                onChange={(e) => setNewEvent({ ...newEvent, epe_longitude: e.target.value })}
                                readOnly
                            />
                        </div>

                        {/* Hora de Inicio */}
                        <div className="flex space-x-2 mt-3">
                            <input
                                type="date"
                                value={newEvent.date}
                                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                                className="border p-2 rounded"
                            />

                            <input
                                type="time"
                                value={newEvent.startTime}
                                onChange={(e) => setNewEvent(prev => ({
                                    ...prev,
                                    startTime: e.target.value
                                }))}
                            />
                            <input
                                type="time"
                                value={newEvent.endTime}
                                onChange={(e) => setNewEvent(prev => ({
                                    ...prev,
                                    endTime: e.target.value
                                }))}
                            />
                        </div>



                        {/* Status */}
                        <select
                            value={newEvent.status}
                            onChange={(e) => setNewEvent({ ...newEvent, status: e.target.value })}
                            className="w-full p-2 border rounded mt-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="agendado">Agendado</option>
                            <option value="confirmado">Confirmado</option>
                            <option value="cancelado">Cancelado</option>
                            <option value="pendente">Pendente</option>
                        </select>


                        {selectedPersonId && (
                            <div className="mt-2 text-gray-600">
                                <strong>ID da pessoa selecionada:</strong> {selectedPersonId}
                            </div>
                        )}


                        {newEvent.personName && (
                            <div className="mt-2 text-gray-600">
                                <strong>Nome da pessoa associada:</strong> {newEvent.pes_nome}
                            </div>
                        )}
                        <div className="flex justify-between items-center mt-4">
                            {/* <button
                                onClick={() => {
                                    if (selectedEvent && selectedEvent.evt_id) {
                                        handleDeleteEvent(selectedEvent.evt_id);
                                    } else {
                                        console.error("Evento não selecionado ou sem ID.");
                                    }
                                }}
                                className="bg-red-500 text-white py-1 px-3 rounded-full hover:bg-red-600 transition"
                            >
                                Deletar Evento
                            </button> */}

                            <button
                                onClick={handleSaveEvent}
                                className="bg-blue-500 text-white py-1 px-3 rounded-full hover:bg-blue-600 transition"
                            >
                                Salvar Evento
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
