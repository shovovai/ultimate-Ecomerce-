import Image from "next/image";
import Link from "next/link";
import dayjs from "dayjs";
import Container from "./Container";
import SectionHeading from "./SectionHeading";
import { getLatestBlogs } from "@/sanity/queries";
import { urlFor } from "@/sanity/lib/image";
import { cn } from "@/lib/utils";

const LatestBlog = async () => {
  const blogs = (await getLatestBlogs())?.slice(0, 3);
  if (!blogs?.length) return null;

  return (
    <Container className="mt-20">
      <SectionHeading
        eyebrow="From the journal"
        title="Guides, stories & tips"
        href="/blog"
        linkLabel="Read the blog"
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr]">
        {blogs.map((blog, index) => (
          <Link
            key={blog?._id}
            href={`/blog/${blog?.slug?.current}`}
            className={cn(
              "group flex gap-4",
              index === 0
                ? "flex-col md:col-span-2 lg:col-span-1 lg:row-span-2"
                : "flex-col sm:flex-row lg:flex-row"
            )}
          >
            {blog?.mainImage && (
              <div
                className={cn(
                  "relative shrink-0 overflow-hidden rounded-2xl bg-sand",
                  index === 0 ? "aspect-[16/10] w-full" : "aspect-[4/3] w-full sm:w-44"
                )}
              >
                <Image
                  src={urlFor(blog.mainImage).width(900).url()}
                  alt={blog?.title || "Blog image"}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            )}
            <div className="flex flex-col justify-center">
              <div className="flex flex-wrap items-center gap-2 text-xs text-light-color">
                {blog?.blogcategories?.[0]?.title && (
                  <span className="rounded-full bg-shop_light_pink px-2.5 py-0.5 font-semibold text-clay">
                    {blog.blogcategories[0].title}
                  </span>
                )}
                <span>{dayjs(blog.publishedAt).format("MMM D, YYYY")}</span>
              </div>
              <h3
                className={cn(
                  "mt-2 font-display leading-snug text-ink transition-colors group-hover:text-clay",
                  index === 0 ? "text-2xl sm:text-3xl" : "text-lg"
                )}
              >
                {blog?.title}
              </h3>
              <span className="mt-2 text-sm font-semibold text-ink/70 underline decoration-clay/40 underline-offset-4 group-hover:decoration-clay">
                Read article
              </span>
            </div>
          </Link>
        ))}
      </div>
    </Container>
  );
};

export default LatestBlog;
