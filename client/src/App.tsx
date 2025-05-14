import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import Footer from "@/components/Shared/Footer";
import LoadingSpinner from "@/components/Shared/LoadingSpinner"; // adjust path if needed

import '@/SCSS/NavHeaderFooterError/Header.scss';
import '@/SCSS/PageAndHome/Page.scss';
import '@/SCSS/NavHeaderFooterError/Navigation.scss';
import '@/SCSS/NavHeaderFooterError/Error.scss';
import '@/SCSS/NavHeaderFooterError/Footer.scss';

export default function App() {
  return (
    <>
      <Suspense fallback={<LoadingSpinner />}>
        <Outlet />
      </Suspense>
      <Footer />
    </>
  );
}
