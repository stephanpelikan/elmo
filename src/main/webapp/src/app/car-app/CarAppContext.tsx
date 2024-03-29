import { WakeupSseCallback } from 'components/SseProvider';
import { MutableRefObject, useMemo } from 'react';
import { useAppContext } from '../../AppContext';
import { AppApi } from '../../client/app';
import{ getAppApi } from '../../client/appClient';

const useAppApi = (wakeupSseCallback?: MutableRefObject<WakeupSseCallback>): AppApi => {

  const { dispatch } = useAppContext();
  
  const appApi = useMemo(() => getAppApi(dispatch, wakeupSseCallback?.current), [ dispatch, wakeupSseCallback ]);

  return appApi;
  
};

export { useAppApi };
