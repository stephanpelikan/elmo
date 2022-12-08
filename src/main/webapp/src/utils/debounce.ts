type Params = any[];

type Func = (...args: Params) => void;

type Debounce = (
    func: Func,
    timeout?: number,
  ) => Func;

const debounce: Debounce = (
  func,
  timeout = 300
) => {
  let timer: number;
  return (...args: Params) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
        func(...args);
      }, timeout);
  }
};

export default debounce;
