import { useMemo } from 'react';
import { useAppContext } from '../AppContext';
import { getCarSharingGuiApi } from '../client/driverClient';
import { CarSharingApi } from '../client/gui';

const useCarSharingApi = (): CarSharingApi => {

  const { dispatch } = useAppContext();
  const api = useMemo(() => getCarSharingGuiApi(dispatch), [ dispatch ]);
  return api;
  
};

export {
    useCarSharingApi,
  };
