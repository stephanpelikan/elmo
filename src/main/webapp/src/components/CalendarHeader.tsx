import { Box, Button, CalendarHeaderProps, Heading, RangeInput } from "grommet";
import { useContext } from "react";
import { ThemeContext } from "styled-components";
import useResponsiveScreen from "../utils/responsiveUtils";

const headingPadMap = {
  phone: 'xsmall',
  tablet: 'small',
  computer: 'medium',
};

const headingSizeMap = {
  phone: 'small',
  tablet: 'medium',
  computer: 'large',
};

interface ExtendedCalendarHeaderProps extends CalendarHeaderProps {
  setDate: (date: Date) => void;
};

const CalendarHeader = ({
  date,
  setDate,
  locale,
  onPreviousMonth,
  onNextMonth,
  previousInBound,
  nextInBound
}: ExtendedCalendarHeaderProps) => {
  
  const { isPhone, currentScreen } = useResponsiveScreen();
  const theme = useContext(ThemeContext);
  
  const PreviousIcon = theme.calendar.icons.small.previous;

  const NextIcon = theme.calendar.icons.small.next;
      
  const year = date.getFullYear();
  
  const changeYear = event => {
    const target = event.target.value;
    const newDate = new Date(date);
    newDate.setFullYear(date.getFullYear() + (target - year));
    setDate(newDate);
  };
  const thisYear = new Date().getFullYear();
  const firstYear = thisYear - 100;

  return (
    <>
      <Box direction="row" justify="between" align="center" gap="small">
        <Box flex pad={{ horizontal: headingPadMap[currentScreen] || 'small' }}>
          <Heading
            level={
              isPhone
                ? ((theme.calendar.heading && theme.calendar.heading.level) || 4)
                : ((theme.calendar.heading && theme.calendar.heading.level) || 4) - 1
            }
            size={ headingSizeMap[currentScreen] }
            margin="none"
          >
            {date.toLocaleDateString(locale, {
              month: 'long',
              year: 'numeric',
            })}
          </Heading>
        </Box>
        <Box flex={false} direction="row" align="center" gap="small">
          <Button
            icon={<PreviousIcon size="medium" />}
            disabled={!previousInBound}
            onClick={onPreviousMonth}
          />
          <Button
            icon={<NextIcon size="medium" />}
            disabled={!nextInBound}
            onClick={onNextMonth}
          />
        </Box>
      </Box>
      <Box
          margin={ { vertical: 'small' } }>
        <RangeInput
            min={firstYear}
            max={thisYear}
            value={year}
            onChange={changeYear} />
      </Box>
    </>
  );
};

export { CalendarHeader };
