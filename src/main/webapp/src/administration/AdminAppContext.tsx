import { useMemo } from 'react';
import { useAppContext } from '../AppContext';
import{ getMemberAdministrationApi, getCarAdministrationApi, getOnboardingAdministrationApi } from '../client/administrationClient';
import { MemberApi, CarApi, OnboardingApi } from '../client/administration';

const useMemberApi = (): MemberApi => {

  const { dispatch } = useAppContext();
  const api = useMemo(() => getMemberAdministrationApi(dispatch), [ dispatch ]);
  return api;
  
};

const useCarAdministrationApi = (): CarApi => {

  const { dispatch } = useAppContext();
  const api = useMemo(() => getCarAdministrationApi(dispatch), [ dispatch ]);
  return api;
  
};

const useOnboardingAdministrationApi = (): OnboardingApi => {

  const { dispatch } = useAppContext();
  const api = useMemo(() => getOnboardingAdministrationApi(dispatch), [ dispatch ]);
  return api;
  
};

export {
    useMemberApi,
    useCarAdministrationApi,
    useOnboardingAdministrationApi
  };
