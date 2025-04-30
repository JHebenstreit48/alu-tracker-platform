import '@/SCSS/MiscellaneousStyle/LoadingSpinner.scss';

const LoadingSpinner: React.FC = () => {
    return (
        <div className="spinnerContainer">
            <div className="loadingSpinner"></div>
        </div>
    );
};

export default LoadingSpinner;