"use client";

import React, { useMemo } from "react";
import { Post } from "@/lib/types";
import { PostCard } from "./PostCard";
import { EditorialCard } from "./EditorialCard";

interface MasonryGridProps {
  posts: Post[];
  className?: string;
}

export const MasonryGrid: React.FC<MasonryGridProps> = ({
  posts,
  className = "",
}) => {
  // Partition posts into sections separated by full-width editorial cards (featured or every 9th post)
  const sections = useMemo(() => {
    const result: {
      type: "masonry" | "editorial";
      col1?: Post[];
      col2?: Post[];
      editorialPost?: Post;
    }[] = [];

    let currentBatch: Post[] = [];

    posts.forEach((post, idx) => {
      // Check if editorial card (either marked featured or every 9th post)
      const isEditorial = post.featured || (idx > 0 && idx % 9 === 0);

      if (isEditorial) {
        if (currentBatch.length > 0) {
          // Balance current batch into 2 columns
          let h1 = 0;
          let h2 = 0;
          const col1: Post[] = [];
          const col2: Post[] = [];

          currentBatch.forEach((p) => {
            const h = 1 / (p.aspectRatio || 0.8);
            if (h1 <= h2) {
              col1.push(p);
              h1 += h;
            } else {
              col2.push(p);
              h2 += h;
            }
          });

          result.push({ type: "masonry", col1, col2 });
          currentBatch = [];
        }

        result.push({ type: "editorial", editorialPost: post });
      } else {
        currentBatch.push(post);
      }
    });

    if (currentBatch.length > 0) {
      let h1 = 0;
      let h2 = 0;
      const col1: Post[] = [];
      const col2: Post[] = [];

      currentBatch.forEach((p) => {
        const h = 1 / (p.aspectRatio || 0.8);
        if (h1 <= h2) {
          col1.push(p);
          h1 += h;
        } else {
          col2.push(p);
          h2 += h;
        }
      });

      result.push({ type: "masonry", col1, col2 });
    }

    return result;
  }, [posts]);

  return (
    <div className={`flex flex-col gap-3 w-full ${className}`}>
      {sections.map((section, sIdx) => {
        if (section.type === "editorial" && section.editorialPost) {
          return (
            <EditorialCard
              key={section.editorialPost.id}
              post={section.editorialPost}
              priority={sIdx === 0}
            />
          );
        }

        if (section.type === "masonry" && section.col1 && section.col2) {
          return (
            <div key={`section-${sIdx}`} className="grid grid-cols-2 gap-2.5 items-start">
              <div className="flex flex-col gap-3">
                {section.col1.map((post, idx) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    priority={sIdx === 0 && idx < 2}
                  />
                ))}
              </div>
              <div className="flex flex-col gap-3">
                {section.col2.map((post, idx) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    priority={sIdx === 0 && idx < 2}
                  />
                ))}
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
};
