import '../CSS/BackToTop.css';

const BackToTop: React.FC = () => {
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'instant'
        });
    };

    return (

        <>
        
        <div className="BackToTop">
            <a onClick={scrollToTop} className="back-to-top-button">
                Back to Top
            </a>
        </div>
        
        </>
        
    );
};

export default BackToTop;
