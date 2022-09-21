import { useMemo } from 'react';
import { useAppContext } from '../AppContext';
import{ getAdministrationApi, getCarAdministrationApi } from '../client/administrationClient';
import { AdministrationApi, CarsApi } from '../client/administration';

const useAdministrationApi = (): AdministrationApi => {

  const { dispatch } = useAppContext();
  
  const administrationApi = useMemo(() => getAdministrationApi(dispatch), [ dispatch ]);

  return administrationApi;
  
};

const useCarAdministrationApi = (): CarsApi => {

  const { dispatch } = useAppContext();
  
  const carsApi = useMemo(() => getCarAdministrationApi(dispatch), [ dispatch ]);

  return carsApi;
  
};

export { useAdministrationApi, useCarAdministrationApi };
