import{ createContext, useContext, useState } from 'react';

const EnderecoContext = createContext();

export const EnderecoProvider = ({ children }) => {
    const [enderecos, setEnderecos] = useState([]);

    const addEndereco = (novoEndereco) => {
        setEnderecos((prevEnderecos) => [...prevEnderecos, novoEndereco]);
    };

    return (
        <EnderecoContext.Provider value={{ enderecos, addEndereco }}>
            {children}
        </EnderecoContext.Provider>
    );
};

export const useEndereco = () => {
    const context = useContext(EnderecoContext);
    if (!context) {
        throw new Error('useEndereco deve ser usado dentro do EnderecoProvider');
    }
    return [context.enderecos, context.addEndereco];
};
