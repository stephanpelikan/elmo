import { Box, BoxTypes, Heading, Page, PageContent } from "grommet";
import { PropsWithChildren } from "react";
import useResponsiveScreen from '../utils/responsiveUtils';

const MainLayout = ({ children }: PropsWithChildren<{}>) => (
  <Page
      kind='wide'>
    <PageContent
        pad='none'>{
          children
        }</PageContent>
  </Page>);
  
const Heading1 = ({ children }: PropsWithChildren<{}>) => {
  
  const { isPhone } = useResponsiveScreen();
  
  return (
    <Heading
        level='4'
        color='accent-3'
        margin={ {
            top: isPhone ? 'medium' : 'small',
            bottom: 'small',
            horizontal: isPhone ? '0.5rem' : undefined
          } }>{
            children
          }</Heading>
  );
   
}

const Content = ({ children, ...props }: PropsWithChildren<BoxTypes>) => {

  const { isPhone } = useResponsiveScreen();

  return (
      <Box
          { ...props }
          pad={ { horizontal: '0.5rem', bottom: isPhone ? 'medium' : 'small' } }>{
            children
          }</Box>
    );
  
}

export { MainLayout, Heading1, Content };
