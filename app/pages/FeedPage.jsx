// import { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import { getDiaryFeed } from "../../api/cms";
// import {
//   getDiaryContentSEOAttributes,
//   getSizeOptimizedImageUrl,
//   CDN_WISATA_IMG_SIZE,
// } from "../../utils/cms";

// function FeedPage() {
//   const [diaryEntries, setDiaryEntries] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchDiaryFeed = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         // Using CMS function to fetch diary feed
//         const entries = await getDiaryFeed();
//         console.log("FETCHED ENTRY:", entries);
//         setDiaryEntries(entries);
//       } catch (err) {
//         console.error("Failed to fetch diary feed:", err);
//         setError("Failed to load diary entries. Please try again later.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDiaryFeed();
//   }, []);

//   //bersihin
//   const createExcerpt = (content, maxLength = 150) => {
//     if (!content) return "";

//     const cleanText = content
//       .replace(/#{1,6}\s+/g, "")
//       .replace(/\*\*(.+?)\*\*/g, "$1")
//       .replace(/\*(.+?)\*/g, "$1")
//       .replace(/\[(.+?)\]\(.+?\)/g, "$1")
//       .replace(/<[^>]*>/g, "")
//       .trim();

//     return cleanText.length > maxLength
//       ? cleanText.substring(0, maxLength) + "..."
//       : cleanText;
//   };

//   const getFirstImage = (content) => {
//     if (!content) return null;

//     const imageMatch =
//       content.match(/!\[.*?\]\((.+?)\)/) ||
//       content.match(/src=["']([^"']+)["']/);

//     if (imageMatch) {
//       // Using CMS function to optimize image URL
//       return getSizeOptimizedImageUrl(imageMatch[1], CDN_WISATA_IMG_SIZE.SM);
//     }

//     return null;
//   };

//   if (loading) {
//     return (
//       <div className="py-8">
//         <div className="max-w-4xl mx-auto px-4">
//           <h1 className="text-3xl font-bold text-gray-900 mb-8">Diary Feed</h1>
//           <div className="flex items-center justify-center py-12">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//             <span className="ml-3 text-gray-600">Loading diary entries...</span>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="py-8">
//         <div className="max-w-4xl mx-auto px-4">
//           <h1 className="text-3xl font-bold text-gray-900 mb-8">Diary Feed</h1>
//           <div className="bg-red-50 border border-red-200 rounded-lg p-6">
//             <div className="flex items-center">
//               <div className="flex-shrink-0">
//                 <svg
//                   className="h-5 w-5 text-red-400"
//                   viewBox="0 0 20 20"
//                   fill="currentColor"
//                 >
//                   <path
//                     fillRule="evenodd"
//                     d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
//                     clipRule="evenodd"
//                   />
//                 </svg>
//               </div>
//               <div className="ml-3">
//                 <h3 className="text-sm font-medium text-red-800">
//                   Error loading diary entries
//                 </h3>
//                 <p className="text-sm text-red-700 mt-1">{error}</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="py-8">
//       <div className="max-w-4xl mx-auto px-4">
//         <h1 className="text-3xl font-bold text-gray-900 mb-8">Diary Feed</h1>

//         {diaryEntries.length === 0 ? (
//           <div className="text-center py-12">
//             <p className="text-gray-500">No diary entries found.</p>
//           </div>
//         ) : (
//           <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//             {diaryEntries.map((entry) => {
//               // Using CMS function to extract SEO attributes for preview
//               const seoData = getDiaryContentSEOAttributes(entry);
//               {
//                 /* console.log("SEO Data for entry:", seoData); */
//               }
//               const firstImage = getFirstImage(entry.content);
//               const excerpt = createExcerpt(entry.content);

//               return (
//                 <Link
//                   key={entry.id}
//                   to={`/diary/${entry.id}`}
//                   className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
//                 >
//                   {firstImage && (
//                     <div className="aspect-w-16 aspect-h-9">
//                       <img
//                         src={firstImage}
//                         alt={seoData.title || "Diary entry image"}
//                         className="w-full h-48 object-cover"
//                       />
//                     </div>
//                   )}

//                   <div className="p-6">
//                     <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
//                       {seoData.title || "Untitled Entry"}
//                     </h2>

//                     {excerpt && (
//                       <p className="text-gray-600 mb-4 line-clamp-3">
//                         {excerpt}
//                       </p>
//                     )}

//                     <div className="flex items-center justify-between text-sm text-gray-500">
//                       <span>
//                         {entry.created_dt
//                           ? new Date(entry.created_dt).toLocaleDateString()
//                           : "No date"}
//                       </span>

//                       {entry.content && (
//                         <span>
//                           {Math.ceil(entry.content.split(/\s+/).length / 200)}{" "}
//                           min read
//                         </span>
//                       )}
//                     </div>

//                     {entry.tags && entry.tags.length > 0 && (
//                       <div className="mt-4 flex flex-wrap gap-2">
//                         {entry.tags.slice(0, 3).map((tag, index) => (
//                           <span
//                             key={index}
//                             className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
//                           >
//                             {tag}
//                           </span>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 </Link>
//               );
//             })}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default FeedPage;

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
    // pakai CMS function fetch diary feed
    getDiaryFeed()
      .then((entries) => setDiaryEntries(entries))
      .finally(() => setLoading(false));
  }, []);

  const createExcerpt = (content, maxLength = 150) => {
    if (!content) return "";
    return (
      content
        .replace(/#{1,6}\s+/g, "")
        .replace(/\*\*(.+?)\*\*/g, "$1")
        .replace(/\*(.+?)\*/g, "$1")
        .replace(/\[(.+?)\]\(.+?\)/g, "$1")
        .replace(/<[^>]*>/g, "")
        .trim()
        .slice(0, maxLength) + "..."
    );
  };

  const getFirstImage = (content) => {
    // pakai CMS function ambil gambar pertama dari konten
    if (!content) return null;
    const match =
      //bersihin
      content.match(/!\[.*?\]\((.+?)\)/) ||
      content.match(/src=["']([^"']+)["']/);
    return match
      ? getSizeOptimizedImageUrl(match[1], CDN_WISATA_IMG_SIZE.SM)
      : null;
  };

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Diary Feed</h1>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading...</span>
          </div>
        ) : diaryEntries.length === 0 ? (
          <p className="text-center text-gray-500">No entries found.</p>
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
                  className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {firstImage && (
                    <div className="aspect-w-16 aspect-h-9">
                      <img
                        src={firstImage}
                        alt={seoData.title || "Diary entry image"}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  )}

                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                      {seoData.title || "Untitled Entry"}
                    </h2>

                    <p className="text-gray-600 mb-4 line-clamp-3">{excerpt}</p>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>
                        {entry.created_dt
                          ? new Date(entry.created_dt).toLocaleDateString()
                          : "No date"}
                      </span>
                      <span>
                        {Math.ceil(entry.content.split(/\s+/).length / 200)} min
                        read
                      </span>
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
