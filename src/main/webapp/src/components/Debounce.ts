import { useContext, useEffect, useState } from "react";
import { ThemeContext } from "styled-components";

const useDebounce = () => {
  const [func, setFunc] = useState<Function>();
  const theme = useContext(ThemeContext);

  useEffect(() => {
    let timer: any;
    if (func) timer = setTimeout(func, theme.global.debounceDelay);
    return () => clearTimeout(timer);
  }, [func, theme.global.debounceDelay]);

  return setFunc;
};

export default useDebounce;
