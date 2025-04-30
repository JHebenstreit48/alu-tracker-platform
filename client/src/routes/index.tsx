import { createBrowserRouter } from "react-router-dom";
import App from "@/App";
import Home from '@/pages/MainPages/Home/Home'
import ErrorPage from "@/pages/Error/ErrorPage";
// import Manufacturers from "@/pages/Manufacturers";

// ================================================================================
//                          Manufacturers Page Start
// ================================================================================

import Brands from "@/pages/MainPages/Brands/Brands";
import BrandInfo from "@/pages/MainPages/Brands/BrandInfo";

// ================================================================================
//                          Manufacturers Page End
// ================================================================================

import Cars from "@/pages/MainPages/CarInfo/Cars";
import CarDetails from "@/pages/MainPages/CarInfo/CarDetails";
import GarageLevels from "@/pages/MainPages/GarageLevels/GarageLevels";
import LegendStorePrices from "@/pages/MainPages/LegendStore/LegendStore";

export const router = createBrowserRouter([
    {
      path: "/",
      element: <App />,
      errorElement: <ErrorPage />,
      children: [
        {
          index: true,
          element: <Home />,
        },
        {
          path: "/brands", // temporary until you rename later
          element: <Brands />,
        },
        {
          path: "/brands/:slug", // 🔥 dynamic route!
          element: <BrandInfo />, // ✅ Correct now - BrandInfo is the full brand page
        },
        {
          path: "/cars",
          element: <Cars />,
        },
        {
          path: "/cars/:id",
          element: <CarDetails />,
        },
        {
          path: "/garagelevels",
          element: <GarageLevels />,
        },
        {
          path: "/legendstoreprices",
          element: <LegendStorePrices />,
        },
      ],
    },
  ]);
