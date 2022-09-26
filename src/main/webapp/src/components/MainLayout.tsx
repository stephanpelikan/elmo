import { Box, BoxExtendedProps, BoxTypes, Grid, Heading as GrommetHeading, Page, PageContent } from "grommet";
import { PropsWithChildren } from "react";
import useResponsiveScreen from '../utils/responsiveUtils';

const MainLayout = ({ children, ...props }: PropsWithChildren<BoxExtendedProps>) => {

  const { isPhone } = useResponsiveScreen();
  
  return (
      <Page
          kind='wide'>
        <PageContent
            pad={ isPhone ? 'small' : 'medium' }
            { ...props }>
            <Grid>{
              children
            }</Grid></PageContent>
      </Page>);
      
}
  
const SubHeading = ({ children }: PropsWithChildren<{}>) => {
  
  const { isPhone } = useResponsiveScreen();
  
  return (
    <GrommetHeading
        level='4'
        color='accent-3'
        margin={ {
            top: isPhone ? 'medium' : 'small',
            bottom: 'small',
          } }>{
            children
          }</GrommetHeading>
  );
   
}

const Heading = ({ children }: PropsWithChildren<{}>) => {
  
  const { isPhone } = useResponsiveScreen();
  
  return (
    <GrommetHeading
        level='2'
        margin={ {
            top: isPhone ? 'medium' : 'small',
            bottom: 'small',
          } }>{
            children
          }</GrommetHeading>
  );
   
}

const Content = ({ children, ...props }: PropsWithChildren<BoxTypes>) => {

  const { isPhone } = useResponsiveScreen();

  return (
      <Box
          { ...props }
          pad={ { bottom: isPhone ? 'medium' : 'small' } }>{
            children
          }</Box>
    );
  
}

export { MainLayout, Heading, SubHeading, Content };
