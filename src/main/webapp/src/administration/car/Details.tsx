import { Box, Button, CheckBox, Layer, Paragraph, Text, TextInput } from "grommet";
import { useEffect, useState } from "react";
import { ViolationsAwareFormField } from "../../components/ViolationsAwareFormField";
import { useTranslation } from "react-i18next";
import QRCode from "react-qr-code";
import { useNavigate, useParams } from "react-router-dom";
import { useAppContext } from "../../AppContext";
import { Car, CarApi } from "../../client/administration";
import i18n from '../../i18n';
import { useCarAdministrationApi } from "../AdminAppContext";
import useResponsiveScreen from '../../utils/responsiveUtils';
import { LoadingIndicator } from '../../components/LoadingIndicator';
import { MainLayout, Heading } from "../../components/MainLayout";
import { CodeButton } from "../../components/CodeButton";

i18n.addResources('en', 'administration/car-details', {
      "shortcut": "Shortcut:",
      "shortcut-readonly": "Shortcut (not changeable):",
      "name": "Name of the car:",
      "phone-number": "Phone number of tablet:",
      "save": "Save",
      "reset": "Reset",
      "delete": "Delete",
      "passanger-service": "Passanger service",
      "car-sharing": "Car-Sharing",
      "app": "Elmo-App on tablet",
      "app-description-inactive": `For some features of the Elmo-App installed on the
        passanger service tablet (e.g. sending SMS text messages) the App has
        to be activated first for security-reason. Click the 'Activate App'-button
        and scan the shown QR-code using the Elmo-App.`,
      "app-description-active": `Here you can deactivate the Elmo-App installed on the
        passanger service tablet, e.g. if the tablet is lost. This is only about the
        special features (e.g. sending SMS text messages).`,
      "activate": "Activate Elmo-App",
      "deactivate": "Deactivate Elmo-App",
      "last-app-activity": "Last Elmo-App tablet activity:",
      "scan-qr-code": "Scan QR-code in Elmo tablet",
      "dismiss": "Dismiss",
      "test-sms": "Test SMS",
      "test-sms_sent": "SMS successfully sent!",
      "test-sms_error": "SMS could not be sent! Error: {{error}}.",
      "test-sms_error_unknown_error": "Unknown",
      "test-sms_error_missing": "Please enter a phone-number!",
      "test-sms_error_format": "Wrong format: +[country][area code without zero][number]!",
      "phone-number_missing": "Please enter a phone-number!",
      "phone-number_format": "Wrong format: +[country][area code without zero][number]!",
      "name_missing": "Please enter a name!",
      "car-saved_title": "Save",
      "car-saved_message": "Changes were successfully persisted!",
      "not-deleted_title": "Delete",
      "not-deleted_message": `The car war not deleted, because it's already in use!
However, it can be deactivated for passanger-service and car-sharing.`,
      "new": "New",
  });
i18n.addResources('de', 'administration/car-details', {
      "shortcut": "Kürzel:",
      "shortcut-readonly": "Kürzel (nicht änderbar):",
      "name": "Name des Autos:",
      "phone-number": "Telefonnummer des Tablets:",
      "save": "Speichern",
      "reset": "Verwerfen",
      "delete": "Löschen",
      "passanger-service": "Fahrtendienst",
      "car-sharing": "Car-Sharing",
      "app": "Elmo-App am Tablet",
      "app-description-inactive": `Für einige Funktionen der Elmo-App am Fahrtendienst-Tablet
        (z.B. der SMS-Versand) muss die App aus Sicherheitsgründen zuerst aktiviert
        werden. Wähle dafür den 'Aktivieren'-Button und scanne mit der Elmo-App den
        erscheinenden QR-Code.`,
      "app-description-active": `Hier kann die Elmo-App am Fahrtendienst-Tablet deaktiviert
        werden, z.B. bei Verlust. Dies betrifft jedoch nur über die Passagier-App hinausgehende
        Funktionen (z.B. der SMS-Versand).`,
      "activate": "Elmo-App aktivieren",
      "deactivate": "Elmo-App deaktivieren",
      "last-app-activity": "Letzte Elmo-App Tablet Aktivität:",
      "dismiss": "Fertig",
      "test-sms": "SMS testen",
      "test-sms_sent": "SMS erfolgreich gesendet!",
      "test-sms_error": "SMS konnte nicht gesendet werden! Fehler: {{error}}.",
      "test-sms_error_unknown_error": "Unbekannt",
      "test-sms_error_missing": "Bitte trage eine Telefonnummer ein!",
      "test-sms_error_format": "Falsches Format: +[Land][Vorwahl ohne Null][Nummer]!",
      "phone-number_missing": "Bitte trage eine Telefonnummer ein!",
      "phone-number_format": "Falsches Format: +[Land][Vorwahl ohne Null][Nummer]!",
      "name_missing": "Bitte trage einen Name ein!",
      "car-saved_title": "Speichern",
      "car-saved_message": "Die Änderungen wurden gespeichert!",
      "not-deleted_title": "Löschen",
      "not-deleted_message": `Fahrzeug wurde nicht gelöscht, da es bereits in Verwendung ist!
 Es kann jedoch für den Fahrtendienst und das Car-Sharing verboten werden.`,
      "new": "Neu",
  });

const loadData = async (carApi: CarApi, carId: string, setCar: (car: Car) => void) => {
    const car = await carApi.getCar({ carId });
    setCar(car);
  };

const Details = () => {
  
  const { isPhone } = useResponsiveScreen();
  const { toast } = useAppContext();
  const carApi = useCarAdministrationApi();
  const { t } = useTranslation('administration/car-details');
  const navigate = useNavigate();
  const params = useParams();
  const isNewCar = params.carId === '-';

  const [ dirty, setDirty ] = useState<boolean>(false);
  const [ violations, setViolations ] = useState<any>({});
  const [ car, setCar ] = useState<Car>(undefined);

  const loading = car === undefined;

  const [ activationCode, setActivationCode ] = useState<string>(undefined);
  
  const activateApp = async () => {
    
    const code = await carApi.activateCarApp({ carId: car.id });
    setActivationCode(code);
    const updatedCar = await carApi.getCar({ carId: car.id });
    setCar(updatedCar);
    
  };

  const deactivateApp = async () => {
    
    await carApi.deactivateCarApp({ carId: car.id });
    setActivationCode(undefined);
    const updatedCar = await carApi.getCar({ carId: car.id });
    setCar(updatedCar);
    
  };
  
  const dismissQrCode = () => {
    
    setActivationCode(undefined);
    
  };
  
  const testSms = async () => {
    
    try {
      
      await carApi.sendTestSms({
          carId: car.id,
          testTextMessage: {
            phoneNumber: car.phoneNumber
          }
        });
      toast({
          namespace: 'administration/car-details',
          title: t('test-sms'),
          message: t('test-sms_sent'),
          status: 'normal'
        });

    } catch (error) {

      let violation = 'unknown_error';
      if (error.response?.json) {
        violation = (await error.response.json()).phoneNumber;
      }
      toast({
          namespace: 'administration/car-details',
          title: t('test-sms'),
          message: t('test-sms_error', { error: t(`test-sms_error_${violation}`) }),
          status: 'critical'
        });
      
    }
    
  };
  
  const save = async () => {

    try {
      
      const carId = await carApi.saveCar({ carId: params.carId, car });
      if (carId !== params.carId) {
        navigate(`../${carId}`, { replace: true })
      }
      toast({
          namespace: 'administration/car-details',
          title: t('car-saved_title'),
          message: t('car-saved_message'),
          status: 'normal'
        });
      
    } catch (error) {

      if (error.response?.json) {
        setViolations(await error.response.json());
      }
      
    }
    
  };

  const deleteCar = async () => {

    try {
      
      await carApi.deleteCar({ carId: params.carId });
      navigate('../');
      
    } catch (error) {

      toast({
          namespace: 'administration/car-details',
          title: t('not-deleted_title'),
          message: t('not-deleted_message'),
          status: 'normal'
        });
      
    }
    
  };
  
  const reset = async () => {
    await loadData(carApi, params.carId, setCar);
    setDirty(false);
  };
  
  useEffect(() => {
      if (car !== undefined) {
        return;
      }
      if (isNewCar) {
        setCar({
          name: '',
          shortcut: '',
          phoneNumber: '',
          appActive: false,
          passangerService: false,
          carSharing: false,
        });
        return;
      }
      loadData(carApi, params.carId, setCar);
    }, [ isNewCar, car, params.carId, setCar, carApi ]);
    
  const setCarValue = (data: any) => {
    setCar({ ...car, ...data });
    setDirty(true);
  };

  if (loading) {
    return <LoadingIndicator />;
  }
  
  return (
    <MainLayout>
      <Heading>
        { Boolean(car.name) ? car.name : t('new') }
      </Heading>
      <CheckBox
          toggle
          pad={ { vertical: 'small' } }
          checked={ car.passangerService }
          label={ t('passanger-service') }
          onChange={ event => setCarValue({ passangerService: event.target.checked }) }
        />
      <CheckBox
          toggle
          pad={ { vertical: 'small' } }
          checked={ car.carSharing }
          label={ t('car-sharing') }
          onChange={ event => setCarValue({ carSharing: event.target.checked }) }
        />
      <ViolationsAwareFormField
          name="shortcut"
          label={ isNewCar ? 'shortcut' : 'shortcut-readonly' }
          t={ t }
          violations={ violations }>
        <TextInput
            id="shortcut"
            readOnly={ !isNewCar }
            onChange={ event => setCarValue({ shortcut: event.target.value }) }
            value={ car.shortcut } />
      </ViolationsAwareFormField>
      <ViolationsAwareFormField
          name="name"
          label='name'
          t={ t }
          violations={ violations }>
        <TextInput
            id="name"
            onChange={ event => setCarValue({ name: event.target.value }) }
            value={ car.name } />
      </ViolationsAwareFormField>
      <ViolationsAwareFormField
          name="phoneNumber"
          htmlFor="phoneNumber"
          label='phone-number'
          t={ t }
          violations={ violations }>
        <Box
            direction="row"
            gap="medium">
          <TextInput
              id="phoneNumber"
              value={ car?.phoneNumber }
              onChange={ event => setCarValue({ phoneNumber: event.target.value }) }
              focusIndicator={false}
              plain />
          <CodeButton
              secondary
              disabled={ !car.appActive }
              onClick={ value => testSms() }
              label={ t('test-sms') } />
        </Box>
      </ViolationsAwareFormField>
      <Box
          margin={ { vertical: 'large' } }
          direction='column'
          gap='small'>
        <Button
            primary
            disabled={ !dirty }
            onClick={ save }
            label={ t('save') } />
        <Button
            disabled={ !dirty }
            onClick={ reset }
            label={ t('reset') } />
        <Button
            secondary
            onClick={ deleteCar }
            label={ t('delete') } />
      </Box>
      <Heading
          size='small'
          level='3'>
        { t('app') }
      </Heading>
      <Box
          direction='column'
          margin={ { bottom: 'medium' } }
          gap='small'>
        <Text>{ t('app-description' + (car.appActive ? '-active' : '-inactive')) }</Text>
        { car.appActive
            ? <>
                <Text>{ t('last-app-activity') }
                    { isPhone ? <br/> : ' ' }
                    { car.lastAppActivity.toLocaleDateString() }&nbsp;
                    { car.lastAppActivity.toLocaleTimeString() }</Text>
                <Button
                    secondary
                    disabled={ dirty }
                    onClick={ deactivateApp }
                    label={ t('deactivate') } />
              </>
            : <Button
                secondary
                disabled={ dirty }
                onClick={ activateApp }
                label={ t('activate') } /> }
      </Box>
      { activationCode
          ? (<Layer
                onEsc={ dismissQrCode }
                responsive={true}
                modal={true}>
              <Box
                  direction="column"
                  pad="medium">
                <Heading
                    size='small'
                    alignSelf="center"
                    level='2'>
                  {  car.name }
                </Heading>
                <Paragraph
                    alignSelf="center"
                    >{ t('scan-qr-code') }</Paragraph>
                <Box
                    fill
                    align='center'
                    width='100%'
                    height='100%'>
                  <QRCode value={ activationCode } />
                </Box>
                <Button
                    onClick={ dismissQrCode }
                    margin='large'
                    secondary
                    alignSelf="center"
                    label={ t('dismiss') }
                    />
              </Box>
            </Layer>)
          : '' }
    </MainLayout>);
  
};

export { Details };
