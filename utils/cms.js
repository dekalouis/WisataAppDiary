const CDN_WISATA_URL = "https://cdn.wisata.app";
const CDN_TWITTER_URL = "https://pbs.twimg.com";
const CDN_WISATA_IMG_SIZE = {
  TH: "th",
  XS: "xs",
  SM: "sm",
  MD: "md",
  LG: "lg",
};

/**
 * TASK: Find available image size for Twitter CDN
 */
const CDN_TWITTER_IMG_SIZE = {
  THUMB: "thumb",
  SMALL: "small",
  MEDIUM: "medium",
  LARGE: "large",
  ORIG: "orig",
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
    const url = new URL(originalUrl);

    // Handle Wisata CDN
    if (url.origin === CDN_WISATA_URL) {
      const pathname = url.pathname;
      const lastDotIndex = pathname.lastIndexOf(".");

      if (lastDotIndex === -1) {
        return originalUrl;
      }

      const basePath = pathname.substring(0, lastDotIndex);
      const extension = pathname.substring(lastDotIndex);
      const sizeCode = Object.values(CDN_WISATA_IMG_SIZE).includes(desiredSize)
        ? desiredSize
        : CDN_WISATA_IMG_SIZE.MD;

      return `${url.origin}${basePath}_${sizeCode}${extension}`;
    }

    // Handle Twitter CDN
    if (url.origin === CDN_TWITTER_URL) {
      const sizeCode = Object.values(CDN_TWITTER_IMG_SIZE).includes(desiredSize)
        ? desiredSize
        : CDN_TWITTER_IMG_SIZE.MEDIUM;

      url.searchParams.set("name", sizeCode);
      return url.toString();
    }

    // Return original URL if not a supported CDN
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

  const { title, content, cover_image } = contentData;

  // Extract description from content (first paragraph or truncated content)
  let description = "";
  if (content) {
    // Remove MDX components and markdown syntax for description
    const cleanContent = content
      .replace(/<[^>]*>/g, "") // Remove HTML/JSX tags
      .replace(/[#*_`]/g, "") // Remove markdown syntax
      .replace(/\n/g, " ") // Replace newlines with spaces
      .trim();

    description =
      cleanContent.length > 160
        ? cleanContent.substring(0, 157) + "..."
        : cleanContent;
  }

  return {
    title: title || "",
    description,
    image: cover_image || "",
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
      hasEmbeds: false,
      components: [],
    };
  }

  const { content } = contentData;
  const embedRegex =
    /<(YoutubeEmbed|InstagramEmbed|TiktokEmbed|TwitterEmbed)\s+([^>]*)\s*\/>/g;
  const foundComponents = [];
  let processedContent = content;

  // Find all embed components
  let match;
  while ((match = embedRegex.exec(content)) !== null) {
    const [fullMatch, componentName, props] = match;
    foundComponents.push({
      type: componentName,
      props: props,
      fullMatch,
    });
  }

  return {
    processedContent,
    hasEmbeds: foundComponents.length > 0,
    components: foundComponents,
    originalContent: content,
  };
}
