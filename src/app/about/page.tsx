import { MDXRemote } from 'next-mdx-remote/rsc';

const markdown = `# About Me

There will be some content here soon!`;

export async function generateMetadata() {
    return {
        title: 'About Me',
        description: 'About Me',
        openGraph: {
            title: 'About Me',
            description: 'About Me',
            images: [],
        },
    };
}

const Page = async () => {
    return (
        <div className="container mx-auto px-5">
            <div className="prose lg:prose-lg dark:prose-invert mx-auto pt-20 pb-10 blog-content">
                <MDXRemote source={markdown} />
            </div>
        </div>
    );
};

export default Page;
