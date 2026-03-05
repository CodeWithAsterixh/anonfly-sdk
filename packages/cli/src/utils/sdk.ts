import { Anonfly } from '@anonfly/sdk';
import { getConfig } from './config';

export const getClient = () => {
    const { apiKey, baseUrl, wsUrl } = getConfig();
    if (!apiKey) {
        throw new Error('Not authenticated. Run "anonfly login" first.');
    }
    return new Anonfly({
        apiKey,
        baseUrl,
        wsUrl,
    });
};
