import globals from '../../global';

export async function apiCall<T = unknown>(apiKey: string, route: string, method: 'GET' | 'POST' = 'GET', payload?: object): Promise<T> {
    const body = {
        requestId: crypto.randomUUID(),
        payload
    };

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Govee-API-Key': apiKey,
        'User-Agent': `Firebot-Govee-Control/${globals.pluginVersion}`
    };

    const response = await fetch(`https://openapi.api.govee.com/router/api/v1/${route}`, {
        method,
        headers,
        body: method === 'GET' ? undefined : JSON.stringify(body)
    });

    if (!response.ok) {
        throw new Error(`Govee API error: ${response.statusText}`);
    }

    return response.json() as Promise<T>;
}

export function hexToRgbInt(hex: string): number {
    if (!hex.startsWith('#')) {
        throw new Error('Invalid hex color string. Must start with #.');
    }

    hex = hex.slice(1);

    if (hex.length !== 6) {
        throw new Error('Invalid hex color string. Must be 6 characters long after # (RRGGBB).');
    }

    if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
        throw new Error('Invalid hex color string. Contains invalid characters. Only 0-9 and a-f are allowed.');
    }

    // Parse the hex string to an integer
    const intValue = parseInt(hex, 16);

    return intValue;
}