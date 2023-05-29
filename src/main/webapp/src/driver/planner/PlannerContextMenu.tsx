import React, { LegacyRef, PropsWithChildren } from "react";
import { Box } from "grommet";
import useResponsiveScreen from "../../utils/responsiveUtils";

const PlannerContextMenu = React.forwardRef(({
    children
  }: PropsWithChildren<{}>, ref: LegacyRef<HTMLDivElement>
) => {
  const { isPhone } = useResponsiveScreen();
  return <Box
        ref={ ref }
        style={ { position: 'relative' } }>
      <Box
          style={ {
              position: 'absolute',
              right: '2.125rem',
              top: '-0.525rem',
              zIndex: 2,
            } }
          elevation="large"
          round={ isPhone ? 'large' : 'medium' }
          align="center"
          justify="center"
          pad="0.2rem"
          gap="0.2rem"
          border={ { color: 'dark-3', size: '3px' } }
          background="dark-4">
        { children }
      </Box>
    </Box>;
});

export { PlannerContextMenu };
