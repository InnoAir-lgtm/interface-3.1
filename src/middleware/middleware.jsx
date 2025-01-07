import { createContext, useContext, useState, useEffect } from 'react';
import api from '../apiUrl';

const PermissionContext = createContext();

export const PermissionProvider = ({ children }) => {
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPermissions();
    }, []);

    // Função para buscar permissões
    const fetchPermissions = async () => {
        try {
            const response = await api.get('/listar-permissoes');
            setPermissions(response.data);
        } catch (error) {
            console.error("Erro ao carregar permissões:", error);
        } finally {
            setLoading(false);
        }
    };

    // Função para verificar e criar permissão
    const verifyAndCreatePermission = async (permissionName) => {
        if (!permissionName) {
            console.error("Erro: Nome da permissão não fornecido.");
            return false;
        }

        const descricaoAmigavel = formatPermissionName(permissionName);

        try {
            let permissionExists = checkPermissionExists(descricaoAmigavel);

            if (!permissionExists) {
                permissionExists = await createPermission(descricaoAmigavel, permissionName);
            }

            if (!permissionExists) return false;

            return await checkUserPermission(permissionName);
        } catch (error) {
            console.error("Erro ao verificar ou criar permissão:", error);
            return false;
        }
    };

    // Função para formatar o nome da permissão
    const formatPermissionName = (permissionName) => {
        return permissionName
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (str) => str.toUpperCase())
            .trim();
    };


    const checkPermissionExists = (descricaoAmigavel) => {
        return permissions.some((perm) => perm.per_descricao === descricaoAmigavel);
    };


    const createPermission = async (descricaoAmigavel, permissionName) => {
        const response = await api.post('/cadastrar-permissoes', {
            descricao: descricaoAmigavel,
            permissao: permissionName,
        });

        if (response.status === 201 || response.status === 200) {
            setPermissions((prevPermissions) => [
                ...prevPermissions,
                response.data,
            ]);
            return true;
        } else {
            console.error("Erro ao criar permissão:", response.data);
            return false;
        }
    };


    const checkUserPermission = async (permissionName) => {
        const user = JSON.parse(localStorage.getItem('user'));
        const papelId = user?.pap_id;

        if (!papelId) {
            console.log("Erro: Papel do usuário não encontrado.");
            alert("Erro: Papel do usuário não encontrado.");
            return false;
        }

        try {
            const response = await api.get(`/permissoes-por-papel/${papelId}`);
            const permissoesPorPapel = response.data;

            console.log("Permissões do papel:", permissoesPorPapel);

            const hasPermission = permissoesPorPapel.some(permission =>
                permission.per_permissao.toLowerCase() === permissionName.toLowerCase()
            );

            if (hasPermission) {
                console.log("Usuário tem permissão para:", permissionName);
                return true;
            } else {
                console.log("Usuário não tem permissão para:", permissionName);
                alert(`Você não tem permissão para acessar a função: ${permissionName}`);
                return false;
            }
        } catch (error) {
            console.error("Erro ao verificar permissões:", error.message);
            alert("Erro ao verificar permissões.");
            return false;
        }
    };




    const checkPermission = (permissionName) => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        const papelId = storedUser?.pap_id;

        if (!papelId) {
            alert("Erro: Papel do usuário não encontrado.");
            return false;
        }

        console.log("Papel do usuário:", papelId);
        console.log("Permissões carregadas:", permissions);

        // Filtrando permissões pelo papel
        const permissoesPorPapel = permissions.filter(perm => perm.pap_id === papelId);
        console.log("Permissões do papel:", permissoesPorPapel);

        // Verificando se a permissão está presente
        const hasPermission = permissoesPorPapel.some(
            (permission) => permission.permissao === permissionName
        );


        if (!hasPermission) {
            alert("Você não tem permissão para executar esta ação.");
        }

        return hasPermission;
    };


    return (
        <PermissionContext.Provider value={{ verifyAndCreatePermission, checkPermission, loading }}>
            {children}
        </PermissionContext.Provider>
    );
};

export const usePermissions = () => useContext(PermissionContext);
