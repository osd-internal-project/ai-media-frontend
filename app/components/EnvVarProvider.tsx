'use client';

export default function EnvVarProvider({ env }: { env: Record<string, string | undefined> }) {
    return (
        <script
            dangerouslySetInnerHTML={{
                __html: `window.__ENV = ${JSON.stringify(env)}`,
            }}
        />
    );
}
