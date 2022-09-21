import { useMemo } from 'react';
import { useAppContext } from '../../AppContext';
import { AppApi } from '../../client/app';
import{ getAppApi } from '../../client/appClient';

const useAppApi = (): AppApi => {

  const { dispatch } = useAppContext();
  
  const appApi = useMemo(() => getAppApi(dispatch), [ dispatch ]);

  return appApi;
  
};

export { useAppApi };
