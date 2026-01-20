import { MDXRemote } from 'next-mdx-remote/rsc';

const markdown = `# About Me

I'm an ICT MSc (Tech) student at the University of Turku, majoring in software engineering with a minor in data analytics.

Currently focusing on a mix of full-stack development, DevOps and data automation. I also have some experience in embedded systems and scientific computing.`;

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
      <div className="blog-content prose mx-auto pb-10 pt-20 dark:prose-invert lg:prose-lg">
        <MDXRemote source={markdown} />
      </div>
    </div>
  );
};

export default Page;
