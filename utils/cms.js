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
  if (!originalUrl || !desiredSize) {
    return originalUrl;
  }

  try {
    if (originalUrl.includes(CDN_WISATA_URL)) {
      const sizeKey = Object.values(CDN_WISATA_IMG_SIZE).includes(desiredSize)
        ? desiredSize
        : CDN_WISATA_IMG_SIZE.MD;

      const lastDotIndex = originalUrl.lastIndexOf(".");

      if (lastDotIndex === -1) return originalUrl;

      const baseUrl = originalUrl.substring(0, lastDotIndex);
      const extension = originalUrl.substring(lastDotIndex);

      return `${baseUrl}_${sizeKey}${extension}`;
    }

    if (originalUrl.includes(CDN_TWITTER_URL)) {
      const sizeKey = Object.values(CDN_TWITTER_IMG_SIZE).includes(desiredSize)
        ? desiredSize
        : CDN_TWITTER_IMG_SIZE.MEDIUM;

      const url = new URL(originalUrl);

      url.searchParams.set("name", sizeKey);

      return url.toString();
    }

    return originalUrl;
  } catch (error) {
    console.error("Error optimizing image URL:", error);
    return originalUrl;
  }
}

/**
 * TASK: Extracts SEO attributes from diary content
 */
export function getDiaryContentSEOAttributes(contentData) {
  if (!contentData) {
    return {
      title: "",
      description: "",
      image: "",
    };
  }

  let title = contentData.meta.title || "Title";
  let description = contentData.meta.description || contentData.excerpt || "";
  let image = contentData.meta.featured_image || contentData.image || "";

  if (!title && contentData.content) {
    const titleMatch = contentData.content.match(/^#\s+(.+)$/m);
    if (titleMatch) {
      title = titleMatch[1].trim();
    }
  }

  if (!description && contentData.content) {
    const cleanContent = contentData.content
      .replace(/#{1,6}\s+/g, "")
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/\*(.+?)\*/g, "$1")
      .replace(/\[(.+?)\]\(.+?\)/g, "$1")
      .replace(/<[^>]*>/g, "")
      .trim();

    const firstParagraph = cleanContent.split("\n\n")[0];

    description = firstParagraph
      ? firstParagraph.substring(0, 160) + "..."
      : "";
  }

  if (!image && contentData.content) {
    const imageMatch =
      contentData.content.match(/!\[.*?\]\((.+?)\)/) ||
      contentData.content.match(/src=["']([^"']+)["']/);
    if (imageMatch) {
      image = imageMatch[1];
    }
  }

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

export function renderDiaryContent(contentData) {
  if (!contentData || !contentData.content) {
    return {
      processedContent: "",
      metadata: {},
      rawContent: "",
    };
  }

  let processedContent = contentData.content;

  //fix bulletpoint
  processedContent = processedContent.replace(
    /(\n\s*-\s.+?)\n\s*\n(?=\s*-\s)/g,
    "$1\n"
  );

  // Normalize bullet inden
  processedContent = processedContent.replace(/\n\s+-/g, "\n-");

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
