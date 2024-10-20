const buildConfig = () => {
    return {
        baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
        blog: {
            name: 'Lauri Maila',
            copyright: 'Lauri Maila',
            metadata: {
                title: {
                    absolute: 'Homepage',
                    default: 'Homepage',
                    template: `%s - Homepage`,
                },
                description: 'Some description',
            },
        },
    };
};

export const config = buildConfig();
