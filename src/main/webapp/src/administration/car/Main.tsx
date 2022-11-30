import { Route, Routes } from "react-router-dom";
import { ListOfCars } from './List';
import i18n from '../../i18n';
import React, { useLayoutEffect } from "react";
import { useAppContext } from "../../AppContext";
import { Details } from "./Details";

i18n.addResources('en', 'administration/car', {
      "title.long": 'Cars',
      "title.short": 'Cars',
    });
i18n.addResources('de', 'administration/car', {
      "title.long": 'Fahrzeuge',
      "title.short": 'Fahrzeuge',
    });

const Main = () => {

  const { setAppHeaderTitle } = useAppContext();
  
  useLayoutEffect(() => {
    setAppHeaderTitle('administration/car', true);
  }, [ setAppHeaderTitle ]);

  return (
    <Routes>
      <Route path='/' element={<ListOfCars />} />
      <Route path=':carId' element={<Details />} />
    </Routes>);
}

export { Main };
