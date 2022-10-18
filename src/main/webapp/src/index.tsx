import React from 'react';
import ReactDOM from 'react-dom';
import App from './app/App';
import { FlutterSupport } from './app/FlutterSupport';
import reportWebVitals from './reportWebVitals';
import { AppContextProvider } from './AppContext';
import "@fontsource/roboto/latin-300.css";
import "@fontsource/roboto/files/roboto-latin-300-normal.woff2";
import "@fontsource/roboto/files/roboto-latin-300-normal.woff";
import "@fontsource/roboto/latin-400.css";
import "@fontsource/roboto/files/roboto-latin-400-normal.woff2";
import "@fontsource/roboto/files/roboto-latin-400-normal.woff";
import "@fontsource/roboto/latin-500.css";
import "@fontsource/roboto/files/roboto-latin-500-normal.woff2";
import "@fontsource/roboto/files/roboto-latin-500-normal.woff";

ReactDOM.render(
  <React.StrictMode>
    <AppContextProvider>
      <App />
      <FlutterSupport />
    </AppContextProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
