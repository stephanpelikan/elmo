import { Box, Text } from "grommet";
import { BorderType, normalizeColor } from "grommet/utils";
import React, { CSSProperties, MouseEvent } from "react";
import styled from "styled-components";
import { useAppContext } from "../../AppContext";
import { CalendarHour, Selection } from "./PlannerTypes";
import { timeAsString, numberOfHoursBetween } from '../../utils/timeUtils';
import { UserAvatar } from "../../components/UserAvatar";
import { FormCheckmark, FormClose, FormDown, FormUp } from "grommet-icons";

const StyledSelectionBox = styled(Box)<{
    selectionBorderRadius: CSSProperties,
    isFirstHourOfSelection: boolean,
    currentHour: number,
  }>`
    border-top-left-radius: ${props => props.selectionBorderRadius.borderTopLeftRadius};
    border-top-right-radius: ${props => props.selectionBorderRadius.borderTopRightRadius};
    border-bottom-left-radius: ${props => props.selectionBorderRadius.borderBottomLeftRadius};
    border-bottom-right-radius: ${props => props.selectionBorderRadius.borderBottomRightRadius};
    position: absolute;
    box-sizing: content-box;
    left: -3px;
    top: ${props => props.isFirstHourOfSelection ? '-3px' : '0'};
    min-height: 100%;
    z-index: ${props => props.currentHour === 0 ? 2 : 1};
  `;

const ButtonBox = styled(Box)`
    position: absolute;
    right: 5px;
    bottom: -24px;
  `;

const DragBox = styled(Box)<{
    top?: boolean,
  }>`
    position: absolute;
    background-color: ${props => normalizeColor("brand", props.theme)};
    ${props => !props.top ? 'left: 3.5rem' : 'right: 5px'};
    ${props => props.top ? 'top: -16px' : 'bottom: -16px'};
    border: solid 3px ${props => normalizeColor("accent-3", props.theme)};
    width: 30px;
    height: 30px;
    border-radius: 15px;
    display: inline-block;
  `;

const SelectionBox = ({ hour, selection, mouseDownOnDrag, cancelSelection, acceptSelection, touchMove, touchEnd }: {
    hour: CalendarHour,
    selection: Selection,
    cancelSelection: (event: MouseEvent) => void,
    acceptSelection: (event: MouseEvent) => void,
    mouseDownOnDrag: (event: MouseEvent | TouchEvent, top: boolean) => void,
    touchMove: (event: TouchEvent) => void,
    touchEnd: (event: TouchEvent) => void,
  }) => {

    const { state } = useAppContext();

    const isFirstHourOfSelection = selection.startsAt.getTime() === hour.startsAt.getTime();
    const isLastHourOfSelection = selection.endsAt.getTime() === hour.endsAt.getTime();
    const selectionBorderRadius: CSSProperties = {};
    const selectionBorders: BorderType = [ {
        color: 'accent-3',
        style: "solid",
        size: '3px',
        side: 'vertical',
      } ];
    if (isFirstHourOfSelection) {
      selectionBorders.push({
          color: 'accent-3',
          style: "solid",
          size: '3px',
          side: 'top',
        });
      selectionBorderRadius.borderTopLeftRadius = '7px';
      selectionBorderRadius.borderTopRightRadius = '7px';
    }
    if (isLastHourOfSelection) {
      selectionBorders.push({
          color: 'accent-3',
          style: "solid",
          size: '3px',
          side: 'bottom',
        });
      selectionBorderRadius.borderBottomLeftRadius = '7px';
      selectionBorderRadius.borderBottomRightRadius = '7px';
    }
    const numberOfHours = numberOfHoursBetween(selection.startsAt, selection.endsAt);
    const currentHour = numberOfHoursBetween(hour.startsAt, selection.startsAt);

    return <StyledSelectionBox
              selectionBorderRadius={ selectionBorderRadius }
              isFirstHourOfSelection={ isFirstHourOfSelection }
              background={ {
                  color: 'brand',
                  opacity: "medium",
                } }
              border={ selectionBorders }
              currentHour={ currentHour }
              direction="row"
              align="center"
              justify="between"
              width="100%">{
              isFirstHourOfSelection
                  ? <>
                      <Box
                          style={ { position: 'relative' } }
                          direction="row"
                          gap="xsmall"
                          pad={ { left: numberOfHours > 1 ? '3.5rem' : '5.5rem' } }>
                        <Box
                            style={ {
                                position: 'absolute',
                                left: '4px',
                                top: '-50%',
                              } }>
                          <UserAvatar
                              size='medium'
                              border={ { color: 'accent-3', size: '3px' }}
                              user={ state.currentUser! } />
                        </Box>
                        <Box>
                          <Text>
                            { numberOfHours }h
                            {
                              numberOfHours > 1 
                                  ? <Text
                                        margin='small'>{
                                      timeAsString(selection.startsAt)
                                    } - {
                                      timeAsString(selection.endsAt)
                                    }</Text>
                                  : undefined
                            }
                          </Text>
                        </Box>
                      </Box>
                      <DragBox
                          id="dragbox-top"
                          top
                          ref={ element => {
                              if (!element) return;
                              element.addEventListener(
                                  'touchstart',
                                  event => mouseDownOnDrag(event, true),
                                  { passive: false, capture: true });
                              // https://stackoverflow.com/questions/56653453/why-touchmove-event-is-not-fired-after-dom-changes
                              element.addEventListener(
                                  'touchmove',
                                  touchMove,
                                  { passive: false, capture: true });
                              element.addEventListener(
                                  'touchend',
                                  touchEnd,
                                  { passive: false, capture: true });
                            } }
                          onMouseDownCapture={ event => mouseDownOnDrag(event, true) }>
                        <FormUp color="white" />
                      </DragBox>
                    </>
                  : <Text />
            }{
              isLastHourOfSelection
                  ? <>
                      <ButtonBox>
                        <Box
                            direction="row"
                            gap="small">
                          <Box
                              onMouseDownCapture={ acceptSelection }
                              round="full"
                              overflow="hidden"
                              border={ { color: 'accent-3', size: '3px' } }
                              background='status-ok'>
                            <FormCheckmark
                                color="white"
                                size="30rem" />
                          </Box>
                          <Box
                              onMouseDownCapture={ cancelSelection }
                              round="full"
                              overflow="hidden"
                              border={ { color: 'accent-3', size: '3px' } }
                              background='status-critical'>
                            <FormClose
                                color="white"
                                size="30rem" />
                          </Box>
                        </Box>
                      </ButtonBox>
                      <DragBox
                          id="dragbox-bottom"
                          ref={ element => {
                              if (!element) return;
                              element.addEventListener(
                                  'touchstart',
                                  event => mouseDownOnDrag(event, false),
                                  { passive: false, capture: true });
                              // https://stackoverflow.com/questions/56653453/why-touchmove-event-is-not-fired-after-dom-changes
                              element.addEventListener(
                                  'touchmove',
                                  touchMove,
                                  { passive: false, capture: true });
                              element.addEventListener(
                                  'touchend',
                                  touchEnd,
                                  { passive: false, capture: true });
                            } }
                          onMouseDownCapture={ event => mouseDownOnDrag(event, false) }>
                        <FormDown color="white" />
                      </DragBox>
                    </>
                  : <Text />
            }
          </StyledSelectionBox>  
  };

export { SelectionBox };
