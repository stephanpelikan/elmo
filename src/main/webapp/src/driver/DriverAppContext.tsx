import { useMemo, MutableRefObject } from 'react';
import { useAppContext } from '../AppContext';
import { getCarSharingGuiApi, getDriverGuiApi } from '../client/driverClient';
import { CarSharingApi, DriverApi } from '../client/gui';
import { WakeupSseCallback } from '../components/SseProvider';

const useCarSharingApi = (wakeupSseCallback?: MutableRefObject<WakeupSseCallback>): CarSharingApi => {

  const { dispatch } = useAppContext();
  const api = useMemo(() => getCarSharingGuiApi(dispatch, wakeupSseCallback?.current), [ dispatch ]);
  return api;
  
};

const useDriverApi = (wakeupSseCallback?: MutableRefObject<WakeupSseCallback>): DriverApi => {

  const { dispatch } = useAppContext();
  const api = useMemo(() => getDriverGuiApi(dispatch, wakeupSseCallback?.current), [ dispatch ]);
  return api;
  
};

export {
    useCarSharingApi,
    useDriverApi,
  };
