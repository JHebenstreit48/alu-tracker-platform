import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Home from '../pages/Home'
import ErrorPage from "../pages/ErrorPage";
import Manufacturers from "../pages/Manufacturers";

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
        ]
    }
])
