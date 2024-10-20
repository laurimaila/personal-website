import type { MetadataRoute } from "next";
import urlJoin from "url-join";
import { config } from "@/config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const result: any = [];
  return [
    {
      url: urlJoin(config.baseUrl, "tag"),
      lastModified: new Date(),
      priority: 0.8,
    },
    /*
    ...result.tags?.map((tag: any) => {
      return {
        url: urlJoin(config.baseUrl, "tag", tag.name),
        lastModified: new Date(),
        priority: 0.8,
      };
    }),*/
  ];
}
