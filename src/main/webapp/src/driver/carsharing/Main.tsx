import { Route, Routes } from "react-router-dom";
import i18n from '../../i18n';
import { useLayoutEffect } from "react";
import { useAppContext } from "../../AppContext";
import { Booking } from "./Booking";

i18n.addResources('en', 'driver/carsharing', {
      "title.long": 'Car-Sharing',
      "title.short": 'Car-Sharing',
    });
i18n.addResources('de', 'driver/carsharing', {
      "title.long": 'Car-Sharing',
      "title.short": 'Car-Sharing',
    });

const Main = () => {

  const { setAppHeaderTitle } = useAppContext();
  
  useLayoutEffect(() => {
    setAppHeaderTitle('driver/carsharing', false);
  }, [ setAppHeaderTitle ]);

  return (
    <Routes>
      <Route path='/' element={ <Booking /> } />
    </Routes>);
}

export { Main };
