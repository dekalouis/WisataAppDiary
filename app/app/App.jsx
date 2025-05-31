import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import FeedPage from "./pages/FeedPage.js";
import EntryPage from "./pages/EntryPage.js";
import Layout from "./components/Layout.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<FeedPage />} />
            <Route path="/diary/:id" element={<EntryPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
