import { useEffect, useRef } from "react";

export const mdxComponents = {
  YoutubeEmbed: ({ url, title = "YouTube Video" }) => {
    //YoutubeEmbed videoId: https://www.youtube.com/embed/lhoRAY7LmcY?si=LaHDZ1KnLiOYsI5_
    return (
      <div className="my-6">
        <iframe
          src={url}
          title={title}
          className="w-full h-64 md:h-96 rounded-lg"
          frameBorder="0"
          allowFullScreen
        />
      </div>
    );
  },

  InstagramEmbed: ({ url }) => {
    //<InstagramEmbed url="https://www.instagram.com/p/DFe-1cnSRQE/" />"
    // console.log("IG id:", url);
    const containerRef = useRef();
    useEffect(() => {
      const script = document.createElement("script");
      script.src = "https://www.instagram.com/embed.js";
      script.async = true;
      script.onload = () => {
        if (window.instgrm) {
          window.instgrm.Embeds.process();
        }
      };
      document.body.appendChild(script);
    }, [url]);

    return (
      <div ref={containerRef} className="my-6 flex justify-center">
        <blockquote
          className="instagram-media"
          data-instgrm-permalink={url}
          data-instgrm-version="14"
          style={{ background: "#FFF", border: 0, margin: 0 }}
        />
      </div>
    );
  },

  TiktokEmbed: ({ url }) => {
    // console.log("TiktokEmbed videoId:", url);
    // <TiktokEmbed url="https://www.tiktok.com/@coastercuzzies/video/7232275060357172523" />;
    const match = url?.match(/\/video\/(\d+)/);
    const videoId = match?.[1];

    const embedUrl = `https://www.tiktok.com/embed/v2/${videoId}`;
    return (
      <div className="my-6 flex justify-center">
        <div className="w-full max-w-md aspect-[9/16]">
          <iframe
            src={embedUrl}
            className="w-full h-full rounded-lg"
            scrolling="no"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    );
  },

  TwitterEmbed: ({ url }) => {
    console.log("TwitterEmbed url:", url);
    //<TwitterEmbed url="https://twitter.com/McDonalds_ID/status/1898282462884905210" />"
    const containerRef = useRef();

    useEffect(() => {
      // Load Twitter widgets script only once
      if (!window.twttr) {
        const script = document.createElement("script");
        script.src = "https://platform.twitter.com/widgets.js";
        script.async = true;
        document.body.appendChild(script);
      } else {
        window.twttr.widgets.load(containerRef.current);
      }
    }, [url]);

    return (
      <div ref={containerRef} className="my-6">
        <blockquote className="twitter-tweet">
          <a href={url}></a>
        </blockquote>
      </div>
    );
  },

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
