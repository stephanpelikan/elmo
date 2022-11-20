import { useMemo } from 'react';
import { useAppContext } from '../AppContext';
import { getCarSharingGuiApi, getDriverGuiApi } from '../client/driverClient';
import { CarSharingApi, DriverApi } from '../client/gui';

const useCarSharingApi = (): CarSharingApi => {

  const { dispatch } = useAppContext();
  const api = useMemo(() => getCarSharingGuiApi(dispatch), [ dispatch ]);
  return api;
  
};

const useDriverApi = (): DriverApi => {

  const { dispatch } = useAppContext();
  const api = useMemo(() => getDriverGuiApi(dispatch), [ dispatch ]);
  return api;
  
};

export {
    useCarSharingApi,
    useDriverApi,
  };
