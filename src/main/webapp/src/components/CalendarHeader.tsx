import { Box, Button, HeaderProps, Heading, RangeInput, ResponsiveContext } from "grommet";
import { useContext } from "react";
import { ThemeContext } from "styled-components";

const headingPadMap = {
  small: 'xsmall',
  medium: 'small',
  large: 'medium',
};

interface CalendarHeaderProps extends HeaderProps {
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
}: CalendarHeaderProps) => {
  const size = useContext(ResponsiveContext);
  const theme = useContext(ThemeContext);
  
  const PreviousIcon =
    size === 'small'
      ? theme.calendar.icons.small.previous
      : theme.calendar.icons.previous;

  const NextIcon =
    size === 'small'
      ? theme.calendar.icons.small.next
      : theme.calendar.icons.next;
      
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
        <Box flex pad={{ horizontal: headingPadMap[size] || 'small' }}>
          <Heading
            level={
              size === 'small'
                ? (theme.calendar.heading && theme.calendar.heading.level) ||
                  4
                : ((theme.calendar.heading && theme.calendar.heading.level) ||
                    4) - 1
            }
            size={size}
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
            icon={<PreviousIcon size={size !== 'small' ? size : undefined} />}
            disabled={!previousInBound}
            onClick={onPreviousMonth}
          />
          <Button
            icon={<NextIcon size={size !== 'small' ? size : undefined} />}
            disabled={!nextInBound}
            onClick={onNextMonth}
          />
        </Box>
      </Box>
      <Box>
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
