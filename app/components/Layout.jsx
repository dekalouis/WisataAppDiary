import React from "react";
import { Link, useLocation } from "react-router-dom";

function Layout({ children }) {
  const location = useLocation();

  return (
    <div>
      <header className="header">
        <div className="container">
          <h1>WisataApp Diary</h1>
          <nav className="nav">
            <Link to="/">Home</Link>
            {location.pathname !== "/" && (
              <span style={{ color: "#718096" }}>/ Diary Entry</span>
            )}
          </nav>
        </div>
      </header>
      <main className="container">{children}</main>
    </div>
  );
}

export default Layout;
