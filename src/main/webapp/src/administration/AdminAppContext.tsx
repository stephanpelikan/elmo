import { useMemo } from 'react';
import { useAppContext } from '../AppContext';
import getAdministrationApi from '../client/administrationClient';
import { AdministrationApi } from '../client/administration';

const useAdministrationApi = (): AdministrationApi => {

  const { dispatch } = useAppContext();
  
  const administrationApi = useMemo(() => getAdministrationApi(dispatch), [ dispatch ]);

  return administrationApi;
  
};

export { useAdministrationApi };
