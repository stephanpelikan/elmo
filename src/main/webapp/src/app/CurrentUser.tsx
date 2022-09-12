import { PropsWithChildren } from 'react';
import { useAppContext } from '../AppContext';

interface Props {};

let promise = undefined;

const CurrentUser = ({ children }: PropsWithChildren<Props>) => {
  
  const { state, fetchCurrentUser } = useAppContext();
  
  if (promise === undefined) {
    // return a promise to trigger <Suspend> element
    promise = new Promise((resolve, reject) => {
      fetchCurrentUser(resolve, reject);
    });
  }
  if (state.currentUser == null) {
    throw promise;
  }
  return (<>{children}</>);
};

export { CurrentUser };
