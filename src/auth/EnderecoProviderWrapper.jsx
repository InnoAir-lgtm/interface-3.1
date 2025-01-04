
import { EnderecoProvider } from './ProviderEndereco';

export default function EnderecoProviderWrapper({ children }) {
    return (
        <EnderecoProvider>
            {children}
        </EnderecoProvider>
    );
}


