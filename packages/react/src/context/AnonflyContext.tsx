import React, { createContext, useContext, useMemo } from 'react';
import { Anonfly, AnonflyConfig } from '@anonfly/sdk';

interface AnonflyContextType {
    client: Anonfly;
}

const AnonflyContext = createContext<AnonflyContextType | null>(null);

export interface AnonflyProviderProps {
    config: AnonflyConfig;
    children: React.ReactNode;
}

export const AnonflyProvider: React.FC<AnonflyProviderProps> = ({ config, children }) => {
    const client = useMemo(() => new Anonfly(config), [config]);

    return (
        <AnonflyContext.Provider value={{ client }}>
            {children}
        </AnonflyContext.Provider>
    );
};

export const useAnonfly = () => {
    const context = useContext(AnonflyContext);
    if (!context) {
        throw new Error('useAnonfly must be used within an AnonflyProvider');
    }
    return context.client;
};
