import { createContext, useContext, useState, useEffect } from 'react';
import api from '../apiUrl';

const PermissionContext = createContext();

export const PermissionProvider = ({ children }) => {
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPermissions();
    }, []);

    const fetchPermissions = async () => {
        try {
            const response = await api.get('/listar-permissoes');
            setPermissions(response.data || []);
        } catch (error) {
            console.error("Erro ao carregar permissões:", error);
        } finally {
            setLoading(false);
        }
    };

    const verifyAndCreatePermission = async (permissionName) => {
        if (!permissionName) {
            console.error("Erro: Nome da permissão não fornecido.");
            return false;
        }
    
        const normalizedPermissionName = normalizePermissionName(permissionName); 
        const descricaoAmigavel = formatPermissionName(normalizedPermissionName);
    
        try {
            let permissionExists = checkPermissionExists(descricaoAmigavel);
    
            if (!permissionExists) {
                permissionExists = await createPermission(descricaoAmigavel, normalizedPermissionName);
            }
    
            if (!permissionExists) return false;
    
            return await checkUserPermission(normalizedPermissionName);
        } catch (error) {
            console.error("Erro ao verificar ou criar permissão:", error);
            return false;
        }
    };
    

    const formatPermissionName = (permissionName) => {
        return permissionName
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (str) => str.toUpperCase())
            .trim();
    };

    const checkPermissionExists = (descricaoAmigavel) => {
        return permissions.some(
            (perm) => perm.per_descricao && perm.per_descricao === descricaoAmigavel
        );
    };

    const normalizePermissionName = (permissionName) => {
        return permissionName.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
    };
    
    const createPermission = async (descricaoAmigavel, permissionName) => {
        try {
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
        } catch (error) {
            console.error("Erro ao criar permissão:", error);
            return false;
        }
    };

  const checkUserPermission = async (permissionName) => {
    const normalizedPermissionName = normalizePermissionName(permissionName); // Normalize o nome aqui
    const user = JSON.parse(localStorage.getItem('user'));
    const papelId = user?.pap_id;

    if (!papelId) {
        console.error("Erro: Papel do usuário não encontrado.");
        alert("Erro: Papel do usuário não encontrado.");
        return false;
    }

    try {
        const response = await api.get(`/permissoes-por-papel/${papelId}`);
        const permissoesPorPapel = response.data || [];
        console.log("Permissões do papel:", permissoesPorPapel);
        const hasPermission = permissoesPorPapel.some((permission) => {
            return (
                permission.per_permissao &&
                permission.per_permissao.toLowerCase() === normalizedPermissionName
            );
        });

        if (hasPermission) {
            console.log("Usuário tem permissão para:", normalizedPermissionName);
            return true;
        } else {
            console.log("Usuário não tem permissão para:", normalizedPermissionName);
            alert(`Você não tem permissão para acessar a função: ${normalizedPermissionName}`);
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

        const permissoesPorPapel = permissions.filter((perm) => perm.pap_id === papelId);
        console.log("Permissões do papel:", permissoesPorPapel);

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
