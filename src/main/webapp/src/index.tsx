import React from 'react';
import ReactDOM from 'react-dom';
import App from './app/App';
import { SmsSending } from './app/SmsSending';
import reportWebVitals from './reportWebVitals';
import { AppContextProvider } from './AppContext';

ReactDOM.render(
  <React.StrictMode>
    <AppContextProvider>
      <App />
      <SmsSending />{/* used to sent text messages on driver's tablets */}
    </AppContextProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
