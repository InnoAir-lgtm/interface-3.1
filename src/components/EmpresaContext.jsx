// EmpresaContext.jsx
import { createContext, useContext, useState } from "react";

const EmpresaContext = createContext();

export function EmpresaProvider({ children }) {
    const [selectedEmpresa, setSelectedEmpresa] = useState('');

    return (
        <EmpresaContext.Provider value={{ selectedEmpresa, setSelectedEmpresa }}>
            {children}
        </EmpresaContext.Provider>
    );
}

export const useEmpresa = () => useContext(EmpresaContext);
