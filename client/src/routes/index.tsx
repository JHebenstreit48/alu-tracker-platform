import { createBrowserRouter } from "react-router-dom";
import App from "@/App";
import Home from '@/pages/Home'
import ErrorPage from "@/pages/ErrorPage";
// import Manufacturers from "@/pages/Manufacturers";

// ================================================================================
//                          Manufacturers Page Start
// ================================================================================

import Brands from "@/pages/Manufacturers/Brands";
import BrandInfo from "@/pages/Manufacturers/BrandInfo";

// ================================================================================
//                          Manufacturers Page End
// ================================================================================

import CarsByClass from "@/pages/CarInfo/CarsByClass";
import CarDetail from "@/pages/CarInfo/CarDetail";
import GarageLevels from "@/pages/GarageLevels";
import LegendStorePrices from "@/pages/LegendStore";

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
          path: "/manufacturers/manufacturersmap", // temporary until you rename later
          element: <Brands />,
        },
        {
          path: "/manufacturers/:slug", // 🔥 dynamic route!
          element: <BrandInfo />, // ✅ Correct now - BrandInfo is the full brand page
        },
        {
          path: "/carsbyclass",
          element: <CarsByClass />,
        },
        {
          path: "/cars/:id",
          element: <CarDetail />,
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
