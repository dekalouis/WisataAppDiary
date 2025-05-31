import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getDiaryFeed } from "../../api/cms";
import {
  getDiaryContentSEOAttributes,
  getSizeOptimizedImageUrl,
  CDN_WISATA_IMG_SIZE,
} from "../../utils/cms";

function FeedPage() {
  const [diaryEntries, setDiaryEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDiaryFeed = async () => {
      const entries = await getDiaryFeed();
      setDiaryEntries(entries);
      console.log("DAFTAR ENTRY:", entries);
      setLoading(false);
    };

    fetchDiaryFeed();
  }, []);

  const createExcerpt = (content, maxLength = 150) => {
    if (!content) return "";
    const cleanText = content
      .replace(/!\[.*?\]\(.*?\)/g, "") // Remove markdown image
      .replace(/#{1,6}\s+/g, "") // Remove markdown heading
      .replace(/\*\*(.+?)\*\*/g, "$1") // Bold
      .replace(/\*(.+?)\*/g, "$1") // Italics
      .replace(/\[(.+?)\]\(.+?\)/g, "$1") // Links
      .replace(/<[^>]*>/g, "") // HTML tags
      .trim();
    return cleanText.length > maxLength
      ? cleanText.substring(0, maxLength) + "..."
      : cleanText;
  };

  const getFirstImage = (content) => {
    if (!content) return null;
    const imageMatch =
      content.match(/!\[.*?\]\((.+?)\)/) ||
      content.match(/src=["']([^"']+)["']/);
    return imageMatch
      ? getSizeOptimizedImageUrl(imageMatch[1], CDN_WISATA_IMG_SIZE.SM)
      : null;
  };

  return (
    <div className="bg-gradient-to-b from-white to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Feed</h1>

        {loading ? (
          <div className="text-center text-gray-500 py-20">
            <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4 rounded-full" />
            Loading diary entries...
          </div>
        ) : diaryEntries.length === 0 ? (
          <div className="text-center text-gray-500 py-20">
            No diary entries found.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {diaryEntries.map((entry) => {
              const seoData = getDiaryContentSEOAttributes(entry);
              const firstImage = getFirstImage(entry.content);
              const excerpt = createExcerpt(entry.content);

              return (
                <Link
                  key={entry.id}
                  to={`/diary/${entry.id}`}
                  className="block bg-white border border-gray-100 rounded-xl shadow-xl hover:shadow-2xl hover:scale-102 transition duration-200 overflow-hidden"
                >
                  {firstImage && (
                    <div className="aspect-w-16 aspect-h-9">
                      <img
                        src={firstImage}
                        alt={seoData.title || "Diary entry image"}
                        className="w-full h-48 object-cover rounded-t-xl"
                      />
                    </div>
                  )}

                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 tracking-tight mb-2">
                      {seoData.title || "Untitled Entry"}
                    </h2>

                    {excerpt && (
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {excerpt}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>
                        {entry.created_dt
                          ? new Date(entry.created_dt).toLocaleDateString()
                          : "No date"}
                      </span>
                      {entry.content && (
                        <span>
                          {Math.ceil(entry.content.split(/\s+/).length / 200)}{" "}
                          min read
                        </span>
                      )}
                    </div>

                    {entry.tags?.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {entry.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
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

export default FeedPage;
