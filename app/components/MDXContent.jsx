import React from "react";
import { getSizeOptimizedImageUrl } from "../../utils/cms.js";

// Custom components for MDX embeds
const YoutubeEmbed = ({ videoId, ...props }) => (
  <div className="embed-placeholder">
    <h4>YouTube Video</h4>
    <p>Video ID: {videoId}</p>
    <p>This would render a YouTube embed in production</p>
  </div>
);

const InstagramEmbed = ({ postId, ...props }) => (
  <div className="embed-placeholder">
    <h4>Instagram Post</h4>
    <p>Post ID: {postId}</p>
    <p>This would render an Instagram embed in production</p>
  </div>
);

const TiktokEmbed = ({ videoId, url, ...props }) => (
  <div className="embed-placeholder">
    <h4>TikTok Video</h4>
    <p>URL: {url || videoId}</p>
    <p>This would render a TikTok embed in production</p>
  </div>
);

const TwitterEmbed = ({ tweetId, ...props }) => (
  <div className="embed-placeholder">
    <h4>Twitter/X Post</h4>
    <p>Tweet ID: {tweetId}</p>
    <p>This would render a Twitter embed in production</p>
  </div>
);

// Enhanced markdown-like renderer that handles images properly
function renderEnhancedMarkdown(content) {
  if (!content) return [];

  const lines = content.split("\n");
  const elements = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) continue;

    // Images - ![alt](url)
    if (line.match(/^!\[.*?\]\(.*?\)$/)) {
      const imageMatch = line.match(/!\[(.*?)\]\((.*?)\)/);
      if (imageMatch) {
        const [, alt, src] = imageMatch;
        const optimizedSrc = getSizeOptimizedImageUrl(src, "lg");
        elements.push(
          <img
            key={i}
            src={optimizedSrc}
            alt={alt || "Diary image"}
            style={{
              width: "100%",
              height: "auto",
              borderRadius: "0.5rem",
              margin: "1rem 0",
            }}
            onError={(e) => {
              if (e.target.src !== src) {
                e.target.src = src;
              }
            }}
          />
        );
      }
      continue;
    }

    // Headers
    if (line.startsWith("### ")) {
      elements.push(<h3 key={i}>{line.substring(4)}</h3>);
    } else if (line.startsWith("## ")) {
      elements.push(<h2 key={i}>{line.substring(3)}</h2>);
    } else if (line.startsWith("# ")) {
      elements.push(<h1 key={i}>{line.substring(2)}</h1>);
    }
    // Custom components
    else if (line.includes("<TiktokEmbed")) {
      const urlMatch = line.match(/url="([^"]*)"/);
      const videoIdMatch = line.match(/videoId="([^"]*)"/);
      elements.push(
        <TiktokEmbed
          key={i}
          url={urlMatch?.[1] || ""}
          videoId={videoIdMatch?.[1] || ""}
        />
      );
    } else if (line.includes("<YoutubeEmbed")) {
      const videoIdMatch = line.match(/videoId="([^"]*)"/);
      elements.push(<YoutubeEmbed key={i} videoId={videoIdMatch?.[1] || ""} />);
    } else if (line.includes("<InstagramEmbed")) {
      const postIdMatch = line.match(/postId="([^"]*)"/);
      elements.push(<InstagramEmbed key={i} postId={postIdMatch?.[1] || ""} />);
    } else if (line.includes("<TwitterEmbed")) {
      const tweetIdMatch = line.match(/tweetId="([^"]*)"/);
      elements.push(<TwitterEmbed key={i} tweetId={tweetIdMatch?.[1] || ""} />);
    }
    // List items
    else if (line.startsWith("- ")) {
      const nextItems = [];
      let j = i;

      // Collect consecutive list items
      while (j < lines.length && lines[j].trim().startsWith("- ")) {
        const listLine = lines[j].trim().substring(2);
        // Handle bold text **text**
        let processedLine = listLine.replace(
          /\*\*(.*?)\*\*/g,
          "<strong>$1</strong>"
        );
        nextItems.push(
          <li key={j} dangerouslySetInnerHTML={{ __html: processedLine }} />
        );
        j++;
      }

      elements.push(<ul key={i}>{nextItems}</ul>);
      i = j - 1; // Skip the items we just processed
    }
    // Regular paragraphs
    else {
      // Handle bold text **text**
      let processedLine = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      // Handle italic text *text*
      processedLine = processedLine.replace(/\*(.*?)\*/g, "<em>$1</em>");

      elements.push(
        <p key={i} dangerouslySetInnerHTML={{ __html: processedLine }} />
      );
    }
  }

  return elements;
}

export default function MDXContent({ content }) {
  const [renderedContent, setRenderedContent] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function processContent() {
      if (!content) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Use enhanced markdown rendering with proper image support
        const elements = renderEnhancedMarkdown(content);
        setRenderedContent(elements);
      } catch (err) {
        console.error("Error processing content:", err);
        // Fallback to plain text
        setRenderedContent(
          content.split("\n").map((line, index) => <p key={index}>{line}</p>)
        );
      } finally {
        setLoading(false);
      }
    }

    processContent();
  }, [content]);

  if (loading) {
    return <div className="loading">Loading content...</div>;
  }

  if (!renderedContent || renderedContent.length === 0) {
    return <div>No content available</div>;
  }

  return <div>{renderedContent}</div>;
}
