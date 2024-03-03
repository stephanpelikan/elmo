import { MutableRefObject, useMemo } from 'react';
import { useAppContext } from '../AppContext';
import { getBlockingGuiApi, getCarSharingGuiApi, getMaintenanceGuiApi, getPlannerGuiApi } from '../client/driverClient';
import { BlockingApi, CarSharingApi, MaintenanceApi, PassengerServiceApi, PlannerApi } from '../client/gui';
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

const useMaintenanceApi = (wakeupSseCallback?: MutableRefObject<WakeupSseCallback>): MaintenanceApi => {

  const { dispatch } = useAppContext();
  const api = useMemo(() => getMaintenanceGuiApi(dispatch, wakeupSseCallback?.current), [ dispatch, wakeupSseCallback ]);
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
    useMaintenanceApi,
  };
