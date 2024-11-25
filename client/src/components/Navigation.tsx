import { useLocation, useNavigate } from "react-router-dom";
import '../CSS/Navigation.css';

interface INavigationButtons {
    label: string;
}

const NavigationButtons = (props: INavigationButtons & { isActive: boolean; onClick: () => void }) => {
    return (
        <button
            onClick={props.onClick}
            type="button"
            className={`btn btn-primary btn-lg ${props.isActive ? "active-link" : ""}`}
        >
            {props.label}
        </button>
    );
};

export default function Navigation() {
    const navigation = useNavigate();
    const currentPage = useLocation().pathname;

    const NavLinks = [
        { label: 'Home', path: () => navigation('/'), location: '/' },
        { label: 'Manufacturers', path: () => navigation('/manufacturers'), location: '/manufacturers' },
        { label: 'Cars By Class', path: () => navigation('/carsbyclass'), location: '/carsbyclass' },
        { label: 'Garage Levels', path: () => navigation('/garagelevels'), location: '/garagelevels' },
    ];

    return (
        <>
            <div>
                <ul className="nav-css">
                    {NavLinks.map((navLinks) => (
                        <NavigationButtons
                            key={navLinks.label}
                            onClick={navLinks.path}
                            label={navLinks.label}
                            isActive={currentPage === navLinks.location}
                        />
                    ))}
                </ul>
            </div>
        </>
    );
}
