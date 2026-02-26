const DEFAULT_SECRET = 'health-agent-production-secret-key-fixed-2026';

export const getJwtSecretKey = () => {
    const secret = process.env.AUTH_SECRET || DEFAULT_SECRET;
    if (!process.env.AUTH_SECRET) {
        console.warn(
            '[jwt-config] WARNING: AUTH_SECRET env var is not set! ' +
            'Using default fallback. This WILL cause signature mismatches if ' +
            'tokens were signed with a different secret. ' +
            'Set AUTH_SECRET in your .env file BEFORE running `next build`.'
        );
    }
    return new TextEncoder().encode(secret);
};
