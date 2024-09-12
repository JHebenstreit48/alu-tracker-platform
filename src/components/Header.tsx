import Navigation from "./Navigation";
import '../CSS/Header.css';

interface Header {
  text: string;
}

export default function Header({ text }: Header) {
  return (
    
    <div className="Header">
      <h1>{text}</h1>
      <Navigation />
    </div>
    
  );
}
