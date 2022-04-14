import { PropsWithChildren } from 'react';
import { useAppContext, fetchCurrentUser } from '../AppContext';

interface Props {};

let promise = undefined;

const CurrentUser = ({ children }: PropsWithChildren<Props>) => {
  const { state, dispatch } = useAppContext();
  
  if (promise === undefined) {
    // return a promise to trigger <Suspend> element
    promise = new Promise((resolve, reject) => {
      fetchCurrentUser(state, dispatch)
          .then(resolve)
          .catch(reject);
    });
    throw promise;
  }
  
  return (<>{children}</>);
};

export { CurrentUser };
