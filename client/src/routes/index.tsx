import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Home from '../pages/Home'
import ErrorPage from "../pages/ErrorPage";
import Manufacturers from "../pages/Manufacturers";
import CarsByClass from "../pages/CarsByClass";
import GarageLevels from "../pages/GarageLevels";
import CarDetail from "../pages/CarDetail";

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
                path: '/manufacturers',
                element: <Manufacturers />,
            },
            {
                path: '/carsbyclass',
                element: <CarsByClass />,
            },
            {
                path: "/cars/:id", // Individual car detail route
                element: <CarDetail />,
              },
            {
                path: '/garagelevels',
                element: <GarageLevels />,
            },
        ],
    },
]);
