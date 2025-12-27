const buildConfig = () => {
    return {
        baseUrl: process.env.NEXT_PUBLIC_BASE_URL || '',
        blog: {
            name: 'Lauri Maila',
            copyright: 'Lauri Maila',
            metadata: {
                title: {
                    absolute: 'Lauri Maila',
                    default: 'Lauri Maila',
                    template: `%s - Lauri Maila`,
                },
                description: 'Personal website and blog',
            },
        },
    };
};

export const config = buildConfig();
