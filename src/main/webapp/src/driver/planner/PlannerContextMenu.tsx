import { Box } from "grommet";
import { forwardRef, LegacyRef, PropsWithChildren } from "react";
import useResponsiveScreen from "../../utils/responsiveUtils";

const PlannerContextMenu = forwardRef(({
    inSelection = false,
    children
  }: PropsWithChildren<{inSelection?: boolean}>, ref: LegacyRef<HTMLDivElement>
) => {
  const { isPhone } = useResponsiveScreen();
  return <Box
        ref={ ref }
        width={ inSelection ? "3rem" : undefined }
        style={ { position: 'relative' } }>
      <Box
          style={
            inSelection
                ? {
                    position: 'absolute',
                    right: '-0.35rem',
                    top: '-0.375rem',
                    zIndex: 4,
                  }
                : {
                    position: 'absolute',
                    right: '2.125rem',
                    top: '-0.525rem',
                    zIndex: 4,
                  }
            }
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
