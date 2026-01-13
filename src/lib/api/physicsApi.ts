export interface LorenzParams {
    sigma?: number;
    rho?: number;
    beta?: number;
}

export interface Point3D {
    x: number;
    y: number;
    z: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function fetchLorenzStream(
    params: LorenzParams,
    onPoint: (point: Point3D) => void,
    signal?: AbortSignal,
) {
    const { sigma = 10, rho = 28, beta = 2.6667 } = params;
    const queryString = new URLSearchParams({
        sigma: sigma.toString(),
        rho: rho.toString(),
        beta: beta.toString(),
    }).toString();

    const response = await fetch(`${API_BASE_URL}/api/physics/lorenz?${queryString}`, {
        signal,
    });

    if (!response.body) return;

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');

            buffer = lines.pop() || '';

            for (const line of lines) {
                if (!line.trim()) continue;
                try {
                    const point = JSON.parse(line);
                    onPoint(point);
                } catch (e) {
                    console.error('Error parsing JSON line', e);
                }
            }
        }
    } catch (error: any) {
        if (error.name === 'AbortError') return;
        throw error;
    } finally {
        reader.releaseLock();
    }
}
