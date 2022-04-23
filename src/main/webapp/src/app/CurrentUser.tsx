import { PropsWithChildren } from 'react';
import { useAppContext } from '../AppContext';

interface Props {};

let promise = undefined;

const CurrentUser = ({ children }: PropsWithChildren<Props>) => {
  const { fetchCurrentUser } = useAppContext();
  
  if (promise === undefined) {
    // return a promise to trigger <Suspend> element
    promise = new Promise((resolve, reject) => {
      fetchCurrentUser(resolve, reject);
    });
    throw promise;
  }
  
  return (<>{children}</>);
};

export { CurrentUser };
