import { Outlet } from "react-router-dom";
import Navigation from "./components/HeaderNav/Navigation";


export default function App() {

  return (
    <>
      <Navigation />
      <Outlet />
    </>
  )
}
