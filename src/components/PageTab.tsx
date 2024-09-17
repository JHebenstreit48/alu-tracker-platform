import { useEffect } from 'react';

function PageTab(props: { title: string, children: React.ReactNode }) {


    useEffect (() => {

        document.title = `${props.title} | Asphalt Legends Unite`;
        window.scrollTo(0, 0);
  
      }, []);

      return (

        <>

        <div>
            {props.children}
        </div>
        
        </>

      )
    
}

export default PageTab;
