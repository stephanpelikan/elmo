import { Box, Text } from "grommet";
import { FormCheckmark, FormClose, FormDown, FormNext, FormPrevious, FormUp, IconProps } from "grommet-icons";
import { BorderType, normalizeColor } from "grommet/utils";
import { CSSProperties, MouseEvent, useCallback, useRef, useState } from "react";
import styled from "styled-components";
import { useAppContext } from "../../AppContext";
import { UserAvatar } from "../../components/UserAvatar";
import useOnClickOutside from "../../utils/clickOutside";
import { numberOfHoursBetween, timeAsString } from '../../utils/timeUtils';
import { PlannerButton } from "./PlannerButton";
import { PlannerContextMenu } from "./PlannerContextMenu";
import { CalendarHour, ReservationDrivers, Selection, SelectionAction } from "./utils";

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
    z-index: ${props => props.currentHour === 0 ? 5 : 4};
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

interface ActionIconProps extends IconProps {
  action: SelectionAction;
}

const ActionIcon = ({ action, ...props }: ActionIconProps) => {
  if (action.icon === undefined) return <FormCheckmark {...props} />;
  const Icon = action.icon;
  return <Icon {...props} />;
}

const SelectionBox = ({ hour, selection, drivers, mouseDownOnDrag, cancelSelection, acceptSelection, touchMove, touchEnd }: {
    hour: CalendarHour,
    selection: Selection,
    drivers: ReservationDrivers,
    cancelSelection: () => void,
    acceptSelection: (indexOfSelectionAction: number) => void,
    mouseDownOnDrag: (event: MouseEvent | TouchEvent, top: boolean) => void,
    touchMove: (event: TouchEvent) => void,
    touchEnd: (event: TouchEvent) => void,
  }) => {
    const { state } = useAppContext();

    const [ showEditMenu, _setShowEditMenu ] = useState(false);
    const setShowEditMenu = useCallback((event, show: boolean) => {
      event.preventDefault();
      event.stopPropagation();
      _setShowEditMenu(show);
    }, [ _setShowEditMenu ]);
    const ref = useRef(null);
    useOnClickOutside(ref, event => {
      if (!showEditMenu) return;
      setShowEditMenu(event, false);
    });

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

    const doCancelSelection = (event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        cancelSelection();
      };
    const doAcceptSelection = (event: MouseEvent, indexOfSelectionAction: number) => {
        event.preventDefault();
        event.stopPropagation();
        acceptSelection(indexOfSelectionAction);
      };

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
                        {
                          selection.ownerId === null
                              ? undefined
                              : <Box
                                    style={ {
                                        position: 'absolute',
                                        left: '4px',
                                        top: '-50%',
                                      } }>
                                  <UserAvatar
                                      size='medium'
                                      border={ { color: 'accent-3', size: '3px' }}
                                      user={
                                          selection.ownerId === undefined
                                              ? state.currentUser!
                                              : drivers[ selection.ownerId! ]
                                        } />
                                </Box>
                        }
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
                          {
                            selection.actions?.length === 0
                                ? undefined
                                : selection.actions.length === 1
                                ? <Box
                                      onMouseDownCapture={ (event) => doAcceptSelection(event, 0) }
                                      round="full"
                                      overflow="hidden"
                                      border={ { color: 'accent-3', size: '3px' } }
                                      background='status-ok'>
                                    {
                                      <ActionIcon
                                          action={ selection.actions[0] }
                                          color="white"
                                          size="30rem" />
                                    }
                                  </Box>
                                : !showEditMenu
                                ? <Box
                                      onMouseDownCapture={ (event) => setShowEditMenu(event, true) }
                                      round="full"
                                      overflow="hidden"
                                      border={ { color: 'accent-3', size: '3px' } }
                                      background='status-ok'>
                                    {
                                      <FormNext
                                          color="white"
                                          size="30rem" />
                                    }
                                  </Box>
                                : <PlannerContextMenu
                                      inSelection
                                      ref={ ref }>
                                    <PlannerButton
                                        inContextMenu
                                        action={ (event) => setShowEditMenu(event, false) }
                                        background='dark-4'
                                        showBorder={false}
                                        iconSize="30rem"
                                        icon={ FormPrevious } />
                                    {
                                      selection.actions.map((action, indexOfAction) => (
                                          <PlannerButton
                                              inContextMenu
                                              action={ (event) => doAcceptSelection(event, indexOfAction) }
                                              background={ action.iconBackground }
                                              iconSize="20rem"
                                              icon={ action.icon } />
                                      ))
                                    }
                                  </PlannerContextMenu>
                          }
                          <Box
                              onMouseDownCapture={ doCancelSelection }
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
