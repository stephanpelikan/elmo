import { Box, Heading } from 'grommet';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { useAppContext } from "../AppContext";
import { GuiApi, MemberApplicationForm } from '../client/gui';
import { useEffect, useState } from 'react';

i18n.addResources('en', 'login/registration/submitted', {
      "loading": "Loading...",
    });
i18n.addResources('de', 'login/registration/submitted', {
      "loading": "Lade Daten...",
    });

const loadData = async (
    guiApi: GuiApi,
    setMemberApplicationForm: (applicationForm: MemberApplicationForm) => void
  ) => {

  const application = await guiApi.loadMemberApplicationForm();
  
  setMemberApplicationForm(application);
  
};

const RegistrationSubmitted = () => {
  const { guiApi } = useAppContext();

  const [ memberApplicationForm, setMemberApplicationForm ] = useState<MemberApplicationForm>(undefined);

  const loading = memberApplicationForm === undefined;
  useEffect(() => {
      if (memberApplicationForm === undefined) { 
        loadData(guiApi, setMemberApplicationForm);
      };
    }, [ memberApplicationForm, guiApi, setMemberApplicationForm ]);

  const { t } = useTranslation('login/registration/submitted');
  
  return (<Box
        pad='small'>
      <Heading
          size='small'
          level='2'>{
        loading
            ? t('loading')
            : 'Year'
      }</Heading>
    </Box>);
}

export { RegistrationSubmitted };