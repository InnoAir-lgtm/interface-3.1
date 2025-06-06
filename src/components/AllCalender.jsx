import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import { SlCalender } from "react-icons/sl";
import "../style/calendarStyles.css";
import "moment/locale/pt-br";
import api from "../apiUrl";
import calender from "../assets/calendar.png";

export default function Agenda({ schema }) {
    const [openModal, setOpenModal] = useState(false);
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedPersonId, setSelectedPersonId] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [newEvent, setNewEvent] = useState({ title: "", description: "", start: new Date(), end: new Date(), status: "agendado", type: "", person: "", });
    const [people, setPeople] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const localizer = momentLocalizer(moment);
    const DnDCalendar = withDragAndDrop(Calendar);
    const abrirModal = () => setOpenModal(true);
    const fecharModal = () => setOpenModal(false);
    const statusColors = { agendado: "#3B82F6", confirmado: "#10B981", cancelado: "#DC2626", pendente: "#F59E0B", concluido: "#8B5CF6" };
    moment.locale("pt-br");
    const messages = {
        allDay: "Dia inteiro",
        previous: "Anterior",
        next: "Próximo",
        today: "Hoje",
        month: "Mês",
        week: "Semana",
        day: "Dia",
        agenda: "Agenda",
        date: "Data",
        time: "Hora",
        event: "Evento",
        noEventsInRange: "Nenhum evento neste período.",
        showMore: (total) => `+ Ver mais (${total})`,
    };
    const [filteredTechnicians, setFilteredTechnicians] = useState([]);
    const [filteredClients, setFilteredClients] = useState([]);

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
    };


    useEffect(() => {
        if (people.length > 0) {
            const filteredTechnicians = people.filter(person => person.types.includes('tecnico'));
            const filteredClients = people.filter(person => person.types.includes('cliente'));

            setFilteredTechnicians(filteredTechnicians);
            setFilteredClients(filteredClients);
        }
    }, [people]);


    useEffect(() => {
        async function encontrarPessoas() {
            try {
                const response = await api.get(`/pessoas?schema=${schema}`);
                if (Array.isArray(response.data.data)) {
                    const todasPessoas = response.data.data;
                    const pessoasFiltradas = [];

                    await Promise.all(
                        todasPessoas.map(async (pessoa) => {
                            try {
                                const tipoResponse = await api.get(`/tipos-pessoa?pes_id=${pessoa.pes_id}&schema=${schema}`);
                                if (Array.isArray(tipoResponse.data.data)) {
                                    const tipos = tipoResponse.data.data;
                                    pessoa.types = tipos.map(tipo => tipo.tpp_descricao.toLowerCase()); // Armazena os tipos no próprio objeto
                                    pessoasFiltradas.push(pessoa);
                                }
                            } catch (error) {
                                console.error(`Erro ao buscar tipos para a pessoa ${pessoa.pes_id}:`, error);
                            }
                        })
                    );

                    setPeople(pessoasFiltradas);
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
        const now = new Date();
        const selectedDate = moment(start).startOf("day");
        const today = moment(now).startOf("day");
        if (selectedDate.isBefore(today)) {
            alert("Não é possível agendar eventos em datas passadas.");
            return;
        }
        if (!selectedPersonId) {
            alert("Selecione um técnico antes de marcar um evento.");
            return;
        }
        setNewEvent((prev) => ({
            ...prev,
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
    const fetchEvents = async () => {
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
                    color: statusColors[event.evt_status] || "#3B82F6",
                }));
                setEvents(loadedEvents);
            } else {
                console.error("Formato de eventos inválido:", response.data);
            }
        } catch (error) {
            console.error("Erro ao buscar eventos:", error);
        }
    };
    useEffect(() => {
        fetchEvents();
    }, [selectedPersonId, schema]);

    const handleSaveEvent = async () => {
        if (!newEvent.title || !newEvent.date || !newEvent.startTime || !newEvent.endTime) {
            alert("Todos os campos são obrigatórios.");
            return;
        }
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
                setTimeout(() => fetchEvents(), 500);
                setModalOpen(false);
            } else {
                console.error("Erro ao salvar evento:", response.data);
            }
        } catch (error) {
            console.error("Erro ao conectar com o backend:", error);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [selectedPersonId, schema]);

    const handleUpdateEvent = async () => {
        if (!newEvent.title || !newEvent.date || !newEvent.startTime || !newEvent.endTime || !newEvent.evt_local) {
            alert("Todos os campos são obrigatórios.");
            return;
        }

        const formattedEvent = {
            titulo: newEvent.title,
            descricao: newEvent.description,
            endereco: newEvent.evt_local,
            status: newEvent.status,
            observacao: newEvent.observacao || "",
            evt_evento: newEvent.date,
            inicio: newEvent.startTime, // Corrigindo a referência
            fim: newEvent.endTime,      // Corrigindo a referência
            schema
        };


        console.log(formattedEvent)

        try {
            const response = await api.put(`/eventos/${newEvent.id}?schema=${schema}`, formattedEvent);
            if (response.status === 200) {
                setTimeout(() => fetchEvents(), 500);
                setModalOpen(false);
            } else {
                console.error("Erro ao atualizar evento:", response.data);
            }
        } catch (error) {
            console.error("Erro ao conectar com o backend:", error);
        }
    };


    const handleEventClick = (event) => {
        if (event) {
            setSelectedEvent(event);
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
                id: event.id
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

    const onEventResize = ({ event, start, end }) => {
        setEvents(prevEvents => prevEvents.map(evt =>
            evt.id === event.id ? { ...event, start, end } : evt
        ));
    };
    return (
        <div className="flex flex-col items-center">
            <button
                onClick={abrirModal}
                className="w-72 h-64 bg-gradient-to-br to-gray-300 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-gray-800 font-semibold flex flex-col justify-center items-center text-center overflow-hidden"
            >
               
               
                <img src={calender} alt="Calender" className="w-20 h-20 mt-2" />
                Agenda
            </button>

            {openModal && (
                <div className="fixed inset-0 z-[100] bg-black bg-opacity-40 flex items-start justify-center overflow-y-auto">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-5xl relative overflow-y-auto max-h-screen mt-10">
                        <select
                            value={newEvent.pes_evento || ""}
                            onChange={(e) => handleSelectPerson(e, "tecnico")}
                            className="border p-2 rounded"
                        >
                            <option value="">Selecione um técnico</option>
                            {filteredTechnicians.map(person => (
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
                            messages={messages}
                            eventPropGetter={(event) => ({
                                style: {
                                    backgroundColor: event.color,
                                    color: "black",
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

                        <div>
                            <ul className="flex space-x-4 mt-4">
                                <li className="flex items-center space-x-2">
                                    <div className="bg-[#DC2626] w-4 h-4 rounded-full"></div>
                                    <p>Cancelado</p>
                                </li>
                                <li className="flex items-center space-x-2">
                                    <div className="bg-[#F59E0B] w-4 h-4 rounded-full"></div>
                                    <p>Pendente</p>
                                </li>
                                <li className="flex items-center space-x-2">
                                    <div className="bg-[#3B82F6] w-4 h-4 rounded-full"></div>
                                    <p>Agendado</p>
                                </li>
                                <li className="flex items-center space-x-2">
                                    <div className="bg-[#10B981] w-4 h-4 rounded-full"></div>
                                    <p>Confirmado</p>
                                </li>
                                <li className="flex items-center space-x-2">
                                    <div className="bg-[#8B5CF6] w-4 h-4 rounded-full"></div>
                                    <p>Concluído</p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}


            {modalOpen && (
                <div className="fixed z-[100] inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <div className="flex justify-between">
                            <h2 className="text-xl font-semibold text-gray-700">
                                {selectedEvent ? "Editar Evento" : "Adicionar Evento"}
                            </h2>

                            <button
                                onClick={() => setModalOpen(false)}
                                className=" bg-red-500 text-white py-1 px-3 rounded-full hover:bg-red-600 transition"
                            >
                                X
                            </button>
                        </div>


                        <select
                            value={newEvent.pes_destino || ""}
                            onChange={(e) => handleSelectPerson(e, "cliente")}
                            className="border p-2 rounded"
                        >
                            <option value="">Selecione um cliente</option>
                            {filteredClients.map(person => (
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
                        <textarea
                            placeholder="Local"
                            className="w-full p-2 border rounded mt-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={newEvent.evt_local}
                            onChange={(e) => setNewEvent({ ...newEvent, evt_local: e.target.value })}
                        />
                        <div className="flex space-x-2 mt-3">
                            <input
                                placeholder="Latitude"
                                type="text"
                                className="w-1/2 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={selectedAddress ? selectedAddress.epe_latitude : ""}
                                onChange={(e) => setNewEvent({ ...newEvent, epe_latitude: e.target.value })}
                                readOnly
                            />
                            <input
                                placeholder="Longitude"
                                type="text"
                                className="w-1/2 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={selectedAddress ? selectedAddress.epe_longitude : ""}
                                onChange={(e) => setNewEvent({ ...newEvent, epe_longitude: e.target.value })}
                                readOnly
                            />
                        </div>
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
                        <select
                            value={newEvent.status}
                            onChange={(e) => setNewEvent({ ...newEvent, status: e.target.value })}
                            className="w-full p-2 border rounded mt-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="agendado">Agendado</option>
                            <option value="confirmado">Confirmado</option>
                            <option value="cancelado">Cancelado</option>
                            <option value="pendente">Pendente</option>
                            <option value="concluido">Concluido</option>
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
                            <button
                                onClick={selectedEvent ? handleUpdateEvent : handleSaveEvent}
                                className="bg-blue-500 text-white py-2 px-4 rounded"
                            >
                                {selectedEvent ? "Atualizar Evento" : "Salvar Evento"}
                            </button>


                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}