import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchPublicPost } from "../lib/public-community.api";
import LikeButton from "../components/like-button";
import ProtectedMedia from "../components/protected-media";
import ViewTracker from "../components/view-tracker";
import "../community.css";

interface CommunityPostPageProps {
  params: Promise<{ slug: string }>;
}

/** ความยาวสูงสุดของ og:description ก่อนตัด */
const OG_DESCRIPTION_MAX = 200;

/**
 * OG / Twitter card ของโพสต์
 *
 * og:image ชี้ไปที่ endpoint redirect ของ backend ไม่ใช่ presigned URL ตรง ๆ —
 * presigned URL หมดอายุ แต่ crawler cache รูปไว้เป็นวัน ลิงก์ที่เคยแชร์ไปจึงจะ
 * กลายเป็นรูปเสียถ้าฝัง URL ที่หมดอายุได้
 */
export async function generateMetadata({
  params,
}: CommunityPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchPublicPost(slug);

  if (!post) {
    return { title: "Post not found · AI CAVE Community" };
  }

  const description =
    post.caption.trim().slice(0, OG_DESCRIPTION_MAX) ||
    `Published by ${post.organizationDisplayName || post.authorDisplayName} on AI CAVE.`;
  const cover = post.media[0];

  return {
    title: `${post.title} · AI CAVE Community`,
    description,
    openGraph: {
      title: post.title,
      description,
      type: "article",
      publishedTime: post.publishedAt ?? undefined,
      images: cover ? [{ url: cover.url, alt: post.title }] : undefined,
    },
    twitter: {
      card: cover ? "summary_large_image" : "summary",
      title: post.title,
      description,
      images: cover ? [cover.url] : undefined,
    },
  };
}

/**
 * หน้าโพสต์สาธารณะ 1 ใบ
 *
 * server component ด้วยเหตุผลเดียวกับหน้า feed — ส่วนที่ต้องโต้ตอบ (นับวิว
 * และกดถูกใจ) แยกเป็น client component เล็ก ๆ สองตัวเท่านั้น
 */
export default async function CommunityPostPage({
  params,
}: CommunityPostPageProps) {
  const { slug } = await params;
  const post = await fetchPublicPost(slug);

  // โพสต์ที่ยังไม่อนุมัติ ตั้งเวลาไว้ หรือถูกถอดแล้ว ได้ 404 เหมือนกันหมด
  if (!post) notFound();

  return (
    <div className="cm-root">
      <ViewTracker slug={post.slug} />

      <div className="cm-shell">
        <header className="cm-header">
          <Link href="/community" className="cm-brand">
            AI CAVE Community
          </Link>
          <Link href="/" className="cm-cta">
            Try AI CAVE
          </Link>
        </header>

        <article className="cm-post">
          <h1 className="cm-post-title">{post.title}</h1>
          <p className="cm-post-byline">
            {post.organizationDisplayName
              ? `${post.authorDisplayName} · ${post.organizationDisplayName}`
              : post.authorDisplayName}
            {post.publishedAt &&
              ` · ${new Date(post.publishedAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}`}
          </p>

          <div className="cm-media-stack">
            {post.media.map((item) => (
              <ProtectedMedia key={item.index} className="cm-media-item">
                {item.isVideo ? (
                  <video
                    src={item.url}
                    poster={item.thumbnailUrl}
                    controls
                    controlsList="nodownload noremoteplayback"
                    disablePictureInPicture
                    disableRemotePlayback
                    draggable={false}
                    preload="metadata"
                  />
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={item.url}
                    alt={`${post.title} — ${item.index + 1}`}
                    loading={item.index === 0 ? "eager" : "lazy"}
                    draggable={false}
                  />
                )}
              </ProtectedMedia>
            ))}
          </div>

          {post.caption && <p className="cm-caption">{post.caption}</p>}

          {post.hashtags.length > 0 && (
            <div className="cm-tags">
              {post.hashtags.map((tag) => (
                <Link
                  key={tag}
                  href={`/community?tag=${encodeURIComponent(tag)}`}
                  className="cm-tag"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {post.prompt && (
            <section className="cm-prompt">
              <p className="cm-prompt-label">Prompt</p>
              <p className="cm-prompt-body">{post.prompt}</p>
            </section>
          )}

          <div className="cm-actions">
            <LikeButton slug={post.slug} initialLikeCount={post.likeCount} />
            <span className="cm-views">
              {post.viewCount.toLocaleString()} views
            </span>
            {post.linkUrl && (
              <a
                className="cm-link-out"
                href={post.linkUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
              >
                Learn more ↗
              </a>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}
