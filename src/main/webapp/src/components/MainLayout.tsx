import { Box, BoxTypes, Heading, Page, PageContent, ResponsiveContext } from "grommet";
import { PropsWithChildren, useContext } from "react";

const MainLayout = ({ children }: PropsWithChildren<{}>) => (
  <Page
      kind='wide'>
    <PageContent
        pad='none'>{
          children
        }</PageContent>
  </Page>);
  
const Heading1 = ({ children }: PropsWithChildren<{}>) => {
  
  const size = useContext(ResponsiveContext);
  
  return (
    <Heading
        level='4'
        color='accent-3'
        margin={ {
            top: size === 'small' ? 'medium' : 'small',
            bottom: 'small',
            horizontal: size === 'small' ? '0.5rem' : undefined
          } }>{
            children
          }</Heading>
  );
   
}

const Content = ({ children, ...props }: PropsWithChildren<BoxTypes>) => {

  const size = useContext(ResponsiveContext);

  return (
      <Box
          { ...props }
          pad={ { horizontal: '0.5rem', bottom: size === 'small' ? 'medium' : 'small' } }>{
            children
          }</Box>
    );
  
}

export { MainLayout, Heading1, Content };
