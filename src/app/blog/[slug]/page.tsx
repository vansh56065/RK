import { BlogDetailPage } from "@/components/rk/pages/BlogPages";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return {
    title: `${slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")} — RK Residency Blog`,
    description: "Braj Journal story from RK Residency, Vrindavan.",
  };
}

export default async function BlogDetailRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <BlogDetailPage slug={slug} />;
}
