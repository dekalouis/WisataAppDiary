import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";

import { getDiaryContentById } from "../../api/cms";
import { renderDiaryContent } from "../../utils/cms";
import { mdxComponents } from "../components/MDXRenderer";

//memoize so we dont have to repeat the same mdx
// const mdxCache = new Map();

// Assumes mdxComponents and all hooks are imported properly

function EntryPage() {
  const { id } = useParams();
  const [entry, setEntry] = useState(null);
  const [mdxContent, setMdxContent] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchEntry = async () => {
      const entryData = await getDiaryContentById(id);
      const diaryEntry = Array.isArray(entryData) ? entryData[0] : entryData;
      setEntry(diaryEntry);

      const { processedContent, metadata } = renderDiaryContent(diaryEntry);
      const mdxModule = await evaluate(processedContent, {
        ...runtime,
        useMDXComponents: () => mdxComponents,
      });

      setMdxContent({
        Content: mdxModule.default,
        metadata,
      });
    };

    fetchEntry();
  }, [id]);

  if (!entry || !mdxContent) {
    return (
      <div className="py-16 text-center text-gray-500">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4" />
        Loading entry...
      </div>
    );
  }

  const { Content, metadata } = mdxContent;

  return (
    <div className="bg-gradient-to-b from-white to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <Link
          to="/"
          className="mb-6 text-blue-600 hover:text-blue-800 flex items-center"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Feed
        </Link>

        <article className="bg-white border border-gray-200 shadow-xl rounded-2xl">
          <div className="px-6 py-10 sm:px-10">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-6">
              {metadata?.seo?.title}
            </h1>

            <div className="flex items-center gap-4 mb-8 text-sm text-gray-500">
              <span>
                {new Date(entry.created_dt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <span>• {metadata.readingTime} min read</span>
              <span>• {metadata.wordCount} words</span>
            </div>

            {entry.tags?.length > 0 && (
              <div className="mb-8 flex flex-wrap gap-2">
                {entry.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="prose prose-lg max-w-none">
              <Content components={mdxComponents} />
            </div>

            {entry.author && (
              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {entry.author.avatar ? (
                      <img
                        src={entry.author.avatar}
                        alt={entry.author.name}
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-medium">
                          {entry.author.name?.[0]?.toUpperCase() || "A"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">
                      {entry.author.name || "Anonymous"}
                    </p>
                    {entry.author.bio && (
                      <p className="text-sm text-gray-500">
                        {entry.author.bio}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}

export default EntryPage;
