// import { useState, useEffect } from "react";
// import { useParams, Link } from "react-router-dom";
// import { evaluate } from "@mdx-js/mdx";
// import * as runtime from "react/jsx-runtime";

// import { getDiaryContentById } from "../../api/cms";
// import { renderDiaryContent } from "../../utils/cms";
// import { mdxComponents } from "../components/MDXRenderer.jsx";

// function EntryPage() {
//   const { id } = useParams();
//   const [entry, setEntry] = useState(null);
//   const [mdxContent, setMdxContent] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchEntry = async () => {
//       if (!id) {
//         setError("No entry ID provided");
//         setLoading(false);
//         return;
//       }

//       try {
//         setLoading(true);
//         setError(null);

//         // Using CMS function to fetch diary entry by ID
//         const entryData = await getDiaryContentById(id);

//         if (!entryData || entryData.length === 0) {
//           setError("Diary entry not found");
//           return;
//         }

//         const diaryEntry = Array.isArray(entryData) ? entryData[0] : entryData;
//         console.log("FETCHED ENTRY SATU INI:", diaryEntry);
//         setEntry(diaryEntry);

//         // Using CMS function to process diary content for MDX rendering
//         const processedContent = renderDiaryContent(diaryEntry);

//         if (processedContent.processedContent) {
//           try {
//             // Using @mdx-js/mdx evaluate function to compile MDX content
//             const mdxModule = await evaluate(
//               processedContent.processedContent,
//               {
//                 ...runtime,
//                 development: false,
//               }
//             );

//             setMdxContent({
//               Content: mdxModule.default,
//               components: processedContent.components,
//               metadata: processedContent.metadata,
//             });
//           } catch (mdxError) {
//             console.error("MDX compilation error:", mdxError);
//             setMdxContent({
//               Content: () => (
//                 <div className="prose max-w-none">
//                   <pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded">
//                     {processedContent.processedContent}
//                   </pre>
//                 </div>
//               ),
//               components: processedContent.components,
//               metadata: processedContent.metadata,
//             });
//           }
//         }
//       } catch (err) {
//         console.error("Failed to fetch diary entry:", err);
//         setError("Failed to load diary entry. Please try again later.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchEntry();
//   }, [id]);

//   // MDX COMPONENTS to render embeds!!
//   // REMOVED TO A DIFFERENT FILE

//   if (loading) {
//     return (
//       <div className="py-8">
//         <div className="max-w-4xl mx-auto px-4">
//           <div className="flex items-center justify-center py-12">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//             <span className="ml-3 text-gray-600">Loading diary entry...</span>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="py-8">
//         <div className="max-w-4xl mx-auto px-4">
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
//                   Error loading diary entry
//                 </h3>
//                 <p className="text-sm text-red-700 mt-1">{error}</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (!entry) {
//     return (
//       <div className="py-8">
//         <div className="max-w-4xl mx-auto px-4">
//           <div className="text-center py-12">
//             <p className="text-gray-500">Diary entry not found.</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="py-8">
//       <div className="max-w-4xl mx-auto px-4">
//         <Link
//           to="/"
//           className="mb-6 text-blue-600 hover:text-blue-800 flex items-center"
//         >
//           <svg
//             className="w-4 h-4 mr-2"
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M15 19l-7-7 7-7"
//             />
//           </svg>
//           Back to Feed
//         </Link>

//         <article className="bg-white rounded-lg shadow-md overflow-hidden">
//           <div className="p-8">
//             {mdxContent?.metadata?.seo?.title && (
//               <h1 className="text-4xl font-bold mb-4 text-gray-900">
//                 {mdxContent.metadata.seo.title}
//               </h1>
//             )}

//             <div className="flex items-center gap-4 mb-8 text-sm text-gray-500">
//               {entry.created_dt && (
//                 <span>
//                   {new Date(entry.created_dt).toLocaleDateString("en-US", {
//                     year: "numeric",
//                     month: "long",
//                     day: "numeric",
//                   })}
//                 </span>
//               )}

//               {mdxContent?.metadata?.readingTime && (
//                 <span>• {mdxContent.metadata.readingTime} min read</span>
//               )}

//               {mdxContent?.metadata?.wordCount && (
//                 <span>• {mdxContent.metadata.wordCount} words</span>
//               )}
//             </div>

//             {entry.tags && entry.tags.length > 0 && (
//               <div className="mb-8 flex flex-wrap gap-2">
//                 {entry.tags.map((tag, index) => (
//                   <span
//                     key={index}
//                     className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
//                   >
//                     {tag}
//                   </span>
//                 ))}
//               </div>
//             )}

//             <div className="prose prose-lg max-w-none">
//               {mdxContent?.Content ? (
//                 <mdxContent.Content components={mdxComponents} />
//               ) : (
//                 <div className="text-gray-500">
//                   No content available for this diary entry.
//                 </div>
//               )}
//             </div>

//             {entry.author && (
//               <div className="mt-12 pt-8 border-t border-gray-200">
//                 <div className="flex items-center">
//                   <div className="flex-shrink-0">
//                     {entry.author.avatar ? (
//                       <img
//                         src={entry.author.avatar}
//                         alt={entry.author.name}
//                         className="w-12 h-12 rounded-full"
//                       />
//                     ) : (
//                       <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
//                         <span className="text-gray-600 font-medium">
//                           {entry.author.name?.[0]?.toUpperCase() || "A"}
//                         </span>
//                       </div>
//                     )}
//                   </div>
//                   <div className="ml-4">
//                     <p className="text-sm font-medium text-gray-900">
//                       {entry.author.name || "Anonymous"}
//                     </p>
//                     {entry.author.bio && (
//                       <p className="text-sm text-gray-500">
//                         {entry.author.bio}
//                       </p>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </article>
//       </div>
//     </div>
//   );
// }

// export default EntryPage;

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";

import { getDiaryContentById } from "../../api/cms";
import { renderDiaryContent } from "../../utils/cms";
import { mdxComponents } from "../components/MDXRenderer";

//memoize so we dont have to repeat the same mdx
const mdxCache = new Map();

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

      // const mdxModule = await evaluate(processedContent, {
      //   ...runtime,
      //   useMDXComponents: () => mdxComponents,
      // });

      // setMdxContent({
      //   Content: mdxModule.default,
      //   metadata,
      // });
      //!MEMOIZE
      let Content;
      if (mdxCache.has(processedContent)) {
        Content = mdxCache.get(processedContent);
      } else {
        const mdxModule = await evaluate(processedContent, {
          ...runtime,
          useMDXComponents: () => mdxComponents,
        });

        Content = mdxModule.default;
        mdxCache.set(processedContent, Content);
      }
      setMdxContent({ Content, metadata });

      //===
    };

    fetchEntry();
  }, [id]);

  if (!entry || !mdxContent) {
    return (
      <div className="py-16 text-center text-gray-500">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
        Loading entry...
      </div>
    );
  }

  const { Content, metadata } = mdxContent;

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto px-4">
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

        <article className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-8">
            {metadata?.seo?.title && (
              <h1 className="text-4xl font-bold mb-4 text-gray-900">
                {metadata.seo.title || "No Title!!"}
              </h1>
            )}

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
