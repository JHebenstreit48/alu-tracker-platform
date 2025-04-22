import { Outlet } from "react-router-dom";
import '@/SCSS/NavHeaderFooterError/Header.scss';
import '@/SCSS/PageAndHome/Page.scss';
import '@/SCSS/NavHeaderFooterError/Navigation.scss';
import '@/SCSS/NavHeaderFooterError/Error.scss';
import '@/SCSS/NavHeaderFooterError/Footer.scss'
import Footer from '@/components/Footer'

export default function App() {

  return (
    <>

    <Outlet />
    <Footer />
    </>

  )
}
