import { MDXRemote } from 'next-mdx-remote/rsc';

const markdown = `# About Me

I'm an Information and Communication Technology MSc (Tech) student at the University of Turku, majoring in Software Engineering with a minor in Data Analytics.

Currently focusing on a mix of full-stack development, data automation and distributed systems. I also have some experience in embedded systems and scientific computing.`;

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
