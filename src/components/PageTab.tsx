import { useEffect } from 'react';
import Container from './Container';

function PageTab(props: { title: string, children: React.ReactNode }) {


    useEffect (() => {

        document.title = `${props.title} | Asphalt Legends Unite`;
        window.scrollTo(0, 0);
  
      }, []);

      return (

        <>

        <Container>
            {props.children}
        </Container>
        
        </>

      )
    
}

export default PageTab;
