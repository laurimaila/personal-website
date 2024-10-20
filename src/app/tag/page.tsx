import Link from "next/link";

export async function generateMetadata() {
  return {
    title: "Tags",
    description: "Different blog post categories",
    openGraph: {
      title: "Tags",
      description: "Different blog post categories",
      images: [],
    },
  };
}

export default async function Page() {
  const result: any = [];

  return (
    <div className="container mx-auto px-5">
      <div className="mt-20 mb-12 text-center">
        <h1 className="mb-2 text-5xl font-bold">Tags</h1>
        <p className="text-lg opacity-50">List of all tags</p>
      </div>
      <div className="my-10 max-w-6xl text-balance text-center text-xl mb-48">
        {result.map((tag: any) => (
          <Link
            key={tag.id}
            href={`/tag/${tag.name}`}
            className="text-primary mr-2 inline-block"
          >
            #{tag.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
