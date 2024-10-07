import '../CSS/BackToTop.css';

const BackToTop: React.FC = () => {
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <div className="BackToTop">
            <div onClick={scrollToTop} className="back-to-top-button">
                Back to Top
            </div>
        </div>
    );
};

export default BackToTop;
