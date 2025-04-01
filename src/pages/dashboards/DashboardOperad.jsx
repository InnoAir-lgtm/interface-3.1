import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { useLocation } from 'react-router-dom';
import EmpresaComponent from '../../components/Pessoa';
import { useEmpresa } from '../../components/EmpresaContext';
import Sidebar from '../../components/Sidebar';
import api from '../../apiUrl';

export default function DashboardOperad() {
    const { selectedEmpresa } = useEmpresa();
    const [empresaData, setEmpresaData] = useState(null);
    const [selectedSchema, setSelectedSchema] = useState(null);
    const [error, setError] = useState(null);
    const location = useLocation();
    const selectedSchemaFromState = location.state?.selectedSchema;
    const [loading, setLoading] = useState(true);
    const [companyName, setCompanyName] = useState('');

    useEffect(() => {
        if (selectedEmpresa) {
            setLoading(true);
            setTimeout(() => {
                setCompanyName(selectedEmpresa);
                setLoading(false);
            }, 1000); // Simulando o tempo de carregamento da empresa
        }
    }, [selectedEmpresa]);

    useEffect(() => {
        if (!selectedEmpresa) return;

        const fetchEmpresaData = async () => {
            try {
                const schemaResponse = await api.get(`/buscar-schema?cnpj=${selectedEmpresa}`);
                setSelectedSchema(schemaResponse.data.schema);

                const empresaDataResponse = await api.get(`/dados-empresa?cnpj=${selectedEmpresa}`);
                setEmpresaData(empresaDataResponse.data);
            } catch (error) {
                console.error("Erro ao buscar dados da empresa:", error);
                setError("Erro ao carregar os dados da empresa.");
            }
        };

        fetchEmpresaData();
    }, [selectedEmpresa]);

    if (error) return <p>Erro: {error}</p>;

    return (
        <div className="flex">
            <div className="w-64">
                <Sidebar selectedEmpresa={selectedEmpresa} selectedSchema={selectedSchema} />
            </div>
            <div className="flex-1 p-6">
                {loading ? (
                    <p>Carregando...</p>
                ) : (
                    <>
                        {selectedSchemaFromState || selectedSchema ? (
                            <EmpresaComponent
                                schema={selectedSchemaFromState || selectedSchema}
                                empresaData={empresaData}
                                empresaName={empresaData?.emp_nome || companyName} // Exibe o nome da empresa após carregamento
                            />
                        ) : (
                            <p>Selecione uma empresa para visualizar os dados.</p>
                        )}
                    </>
                )}
            </div>

            
        </div>
    );
}
