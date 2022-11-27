import { SmsSseProvider } from "./SmsSseProvider";
import { SmsSender } from "./SmsSender";

const CarAppSupport = () => (
  <SmsSseProvider>
    <SmsSender />
  </SmsSseProvider>);

export default CarAppSupport;
