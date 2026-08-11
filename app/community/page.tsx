import type { Metadata } from "next";
import Link from "next/link";
import ProtectedMedia from "./components/protected-media";
import { fetchPublicFeed } from "./lib/public-community.api";
import "./community.css";

export const metadata: Metadata = {
  title: "Community · AI CAVE",
  description:
    "Images and videos created with AI CAVE, published by the teams who made them.",
  openGraph: {
    title: "Community · AI CAVE",
    description:
      "Images and videos created with AI CAVE, published by the teams who made them.",
    type: "website",
  },
};

interface CommunityFeedPageProps {
  searchParams: Promise<{ sort?: string; tag?: string; page?: string }>;
}

/**
 * หน้า feed สาธารณะ — เปิดได้โดยไม่ต้อง login
 *
 * เป็น server component โดยตั้งใจ (ต่างจากทุกหน้าใน /page/* ที่เป็น "use client")
 * เพราะ og: tag ต้องอยู่ใน HTML ตั้งแต่ response แรก ไม่งั้นลิงก์ที่แชร์ไปจะขึ้น
 * เป็นการ์ดเปล่าบน Facebook/LinkedIn ซึ่งเป็นเหตุผลหลักที่หน้านี้มีอยู่
 *
 * middleware.ts จับเฉพาะ /page/:path* — route นี้จึงเป็นสาธารณะโดยไม่ต้องแก้อะไร
 */
export default async function CommunityFeedPage({
  searchParams,
}: CommunityFeedPageProps) {
  const params = await searchParams;
  const sort = params.sort === "popular" ? "popular" : "latest";
  const { data } = await fetchPublicFeed({
    sort,
    tag: params.tag,
    page: params.page,
  });

  return (
    <div className="cm-root">
      <div className="cm-shell">
        <header className="cm-header">
          <Link href="/community" className="cm-brand">
            AI CAVE Community
          </Link>
          <Link href="/" className="cm-cta">
            Try AI CAVE
          </Link>
        </header>

        <h1 className="cm-title">
          {params.tag ? `#${params.tag}` : "Made with AI CAVE"}
        </h1>
        <p className="cm-subtitle">
          {params.tag
            ? "Posts tagged by the teams who published them."
            : "Images and videos created by teams using AI CAVE."}
        </p>

        <nav className="cm-sorts">
          <Link
            href={params.tag ? `/community?tag=${params.tag}` : "/community"}
            className="cm-sort"
            data-active={sort === "latest"}
          >
            Latest
          </Link>
          <Link
            href={
              params.tag
                ? `/community?sort=popular&tag=${params.tag}`
                : "/community?sort=popular"
            }
            className="cm-sort"
            data-active={sort === "popular"}
          >
            Most liked
          </Link>
          {params.tag && (
            <Link href="/community" className="cm-sort">
              Clear tag
            </Link>
          )}
        </nav>

        {data.length === 0 ? (
          <p className="cm-empty">Nothing has been published here yet.</p>
        ) : (
          <div className="cm-grid">
            {data.map((post) => {
              const cover = post.media[0];
              return (
                <Link
                  key={post.id}
                  href={`/community/${post.slug}`}
                  className="cm-card"
                >
                  <ProtectedMedia className="cm-card-media">
                    {cover && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={cover.thumbnailUrl}
                        alt={post.title}
                        loading="lazy"
                        draggable={false}
                      />
                    )}
                    {cover?.isVideo && (
                      <span className="cm-badge-video">Video</span>
                    )}
                  </ProtectedMedia>
                  <div className="cm-card-body">
                    <h2 className="cm-card-title">{post.title}</h2>
                    <div className="cm-card-meta">
                      <span>
                        {post.organizationDisplayName || post.authorDisplayName}
                      </span>
                      <span>♥ {post.likeCount.toLocaleString()}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
