import Navigation from "@/components/Navigation";

interface Header {
  text: string;
}

export default function Header({ text }: Header) {
  return (

    <div className="Header">
      <div>
        <h1 className="PageHeader">{text}</h1>
      </div>
      <div>
        <Navigation />
      </div>

    </div>

  );
}
