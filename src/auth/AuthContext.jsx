import { createContext, useState, useContext } from 'react';
import api from '../apiUrl';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const login = async (userData) => {
        try {
            const response = await api.get(`/listar-associacoes/${userData.id}`);
            const associacoes = response.data;

            // Atribuindo um valor padrão se não houver papel encontrado
            const papelUsuario = associacoes[0]?.papeis?.pap_papel || "Usuário sem papel";
            const papelId = associacoes[0]?.pap_id || null;

            const formattedUser = {
                id: userData.id,
                nome: userData.nome,
                email: userData.email,
                grupo: userData.grupo,
                perfil: userData.perfil,
                papel: papelUsuario,
                pap_id: papelId,
            };

            setUser(formattedUser);
            localStorage.setItem('user', JSON.stringify(formattedUser));
        } catch (error) {
            console.error("Erro ao buscar permissões do papel:", error.message);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);