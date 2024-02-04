import { useMemo, MutableRefObject } from 'react';
import { useAppContext } from '../AppContext';
import { getBlockingGuiApi, getCarSharingGuiApi, getPlannerGuiApi } from '../client/driverClient';
import { BlockingApi, CarSharingApi, PlannerApi } from '../client/gui';
import { WakeupSseCallback } from '../components/SseProvider';

const useCarSharingApi = (wakeupSseCallback?: MutableRefObject<WakeupSseCallback>): CarSharingApi => {

  const { dispatch } = useAppContext();
  const api = useMemo(() => getCarSharingGuiApi(dispatch, wakeupSseCallback?.current), [ dispatch, wakeupSseCallback ]);
  return api;
  
};

const useBlockingApi = (wakeupSseCallback?: MutableRefObject<WakeupSseCallback>): BlockingApi => {

  const { dispatch } = useAppContext();
  const api = useMemo(() => getBlockingGuiApi(dispatch, wakeupSseCallback?.current), [ dispatch, wakeupSseCallback ]);
  return api;

};

const usePlannerApi = (wakeupSseCallback?: MutableRefObject<WakeupSseCallback>): PlannerApi => {

  const { dispatch } = useAppContext();
  const api = useMemo(() => getPlannerGuiApi(dispatch, wakeupSseCallback?.current), [ dispatch, wakeupSseCallback ]);
  return api;
  
};

export {
    useCarSharingApi,
    useBlockingApi,
    usePlannerApi,
  };
