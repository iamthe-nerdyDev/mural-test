import React from "react";
import api from "./shared/api";
import Account from "./components/account";

const App = () => {
  const [accounts, setAccounts] = React.useState([]);

  React.useEffect(() => {
    (async function () {
      const data = await api.getAccounts();
      setAccounts(data || []);
    })();
  }, []);

  return (
    <div>
      {accounts.map((account: any) => (
        <Account key={account.id} account={account} />
      ))}

      {/* Hidden iframe container for SDK */}
      <div id="auth-iframe-container-id" style={{ display: "none" }}></div>
    </div>
  );
};

export default App;
