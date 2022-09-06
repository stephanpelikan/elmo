const LOCAL_DATE_FORMAT: RegExp = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/;

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

export { parseLocalDate, toLocalDateString };
