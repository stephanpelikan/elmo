import { MutableRefObject, useMemo } from 'react';
import { useAppContext } from '../AppContext';
import { getBlockingGuiApi, getCarSharingGuiApi, getPlannerGuiApi } from '../client/driverClient';
import { BlockingApi, CarSharingApi, PassengerServiceApi, PlannerApi } from '../client/gui';
import { WakeupSseCallback } from '../components/SseProvider';
import { getPassengerServiceGuiApi } from "../client/guiClient";

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

const usePassengerServiceApi = (wakeupSseCallback?: MutableRefObject<WakeupSseCallback>): PassengerServiceApi => {

  const { dispatch } = useAppContext();
  const api = useMemo(() => getPassengerServiceGuiApi(dispatch, wakeupSseCallback?.current), [ dispatch, wakeupSseCallback ]);
  return api;

};

export {
    useCarSharingApi,
    useBlockingApi,
    usePlannerApi,
    usePassengerServiceApi,
  };
