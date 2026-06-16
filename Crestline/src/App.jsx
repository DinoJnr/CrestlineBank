import { useState } from "react";

import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import LandingPage from "./Component/LandingPage";
import RegisterCrestline from "./Component/RegisterCrestline";
import SignInCrestline from "./Component/SignInCrestline";
import CrestlineDashboard from "./Component/CrestlineDashboard";
import CrestlineNavbar from "./Component/CrestlineNavbar";
import AddMoneyPage from "./Component/AddMoneyPage";
import CrestlineTransferPage from "./Component/CrestlineTransferPage";
import CrestlineTopUp from "./Component/CrestlineTopUp";
import CrestlineSporty from "./Component/CrestlineSporty";
import CrestlineInternet from "./Component/CrestlineInternet";
import CrestlineBillPay from "./Component/CrestlineBillPay";
import CrestlineLoan from "./Component/CrestlineLoan";
import CrestlineInvest from "./Component/CrestlineInvest";
import CrestlineCard from "./Component/CrestlineCard";
import CrestlineLedger from "./Component/CrestlineLedger";
import CrestlineReceipt from "./Component/CrestlineReceipt";
import CrestlineProfile from "./Component/CrestlineProfile";
import CrestlineProtocol from "./Component/CrestlineProtocol";
import CrestlineSecurity from "./Component/CrestlineSecurity";
import CrestlineBiometrics from "./Component/CrestlineBiometrics";
import CrestlineSupport from "./Component/CrestlineSupport";
import CrestlineInvestV2 from "./Component/CrestlineInvestV2";
import CrestlineLoanV2 from "./Component/CrestlineLoanV2";
// import CrestlineContact from "./Component/CrestlineContact";
// import CrestlineAirtimePage from "./Component/CrestlineAirtimePage";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage></LandingPage>}></Route>
          <Route
            path="/user/register"
            element={<RegisterCrestline></RegisterCrestline>}
          ></Route>
          <Route
            path="/user/login"
            element={<SignInCrestline></SignInCrestline>}
          ></Route>
          <Route
            path="/user/dashboard"
            element={<CrestlineDashboard></CrestlineDashboard>}
          ></Route>
          <Route
            path="/user/navbar"
            element={<CrestlineNavbar></CrestlineNavbar>}
          ></Route>
          <Route
            path="/user/addmoney"
            element={<AddMoneyPage></AddMoneyPage>}
          ></Route>
          <Route
            path="/user/transfer"
            element={<CrestlineTransferPage></CrestlineTransferPage>}
          ></Route>
          <Route
            path="/user/topup"
            element={<CrestlineTopUp></CrestlineTopUp>}
          ></Route>
          <Route
            path="/user/bet"
            element={<CrestlineSporty></CrestlineSporty>}
          ></Route>
          <Route
            path="/user/internet"
            element={<CrestlineInternet></CrestlineInternet>}
          ></Route>
          <Route
            path="/user/billpay"
            element={<CrestlineBillPay></CrestlineBillPay>}
          ></Route>
          <Route
            path="/user/loan"
            element={<CrestlineLoan></CrestlineLoan>}
          ></Route>
          <Route
            path="/user/invest"
            element={<CrestlineInvest></CrestlineInvest>}
          ></Route>
          <Route
            path="/user/card-request"
            element={<CrestlineCard></CrestlineCard>}
          ></Route>
          <Route
            path="/user/ledger"
            element={<CrestlineLedger></CrestlineLedger>}
          ></Route>
          <Route
            path="/user/receipt"
            element={<CrestlineReceipt></CrestlineReceipt>}
          ></Route>
          <Route
            path="/user/profile"
            element={<CrestlineProfile></CrestlineProfile>}
          ></Route>
          <Route
            path="/user/transaction-limit"
            element={<CrestlineProtocol></CrestlineProtocol>}
          ></Route>
          <Route
            path="/user/transaction-pin"
            element={<CrestlineSecurity></CrestlineSecurity>}
          ></Route>
          <Route
            path="/user/bio-metrics"
            element={<CrestlineBiometrics></CrestlineBiometrics>}
          ></Route>
          <Route
            path="/user/contact-us"
            element={<CrestlineSupport></CrestlineSupport>}
          ></Route>
          <Route path="/user/investV2" element={<CrestlineInvestV2></CrestlineInvestV2>}></Route>
          <Route path="/user/loanV2" element={<CrestlineLoanV2></CrestlineLoanV2>}></Route>
          {/* <Route path="/user/contact" element={<CrestlineContact></CrestlineContact>}></Route> */}
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
