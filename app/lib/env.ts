export const getEnv = (key: string): string => {
    if (typeof window !== 'undefined') {
        return (window as any).__ENV?.[key] || '';
    }
    return process.env[key] || '';
};
