import { Box, DataTable, DataTableExtendedProps, Text } from 'grommet';
import { SnapAlignBox, SnapScrollingGrid } from './SnapScrolling';
import useResponsiveScreen from '../utils/responsiveUtils';
import { forwardRef, PropsWithChildren, ReactNode, UIEventHandler } from 'react';

interface SnapScrollingDataTableProps<TRowType = any> extends PropsWithChildren<DataTableExtendedProps<TRowType>> {
  additionalHeader?: ReactNode | undefined;
  headerHeight: string;
  phoneMargin: string;
  onScroll?: UIEventHandler<any> | undefined;
};

const SnapScrollingDataTable = forwardRef(({
    phoneMargin,
    headerHeight,
    additionalHeader,
    columns,
    onScroll,
    children,
    ...props
  }: SnapScrollingDataTableProps, ref) => {

  const { isPhone, isNotPhone } = useResponsiveScreen();

  const columnsWidth = columns.reduce((width, column) => (width !== '' ? width + ' + ' + column.size : column.size), '');
  const tableWidth = `calc(${columnsWidth})`;
  const totalWidth = `calc(${columnsWidth} + 2 * ${phoneMargin})`;
  
  const dataTableColumns = columns.map(column => ({ ...column, header: undefined }));
  
  return (columns
    ? <SnapScrollingGrid
          fill
          snapDirection='horizontal'>
        <Box
            fill={ isNotPhone ? 'horizontal' : undefined }
            style={ {
              position: 'relative',
              width: isPhone ? totalWidth : undefined,
              } }
            background='dark-3'
            align="center">
          {
            additionalHeader
          }
          <Box
              fill
              direction='row'
              style={
                isNotPhone
                    ? {
                        maxWidth: tableWidth,
                        maxHeight: headerHeight,
                        minHeight: headerHeight,
                        marginLeft: 'auto',
                        marginRight: 'auto',
                        zIndex: '2',
                      }
                    : {
                        maxHeight: headerHeight,
                        minHeight: headerHeight,
                    } }
              pad={
                isPhone
                    ? { horizontal: phoneMargin }
                    : undefined }>{
            columns.map((column, index) =>
              <SnapAlignBox
                  pad={ { horizontal: isPhone ? 'medium' : 'xsmall' } }
                  key={ `column${index}` }
                  align="center"
                  justify='center'
                  height="100%"
                  width={ column.size }
                  snapAlign='center'>
                <Text
                    weight='bold'
                    size='large'
                    color='light-2'
                    truncate='tip'>{
                  column.header
                }</Text>
              </SnapAlignBox>)
            }</Box>
        </Box>
        <Box
            style={ { position: 'relative' }}
            fill={ isNotPhone }
            overflow={ { vertical: 'auto' } }
            ref={ ref as any }
            onScroll={ onScroll }>
          <DataTable
              fill
              ref={ undefined as any }
              pad='0'
              style={ {
                maxWidth: tableWidth,
                marginLeft: 'auto',
                marginRight: 'auto'
              } }
              background={ {
                body: ['white', 'light-2']
              } }
              columns={ dataTableColumns }
              { ...props } />
        </Box>
        { children }
      </SnapScrollingGrid>
    : <></>);
  
});

export { SnapScrollingDataTable };
