const DEFAULT_DEV_SECRET = 'health-agent-dev-secret-change-me';
const MIN_SECRET_LENGTH = 32;

let hasWarnedAboutFallback = false;

function isProductionEnvironment() {
    return process.env.NODE_ENV === 'production';
}

function isInsecureOverrideEnabled() {
    return process.env.ALLOW_INSECURE_AUTH_SECRET === 'true';
}

export const getJwtSecretKey = () => {
    const configuredSecret = process.env.AUTH_SECRET?.trim();

    if (configuredSecret) {
        if (configuredSecret.length < MIN_SECRET_LENGTH) {
            if (isProductionEnvironment() && !isInsecureOverrideEnabled()) {
                throw new Error(
                    'AUTH_SECRET is too short. Use at least 32 characters in production.'
                );
            }

            if (!hasWarnedAboutFallback) {
                console.warn(
                    '[jwt-config] AUTH_SECRET is shorter than recommended (32 chars). ' +
                    'Use a longer secret to reduce brute-force risk.'
                );
                hasWarnedAboutFallback = true;
            }
        }

        return new TextEncoder().encode(configuredSecret);
    }

    if (isProductionEnvironment() && !isInsecureOverrideEnabled()) {
        throw new Error(
            'AUTH_SECRET is required in production. Set AUTH_SECRET before starting the server.'
        );
    }

    if (!hasWarnedAboutFallback) {
        console.warn(
            '[jwt-config] AUTH_SECRET is not set. Using development fallback secret. ' +
            'Do not use this in production.'
        );
        hasWarnedAboutFallback = true;
    }

    return new TextEncoder().encode(DEFAULT_DEV_SECRET);
};
