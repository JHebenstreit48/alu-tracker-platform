import "@/SCSS/MiscellaneousStyle/LoadingSpinner.scss";

const LoadingSpinner: React.FC = () => {
  return (
    <div className="spinnerContainer">
      <div className="loadingSpinner"></div>
      <div className="smokeTrail"></div>
      <p className="loadingText">Revving up the engines...</p>
    </div>
  );
};

export default LoadingSpinner;
