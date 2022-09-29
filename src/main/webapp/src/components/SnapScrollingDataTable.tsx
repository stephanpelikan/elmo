import { Box, DataTable, DataTableProps } from 'grommet';
import { SnapAlignBox, SnapScrollingGrid } from './SnapScrolling';
import useResponsiveScreen from '../utils/responsiveUtils';

interface SnapScrollingDataTableProps extends DataTableProps<any> {
  phoneMargin: string;
};

const SnapScrollingDataTable = ({ phoneMargin, columns, ...props }: SnapScrollingDataTableProps) => {

  const { isPhone, isNotPhone } = useResponsiveScreen();

  const columnsWidth = columns.reduce((width, column) => (width !== '' ? width + ' + ' + column.size : column.size), '');
  const tableWidth = `calc(${columnsWidth})`;
  const totalWidth = `calc(${columnsWidth} + 2 * ${phoneMargin})`;
  
  const dataTableColumns = columns.map(column => ({ ...column, header: undefined }));
  
  return (columns
    ? <SnapScrollingGrid
          fill
          snapDirection='horizontal'
          rows={ [ 'xxsmall' ] }>
        <Box
            fill={ isNotPhone }
            style={
              isPhone
                  ? { width: totalWidth }
                  : undefined
            }
            background={ {
              color: 'accent-2',
              opacity: 'strong'
            } }
            align="center">
          <Box
              fill
              direction='row'
              style={
                isNotPhone
                    ? {
                        maxWidth: tableWidth,
                        marginLeft: 'auto',
                        marginRight: 'auto'
                      }
                    : undefined }
              pad={
                isPhone
                    ? { horizontal: phoneMargin }
                    : undefined }>{
            columns.map((column, index) =>
              <SnapAlignBox
                  pad={ isPhone ? 'medium' : 'small' }
                  key={ `column${index}` }
                  align="center"
                  width={ column.size }
                  snapAlign='center'>{
                column.header
              }</SnapAlignBox>)
            }</Box>
          </Box>
        <Box
            fill={ isNotPhone }
            overflow={ { vertical: 'auto' } }>
          <DataTable
              fill
              pad='0'
              style={ {
                maxWidth: tableWidth,
                position: 'relative',
                top: '0px' /*'-25px'*/,
                marginLeft: 'auto',
                marginRight: 'auto'
              } }
              background={ {
                body: ['white', 'light-2']
              } }
              columns={ dataTableColumns }
              { ...props } />
        </Box>
      </SnapScrollingGrid>
    : <></>);
  
};

export { SnapScrollingDataTable };
