const LOCAL_DATE_FORMAT: RegExp = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/;

const isValidLocalDate = (localDate: string): boolean => {
  
  try {
    parseLocalDate(localDate);
    return true;
  } catch (error) {
    return false;
  }
  
}

const parseLocalDate = (localDate: string): Date | undefined => {
  
  if (!Boolean(localDate)) {
    return undefined;
  }
  
  const result = localDate.match(LOCAL_DATE_FORMAT);
  if (result == null) {
    throw new Error(`Unsupported date format '${localDate}'`);
  }
  
  const year = parseInt(result[1]);
  const month = parseInt(result[2]) - 1;
  const day = parseInt(result[3]);

  return new Date(year, month, day);
  
}

const parseLocalDateToIsoString = (localDate: string): string | undefined => {
  
  if (!Boolean(localDate)) {
    return undefined;
  }

  // @ts-ignore  
  return new Date(localDate).toISOString();
  
}

const toLocalDateString = (date: Date): string | undefined => {
  
  if (!Boolean(date)) {
    return undefined;
  }
  
  return String(date.getFullYear()).padStart(4, '0')
      + '-'
      + String(date.getMonth() + 1).padStart(2, '0')
      + '-'
      + String(date.getDate()).padStart(2, '0');
  
}

const currentHour = (history: boolean): Date => {
  
  const now = new Date();
  return new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours()
    );
  
}

const nextHours = (from: Date, hours: number, history: boolean): Date => {
  
  return new Date(
      from.getFullYear(),
      from.getMonth(),
      from.getDate(),
      from.getHours() + hours * (history ? -1 : 1)
    );
  
}

const hoursBetween = (from: Date, to: Date) => {
  
  return Math.abs(from.getTime() - to.getTime()) / 3600000;
  
};

const timeAsString = (date: Date) => {
  
  return String(date.getHours()).padStart(2, '0')
      + ':'
      + String(date.getMinutes()).padStart(2, '0');
      
}

export {
  parseLocalDate,
  toLocalDateString,
  parseLocalDateToIsoString,
  isValidLocalDate,
  currentHour,
  nextHours,
  timeAsString,
  hoursBetween,
};
