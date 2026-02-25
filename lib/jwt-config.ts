export const getJwtSecretKey = () => {
    const secret = process.env.AUTH_SECRET || 'health-agent-production-secret-key-fixed-2026';
    return new TextEncoder().encode(secret);
};
