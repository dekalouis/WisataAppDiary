import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";

import { getDiaryContentById } from "../../../api/cms";
import { renderDiaryContent } from "../../../utils/cms";

function EntryPage() {
  const { id } = useParams();
  const [entry, setEntry] = useState(null);
  const [mdxContent, setMdxContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEntry = async () => {
      if (!id) {
        setError("No entry ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Using CMS function to fetch diary entry by ID
        const entryData = await getDiaryContentById(id);

        if (!entryData || entryData.length === 0) {
          setError("Diary entry not found");
          return;
        }

        const diaryEntry = Array.isArray(entryData) ? entryData[0] : entryData;
        setEntry(diaryEntry);

        // Using CMS function to process diary content for MDX rendering
        const processedContent = renderDiaryContent(diaryEntry);

        if (processedContent.processedContent) {
          try {
            // Using @mdx-js/mdx evaluate function to compile MDX content
            const mdxModule = await evaluate(
              processedContent.processedContent,
              {
                ...runtime,
                development: false,
              }
            );

            setMdxContent({
              Content: mdxModule.default,
              components: processedContent.components,
              metadata: processedContent.metadata,
            });
          } catch (mdxError) {
            console.error("MDX compilation error:", mdxError);
            setMdxContent({
              Content: () => (
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded">
                    {processedContent.processedContent}
                  </pre>
                </div>
              ),
              components: processedContent.components,
              metadata: processedContent.metadata,
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch diary entry:", err);
        setError("Failed to load diary entry. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchEntry();
  }, [id]);

  // Custom MDX components for rendering embeds
  const mdxComponents = {
    YoutubeEmbed: ({ videoId, title = "YouTube Video" }) => {
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;
      return (
        <div className="my-6">
          <iframe
            src={embedUrl}
            title={title}
            className="w-full h-64 md:h-96 rounded-lg"
            frameBorder="0"
            allowFullScreen
          />
        </div>
      );
    },

    InstagramEmbed: ({ postId }) => {
      const embedUrl = `https://www.instagram.com/p/${postId}/embed/`;
      return (
        <div className="my-6 flex justify-center">
          <iframe
            src={embedUrl}
            className="w-full max-w-md h-96 rounded-lg"
            frameBorder="0"
            scrolling="no"
            allowTransparency="true"
          />
        </div>
      );
    },

    TiktokEmbed: ({ videoId }) => {
      const embedUrl = `https://www.tiktok.com/embed/v2/${videoId}`;
      return (
        <div className="my-6 flex justify-center">
          <iframe
            src={embedUrl}
            className="w-full max-w-sm h-96 rounded-lg"
            frameBorder="0"
            scrolling="no"
            allowFullScreen
          />
        </div>
      );
    },

    TwitterEmbed: ({ tweetId }) => (
      <div className="my-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
        <p className="text-gray-600">Twitter Post: {tweetId}</p>
        <p className="text-sm text-gray-500 mt-2">
          Twitter embeds would be implemented with Twitter's widget.js
        </p>
      </div>
    ),

    img: ({ src, alt, ...props }) => (
      <img
        src={src}
        alt={alt}
        className="w-full h-auto rounded-lg my-4"
        loading="lazy"
        {...props}
      />
    ),

    p: ({ children }) => (
      <p className="mb-4 leading-relaxed text-gray-700">{children}</p>
    ),

    h1: ({ children }) => (
      <h1 className="text-3xl font-bold mb-6 text-gray-900">{children}</h1>
    ),

    h2: ({ children }) => (
      <h2 className="text-2xl font-semibold mb-4 text-gray-900">{children}</h2>
    ),

    h3: ({ children }) => (
      <h3 className="text-xl font-semibold mb-3 text-gray-900">{children}</h3>
    ),

    ul: ({ children }) => (
      <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>
    ),

    ol: ({ children }) => (
      <ol className="list-decimal list-inside mb-4 space-y-1">{children}</ol>
    ),

    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-blue-500 pl-4 italic my-4 text-gray-600">
        {children}
      </blockquote>
    ),

    code: ({ children }) => (
      <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">
        {children}
      </code>
    ),

    pre: ({ children }) => (
      <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto my-4">
        {children}
      </pre>
    ),
  };

  if (loading) {
    return (
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading diary entry...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error loading diary entry
                </h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-gray-500">Diary entry not found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Link
          to="/"
          className="mb-6 text-blue-600 hover:text-blue-800 flex items-center inline-flex"
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

        <article className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-8">
            {mdxContent?.metadata?.seo?.title && (
              <h1 className="text-4xl font-bold mb-4 text-gray-900">
                {mdxContent.metadata.seo.title}
              </h1>
            )}

            <div className="flex items-center gap-4 mb-8 text-sm text-gray-500">
              {entry.published_at && (
                <span>
                  {new Date(entry.published_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              )}

              {mdxContent?.metadata?.readingTime && (
                <span>• {mdxContent.metadata.readingTime} min read</span>
              )}

              {mdxContent?.metadata?.wordCount && (
                <span>• {mdxContent.metadata.wordCount} words</span>
              )}
            </div>

            {entry.tags && entry.tags.length > 0 && (
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
              {mdxContent?.Content ? (
                <mdxContent.Content components={mdxComponents} />
              ) : (
                <div className="text-gray-500">
                  No content available for this diary entry.
                </div>
              )}
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
