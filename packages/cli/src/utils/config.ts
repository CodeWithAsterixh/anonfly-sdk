import Conf from 'conf';

export interface Config {
    apiKey?: string;
    baseUrl?: string;
    wsUrl?: string;
}

const config = new Conf<Config>({
    projectName: 'anonfly-cli',
});

export const getConfig = () => {
    return {
        apiKey: config.get('apiKey'),
        baseUrl: config.get('baseUrl'),
        wsUrl: config.get('wsUrl'),
    };
};

export const setConfig = (newConfig: Partial<Config>) => {
    if (newConfig.apiKey !== undefined) config.set('apiKey', newConfig.apiKey);
    if (newConfig.baseUrl !== undefined) config.set('baseUrl', newConfig.baseUrl);
    if (newConfig.wsUrl !== undefined) config.set('wsUrl', newConfig.wsUrl);
};

export const clearConfig = () => {
    config.clear();
};
