import { useTranslation } from 'react-i18next';
import { MainLayout, Heading1, Content } from '../components/MainLayout';
import { UserAvatar } from '../components/UserAvatar';
import i18n from '../i18n';
import AvatarUpload from 'react-avatar-edit';
import { Avatar, Box, Button, Collapsible } from 'grommet';
import { useState } from 'react';
import { useAppContext } from '../AppContext';

i18n.addResources('en', 'passanger/profile', {
    "avatar_title": "Avatar",
    "avatar_upload_toobig": "The file is too big!",
    "avatar_hint": "Click here...",
    "avatar_change": "Change",
    "avatar_save": "Save",
    "avatar_abort": "Abort",
  });
i18n.addResources('de', 'passanger/profile', {
    "avatar_title": "Avatar",
    "avatar_upload_toobig": "Das Bild ist zu groß!",
    "avatar_hint": "Klicke hier...",
    "avatar_change": "Ändern",
    "avatar_save": "Speichern",
    "avatar_abort": "Verwerfen",
  });

const Profile = () => {
  
  const { t } = useTranslation('passanger/profile');
  const { state, toast, guiApi, fetchCurrentUser } = useAppContext();
  const [ uploadedAvatar, setUploadedAvatar ] = useState(null);
  const [ avatarEditMode, setAvatarEditMode ] = useState(false);
  
  const onBeforeAvatarLoad = (elem) => {
    if(elem.target.files[0].size > 120000){
      elem.target.value = "";
      toast({
        namespace: 'passanger/profile',
        title: 'avatar_title',
        message:'avatar_upload_toobig',
        status: 'warning'
      })
    };
  };
  const onCloseAvatar = () => {
    setUploadedAvatar(null);
  };
  const onCropAvatar = preview => {
    setUploadedAvatar(preview);
  };
  const abortAvatarEditing = () => {
    setAvatarEditMode(false);
    setUploadedAvatar(null);
  };
  const saveAvatarEditing = async () => {
    try {
      /* convert base64-url into Blob: */
      const fetchBasedConverter = await fetch(uploadedAvatar);
      const uploadedAvatarBlob = await fetchBasedConverter.blob();
      // upload Blob
      await guiApi.uploadAvatar({ body: uploadedAvatarBlob });
      // Refresh current-user to make changes visible
      await new Promise((resolve, reject) => {
          fetchCurrentUser(resolve, reject, true);
        });
      abortAvatarEditing();
    } catch (e) {
      console.log(e);
    }
  }
  
  return (
    <MainLayout>
      <Heading1>{ t('avatar_title') }</Heading1>
      <Collapsible open={ !avatarEditMode }>
        <Content
            gap='medium'
            direction='row'>
          <UserAvatar
              size='200px'
              user={ state.currentUser } />
          <Box
              justify='center'>
            <Button
                onClick={ () => setAvatarEditMode(true) }
                label={ t('avatar_change') } />
          </Box>
        </Content>
      </Collapsible>
      <Collapsible open={ avatarEditMode }>
        <Content
            gap='medium'
            direction='row'>
          <AvatarUpload
              width={ 200 }
              height={ 200 }
              exportAsSquare={ true }
              exportSize={ 300 }
              label={ t('avatar_hint') }
              onBeforeFileLoad={ onBeforeAvatarLoad }
              onClose={ onCloseAvatar }
              onCrop={ onCropAvatar } />
          <Box
              justify='center'
              gap='small'>
            Vorschau:
            <Avatar
                size='large'
                border={ uploadedAvatar == null }
                src={ uploadedAvatar } />
            <Button
                secondary
                onClick={ saveAvatarEditing }
                disabled={ uploadedAvatar == null }
                label={ t('avatar_save') } />
            <Button
                onClick={ abortAvatarEditing }
                label={ t('avatar_abort') } />
          </Box>
        </Content>
      </Collapsible>
    </MainLayout>
  );
};

export default Profile;
