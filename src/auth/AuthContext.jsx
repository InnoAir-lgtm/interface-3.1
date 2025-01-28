import { createContext, useState, useContext } from 'react';
import api from '../apiUrl';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const [loading, setLoading] = useState(false);

    const login = async (userData) => {
        setLoading(true);
        try {
            const formattedUser = {
                id: userData.id,
                nome: userData.nome,
                email: userData.email,
                grupo: userData.grupo,
                perfil: userData.perfil,
                papel: null,
                pap_id: null,
            };

            setUser(formattedUser);
            localStorage.setItem('user', JSON.stringify(formattedUser));

            const response = await api.get(`/listar-associacoes/${userData.id}`);
            const associacoes = response.data;

            const papelUsuario = associacoes[0]?.papeis?.pap_papel || "Usuário sem papel";
            const papelId = associacoes[0]?.pap_id || null;

            setUser((prevUser) => ({
                ...prevUser,
                papel: papelUsuario,
                pap_id: papelId,
            }));

            localStorage.setItem('user', JSON.stringify({ ...formattedUser, papel: papelUsuario, pap_id: papelId }));
        } catch (error) {
            console.error("Erro ao buscar permissões do papel:", error.message);
        } finally {
            setLoading(false); 
        }
    };

    const updateUser = (updatedData) => {
        setUser((prevUser) => {
            const updatedUser = { ...prevUser, ...updatedData };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            return updatedUser;
        });
    };
    

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider value={{ user, isAuthenticated,setUser: updateUser, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
