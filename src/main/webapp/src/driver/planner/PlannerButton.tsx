import React, { MouseEvent } from "react";
import { Box } from "grommet";
import { Icon } from "grommet-icons";
import { BackgroundType } from "grommet/utils";

const PlannerButton = ({
    icon,
    action,
    background = 'status-ok'
  }: {
    icon: Icon,
    action: (event: MouseEvent) => void,
    background?: BackgroundType,
  }) => {
    const IconTag = icon;
    return <Box
          style={ { position: 'relative' } }>
        <Box
            style={ {
                position: 'absolute',
                right: '2.5rem',
                top: '-0.15rem',
                zIndex: 1
              } }
            onMouseDownCapture={ (event) => action(event) }
            round="full"
            overflow="hidden"
            align="center"
            justify="center"
            width="2.2rem"
            height="2.2rem"
            border={ { color: 'accent-3', size: '3px' } }
            background={ background }>
          <IconTag
              color="white"
              size="18rem" />
        </Box>
      </Box>;
  };

export { PlannerButton };
