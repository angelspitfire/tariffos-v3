async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
    let timer: NodeJS.Timeout | undefined;
    const timeout = new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
            // Name the error so the failure taxonomy reads TIMEOUT instead of the
            // generic 'Error' a plain throw produces.
            const err = new Error(`Timeout after ${ms}ms in ${label}`);
            err.name = 'TimeoutError';
            reject(err);
        }, ms);
    });
    try {
        return await Promise.race([promise, timeout]);
    } finally {
        if (timer) clearTimeout(timer);
    }
}

export { withTimeout };
