import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getDiaryContentById } from "../../api/cms.js";
import {
  getDiaryContentSEOAttributes,
  renderDiaryContent,
  getSizeOptimizedImageUrl,
} from "../../utils/cms.js";
import MDXContent from "../components/MDXContent.jsx";

function EntryPage() {
  const { id } = useParams();
  const [diary, setDiary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDiary() {
      try {
        setLoading(true);
        const data = await getDiaryContentById(parseInt(id));

        // Handle both single object and array responses
        const diaryData = Array.isArray(data) ? data[0] : data;
        setDiary(diaryData);
      } catch (err) {
        setError("Failed to load diary entry. Please try again later.");
        console.error("Error fetching diary:", err);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchDiary();
    }
  }, [id]);

  if (loading) {
    return <div className="loading">Loading diary entry...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <h2>Oops! Something went wrong</h2>
        <p>{error}</p>
        <Link to="/" className="back-button">
          ← Back to Feed
        </Link>
      </div>
    );
  }

  if (!diary) {
    return (
      <div className="error">
        <h2>Diary entry not found</h2>
        <p>The requested diary entry could not be found.</p>
        <Link to="/" className="back-button">
          ← Back to Feed
        </Link>
      </div>
    );
  }

  const seoData = getDiaryContentSEOAttributes(diary);
  const contentData = renderDiaryContent(diary);
  const optimizedCoverImage = diary.cover_image
    ? getSizeOptimizedImageUrl(diary.cover_image, "lg")
    : null;

  return (
    <div>
      <Link to="/" className="back-button">
        ← Back to Feed
      </Link>

      <article className="diary-content">
        <header>
          <h1>{seoData.title || "Untitled Entry"}</h1>
          {diary.created_at && (
            <div className="diary-meta" style={{ marginBottom: "2rem" }}>
              {new Date(diary.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          )}
        </header>

        {optimizedCoverImage && (
          <img
            src={optimizedCoverImage}
            alt={seoData.title || "Diary entry cover"}
            onError={(e) => {
              // Fallback to original image if optimized version fails
              if (e.target.src !== diary.cover_image) {
                e.target.src = diary.cover_image;
              }
            }}
          />
        )}

        <div className="diary-content-body">
          <MDXContent content={contentData.processedContent} />
        </div>
      </article>
    </div>
  );
}

export default EntryPage;
