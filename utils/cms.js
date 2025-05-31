const CDN_WISATA_URL = "https://cdn.wisata.app";
const CDN_TWITTER_URL = "https://pbs.twimg.com";
export const CDN_WISATA_IMG_SIZE = {
  TH: "th", // thumbnail
  XS: "xs", // extra small
  SM: "sm", // small
  MD: "md", // medium
  LG: "lg", // large
};

/**
 * TASK: Find available image size for Twitter CDN
 */
// Available image sizes for Twitter CDN
const CDN_TWITTER_IMG_SIZE = {
  THUMB: "thumb", // Small thumbnail
  SMALL: "small", // Small size
  MEDIUM: "medium", // Medium size (default)
  LARGE: "large", // Large size
  ORIG: "orig", // Original size
};

/**
 * TASK: Replace original image URL with size-optimized image URL.
 * @example
 * For Wisata CDN URL:
 * ```
 * https://cdn.wisata.app/diary/87511695-cafc-401b-8eba-2db648083556.jpg
 * - https://cdn.wisata.app/diary/87511695-cafc-401b-8eba-2db648083556_th.jpg
 * - https://cdn.wisata.app/diary/87511695-cafc-401b-8eba-2db648083556_lg.jpg
 * ```
 *
 * Note that some images may not have optimized URL variants.
 */
export function getSizeOptimizedImageUrl(originalUrl, desiredSize) {
  // Return original URL if either parameter is missing
  if (!originalUrl || !desiredSize) {
    return originalUrl;
  }

  try {
    // Handle Wisata CDN URLs
    if (originalUrl.includes(CDN_WISATA_URL)) {
      // Check if desired size is valid, otherwise use medium as default
      const sizeKey = Object.values(CDN_WISATA_IMG_SIZE).includes(desiredSize)
        ? desiredSize
        : CDN_WISATA_IMG_SIZE.MD;
      // Find the last dot in URL to separate filename from extension
      const lastDotIndex = originalUrl.lastIndexOf(".");
      // If no extension found, return original URL
      if (lastDotIndex === -1) return originalUrl;

      // Split URL into base part and extension
      const baseUrl = originalUrl.substring(0, lastDotIndex); // Everything before .jpg
      const extension = originalUrl.substring(lastDotIndex); // .jpg part
      // Create optimized URL by adding size suffix: filename_md.jpg
      return `${baseUrl}_${sizeKey}${extension}`;
    }

    // Handle Twitter CDN URLs
    if (originalUrl.includes(CDN_TWITTER_URL)) {
      // Check if desired size is valid, otherwise use medium as default
      const sizeKey = Object.values(CDN_TWITTER_IMG_SIZE).includes(desiredSize)
        ? desiredSize
        : CDN_TWITTER_IMG_SIZE.MEDIUM;
      // Parse URL to modify query parameters
      const url = new URL(originalUrl);
      // Add/modify the 'name' parameter which controls Twitter image size
      url.searchParams.set("name", sizeKey);
      // Return the modified URL as string
      return url.toString();
    }

    // If URL is not from supported CDNs, return original URL unchanged
    return originalUrl;
  } catch (error) {
    // If any error occurs during URL processing, log it and return original
    console.error("Error optimizing image URL:", error);
    return originalUrl;
  }
}

/**
 * TASK: Extracts SEO attributes from diary content
 */
export function getDiaryContentSEOAttributes(contentData) {
  // console.log(`>>> isinya!!!`, contentData);
  // Return empty SEO object if no content data provided
  if (!contentData) {
    return {
      title: "",
      description: "",
      image: "",
    };
  }

  // Extract basic SEO fields from content data (if they exist)
  let title = contentData.meta.title || "Title"; // Use title field
  let description = contentData.meta.description || contentData.excerpt || ""; // Use description or excerpt
  let image = contentData.meta.featured_image || contentData.image || ""; // Use featured image or image

  // Extract title from markdown content if not available in metadata
  if (!title && contentData.content) {
    // Look for markdown header (# Title) at the beginning of a line
    const titleMatch = contentData.content.match(/^#\s+(.+)$/m);
    if (titleMatch) {
      // Extract the text after the # symbol and trim whitespace
      title = titleMatch[1].trim();
    }
  }

  // Extract description from content if not available in metadata
  if (!description && contentData.content) {
    // Clean up markdown syntax to get plain text
    const cleanContent = contentData.content
      .replace(/#{1,6}\s+/g, "") // Remove headers (# ## ### etc.)
      .replace(/\*\*(.+?)\*\*/g, "$1") // Remove bold syntax (**text**)
      .replace(/\*(.+?)\*/g, "$1") // Remove italic syntax (*text*)
      .replace(/\[(.+?)\]\(.+?\)/g, "$1") // Remove links [text](url) -> text
      .replace(/<[^>]*>/g, "") // Remove HTML/JSX tags
      .trim(); // Remove leading/trailing spaces

    // Get the first paragraph (text before double newline)
    const firstParagraph = cleanContent.split("\n\n")[0];
    // Limit description to 160 characters for SEO best practices
    description = firstParagraph
      ? firstParagraph.substring(0, 160) + "..."
      : "";
  }

  // Extract first image from content if not available in metadata
  if (!image && contentData.content) {
    // Look for markdown image syntax ![alt](url) or HTML img src
    const imageMatch =
      contentData.content.match(/!\[.*?\]\((.+?)\)/) || // Markdown image
      contentData.content.match(/src=["']([^"']+)["']/); // HTML img tag
    if (imageMatch) {
      // Extract the URL from the matched pattern
      image = imageMatch[1];
    }
  }

  // Return cleaned and trimmed SEO attributes
  return {
    title: title.trim(),
    description: description.trim(),
    image: image.trim(),
  };
}

/**
 * TASK: Convert diary content to renderable data
 *
 * The content coming from `/cms/diary` is in MDX (Markdown with Embedded Components) format. This function help render that content.
 *
 * Known MDX components are:
 * - \<YoutubeEmbed />
 * - \<InstagramEmbed />
 * - \<TiktokEmbed />
 * - \<TwitterEmbed />
 */
// export function renderDiaryContent(contentData) {
//   // Return empty structure if no content data provided
//   if (!contentData || !contentData.content) {
//     return {
//       processedContent: "",
//       components: {},
//       metadata: {},
//     };
//   }


//   let processedContent = contentData.content;

//   const components = {
//     // YouTube video embed component - renders as iframe
//     YoutubeEmbed: ({ videoId, title = "YouTube Video" }) => {
//       // Create YouTube embed URL
//       const embedUrl = `https://www.youtube.com/embed/${videoId}`;
//       // Return React element (will be JSX when used in component)
//       return {
//         type: "iframe",
//         props: {
//           src: embedUrl,
//           title: title,
//           width: "100%",
//           height: "315",
//           frameBorder: "0",
//           allowFullScreen: true,
//         },
//       };
//     },

//     // Instagram post embed component - uses Instagram's embed API
//     InstagramEmbed: ({ postId, caption = "" }) => {
//       // Create Instagram embed URL
//       const embedUrl = `https://www.instagram.com/p/${postId}/embed/`;
//       // Return iframe for Instagram post
//       return {
//         type: "iframe",
//         props: {
//           src: embedUrl,
//           width: "100%",
//           height: "400",
//           frameBorder: "0",
//           scrolling: "no",
//           allowTransparency: true,
//         },
//       };
//     },

//     // TikTok video embed component - uses TikTok's embed API
//     TiktokEmbed: ({ videoId, username = "" }) => {
//       // Create TikTok embed URL
//       const embedUrl = `https://www.tiktok.com/embed/v2/${videoId}`;
//       // Return iframe for TikTok video
//       return {
//         type: "iframe",
//         props: {
//           src: embedUrl,
//           width: "100%",
//           height: "500",
//           frameBorder: "0",
//           scrolling: "no",
//           allowFullScreen: true,
//         },
//       };
//     },

//     // Twitter tweet embed component - uses Twitter's embed API
//     TwitterEmbed: ({ tweetId, username = "" }) => {
//       // For Twitter, we'll use a placeholder approach since Twitter's embed requires special handling
//       // In a real app, you'd use Twitter's widget.js or a Twitter embed library
//       return {
//         type: "div",
//         props: {
//           className: "twitter-embed-placeholder",
//           children: `Twitter Post: ${tweetId}`,
//           style: {
//             border: "1px solid #ccc",
//             padding: "20px",
//             borderRadius: "8px",
//             backgroundColor: "#f9f9f9",
//           },
//         },
//       };
//     },

//     // Enhanced image component with automatic optimization
//     img: ({ src, alt = "", ...props }) => ({
//       type: "img",
//       props: {
//         src: getSizeOptimizedImageUrl(src, CDN_WISATA_IMG_SIZE.MD), // Auto-optimize images to medium size
//         alt: alt, // Alt text for accessibility
//         loading: "lazy", // Lazy load images for performance
//         style: { maxWidth: "100%", height: "auto" }, // Responsive images
//         ...props, // Spread any additional props
//       },
//     }),

//     // Enhanced paragraph component
//     p: ({ children, ...props }) => ({
//       type: "p",
//       props: {
//         style: { marginBottom: "1rem", lineHeight: "1.6" },
//         children,
//         ...props,
//       },
//     }),

//     // Enhanced heading components
//     h1: ({ children, ...props }) => ({
//       type: "h1",
//       props: {
//         style: { fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem" },
//         children,
//         ...props,
//       },
//     }),

//     h2: ({ children, ...props }) => ({
//       type: "h2",
//       props: {
//         style: {
//           fontSize: "1.5rem",
//           fontWeight: "bold",
//           marginBottom: "0.75rem",
//         },
//         children,
//         ...props,
//       },
//     }),
//   };

//   // Extract and calculate metadata about the content
//   const metadata = {
//     seo: getDiaryContentSEOAttributes(contentData), // SEO attributes
//     wordCount: processedContent.split(/\s+/).length, // Count words in content
//     readingTime: Math.ceil(processedContent.split(/\s+/).length / 200), // Estimate reading time (~200 words/min)
//     publishedAt: contentData.published_at, // Publication date
//     updatedAt: contentData.updated_at, // Last update date
//     tags: contentData.tags || [], // Content tags
//     author: contentData.author || {}, // Author information
//   };

//   // Return processed content with all necessary data for modern MDX rendering
//   return {
//     processedContent, // The MDX content ready for evaluation with @mdx-js/mdx
//     components, // Component definitions for MDX (compatible with evaluate function)
//     metadata, // Calculated metadata
//     rawContent: contentData.content, // Original unprocessed content
//   };
// }

export function renderDiaryContent(contentData) {
  if (!contentData || !contentData.content) {
    return {
      processedContent: "",
      metadata: {},
      rawContent: "",
    };
  }

  const processedContent = contentData.content;

  const metadata = {
    seo: getDiaryContentSEOAttributes(contentData),
    wordCount: processedContent.split(/\s+/).length,
    readingTime: Math.ceil(processedContent.split(/\s+/).length / 200),
    publishedAt: contentData.published_at,
    updatedAt: contentData.updated_at,
    tags: contentData.tags || [],
    author: contentData.author || {},
  };

  return {
    processedContent,
    metadata,
    rawContent: contentData.content,
  };
}
