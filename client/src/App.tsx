import { Suspense, useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Footer from "@/components/Shared/Footer";
import LoadingSpinner from "@/components/Shared/LoadingSpinner";

import "@/SCSS/NavHeaderFooterError/Header.scss";
import "@/SCSS/PageAndHome/Page.scss";
import "@/SCSS/NavHeaderFooterError/Navigation.scss";
import "@/SCSS/NavHeaderFooterError/Error.scss";
import "@/SCSS/NavHeaderFooterError/Footer.scss";

export default function App() {
  const location = useLocation();
  const [showFooter, setShowFooter] = useState(false);

  useEffect(() => {
    setShowFooter(false);
    const timer = setTimeout(() => setShowFooter(true), 50); // delay to wait for transition
    return () => clearTimeout(timer);
  }, [location.pathname]);
  
  return (
    <>
      <Suspense fallback={<LoadingSpinner />}>
        <Outlet />
      </Suspense>
      {showFooter && <Footer />}
    </>
  );
}
