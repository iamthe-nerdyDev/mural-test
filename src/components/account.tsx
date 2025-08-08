import React from "react";
import api from "../shared/api";
import murarlCustodial from "../shared/murarl-custodial";

const Account = ({ account }: { account: any }) => {
  const initialData = {
    amount: "0",
    remark: "Test transaction",
    currency: "cop",
    beneficiary_id: "",
    supporting_document: "", // optional
    purpose_of_transaction: "", // optional
  };

  const [quote, setQuote] = React.useState<Record<string, any>>();
  const [isLoading, setIsLoading] = React.useState(false);
  const [data, setData] = React.useState<Record<string, any>>(initialData);

  // Helper function to convert file to base64
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
        // Remove the data:type;base64, prefix to get just the base64 string
        // const base64 = result.split(",")[1];
        // resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file input change
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await convertToBase64(file);
        setData((prev) => ({ ...prev, supporting_document: base64 }));
      } catch (error) {
        console.error("Error converting file to base64:", error);
        alert("Error processing file");
      }
    } else {
      setData((prev) => ({ ...prev, supporting_document: "" }));
    }
  };

  async function getQuote() {
    if (isLoading) return;

    // Basic validation
    if (!data.amount || Number(data.amount) <= 0) {
      return alert("Please enter a valid amount");
    }

    if (!data.currency) {
      return alert("Please enter currency");
    }

    setIsLoading(true);
    try {
      const quote = await api.getQuote(Number(data.amount), data.currency);
      if (!quote) return alert("Could not get quote!");

      setQuote(quote);
    } catch (error) {
      console.error("Transaction error:", error);
      alert("Transaction failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function onSubmit(e: any) {
    e.preventDefault();

    if (isLoading) return;

    // Basic validation
    if (!data.amount || Number(data.amount) <= 0) {
      return alert("Please enter a valid amount");
    }

    if (!data.beneficiary_id) {
      return alert("Please enter beneficiary ID");
    }

    setIsLoading(true);

    try {
      const { transaction_id } = await api.createTransaction(account.id, {
        amount: Number(data.amount),
        remark: data.remark,
        beneficiary: {
          id: data.beneficiary_id,
        },
        supporting_document: data.supporting_document || undefined,
        purpose_of_transaction: data.purpose_of_transaction || undefined,
      });

      await murarlCustodial.initialize();
      if (!murarlCustodial.isSessionActive()) {
        const publicKey = murarlCustodial.getPublicKey();
        if (!publicKey) return alert("Could not get public key");

        const { authenticatorId, approver } = await api.initiateTransaction(
          publicKey
        );

        const code = prompt(`Enter code sent to ${approver.email}`);
        if (!code) return alert("A code must be provided");
        await murarlCustodial.startSession({ code, authenticatorId });
      }

      const payload = await api.getTransactionToSign(transaction_id);
      const signature = await murarlCustodial.signPayoutPayload(payload);
      if (!signature) return alert("Could not get signature");

      await api.executeTransaction(transaction_id, signature);

      alert("Transaction completed successfully!");

      // Reset form
      setData(initialData);
    } catch (error) {
      console.error("Transaction error:", error);
      alert("Transaction failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <h3>{account?.name || "Account"}</h3>
      <p>
        Balance: {account?.balance || "0"} {account?.currency || "USD"}
      </p>

      <form onSubmit={onSubmit}>
        <div>
          <label htmlFor="amount">Amount:</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={data.amount}
            onChange={handleInputChange}
            step="0.01"
            min="0"
            required
          />
        </div>

        <div>
          <label htmlFor="currency">Currency:</label>
          <input
            type="text"
            id="currency"
            name="currency"
            value={data.currency}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <label htmlFor="beneficiary_id">Beneficiary ID:</label>
          <input
            type="text"
            id="beneficiary_id"
            name="beneficiary_id"
            value={data.beneficiary_id}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <label htmlFor="remark">Remark:</label>
          <input
            type="text"
            id="remark"
            name="remark"
            value={data.remark}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label htmlFor="supporting_document">
            Supporting Document (optional):
          </label>
          <input
            type="file"
            id="supporting_document"
            name="supporting_document"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          />
          {data.supporting_document && <p>File uploaded successfully</p>}
        </div>

        <div>
          <label htmlFor="purpose_of_transaction">
            Purpose of Transaction (optional):
          </label>
          <select
            id="purpose_of_transaction"
            name="purpose_of_transaction"
            value={data.purpose_of_transaction}
            onChange={handleInputChange}
          >
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div>
          {quote ? (
            <div>
              <div>
                <p>
                  Rate: 1 USD = {quote.rate} {data.currency.toUpperCase()}
                </p>
                <hr />
                <p>Fees: {quote.fees.total} USD</p>
              </div>
              <button type="submit" disabled={isLoading}>
                {isLoading ? "Processing..." : "Submit Transaction"}
              </button>
            </div>
          ) : (
            <button type="button" onClick={getQuote} disabled={isLoading}>
              {isLoading ? "Processing..." : "Get quote"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default Account;
