import { MouseEvent } from "react";
import { Box, Stack } from "grommet";
import { Checkmark, Close, FormCheckmark, FormClose, Icon } from "grommet-icons";
import { BackgroundType } from "grommet/utils";

const PlannerButton = ({
    inContextMenu = false,
    showBorder = true,
    icon,
    iconSize = '18rem',
    iconAddition,
    action,
    background = 'status-ok'
  }: {
    inContextMenu?: boolean,
    showBorder?: boolean,
    icon: Icon,
    iconSize?: "small" | "medium" | "large" | "xlarge" | string,
    iconAddition?: "confirm" | "cancel",
    action: (event: MouseEvent) => void,
    background?: BackgroundType,
  }) => {
    const IconTag = icon;
    return (<Box
                style={ { position: 'relative' } }>
              <Box
                  style={
                      inContextMenu
                          ? undefined
                          : {
                              position: 'absolute',
                              right: '2.5rem',
                              top: '-0.15rem',
                              zIndex: 1
                            }
                      }
                  onMouseDownCapture={ (event) => action(event) }
                  round="full"
                  overflow="hidden"
                  align="center"
                  justify="center"
                  width="2.2rem"
                  height="2.2rem"
                  border={ {
                      color: showBorder ? 'accent-3' : 'transparent',
                      size: '3px'
                    } }
                  background={ background }>
                {
                  iconAddition
                    ? <Box
                          style={ { position: 'relative' } }>
                        <IconTag
                            color="white"
                            size={ iconSize } />
                        <Box
                            style={ { position: 'absolute', 'bottom': '-0.3rem', 'right': '-0.3rem' } }>
                          {
                            iconAddition === "confirm"
                                ? <FormCheckmark
                                      size={ iconSize }
                                      color="black" />
                                : <FormClose
                                      size={ iconSize }
                                      color="black" />
                          }
                        </Box>
                      </Box>
                    : <IconTag
                          color="white"
                          size={ iconSize } />
                }
              </Box>
            </Box>);
  };

export { PlannerButton };
