import { access_token, refresh_token } from "./config";

class Api {
  // public baseUrl = "https://api-business.onekard.io/v1";
  public baseUrl = "http://localhost:8888/v1";

  static getHeaders() {
    return {
      Authorization: `Bearer ${access_token}`,
      "X-Refresh": refresh_token,
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  async getAccounts() {
    try {
      const response = await fetch(`${this.baseUrl}/accounts`, {
        method: "GET",
        headers: Api.getHeaders(),
      });

      return (await response.json()).data;
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  async getQuote(amount: number, currency: string) {
    try {
      const response = await fetch(`${this.baseUrl}/transaction/payout/rate`, {
        method: "POST",
        body: JSON.stringify({ amount, currency }),
        headers: Api.getHeaders(),
      });

      return (await response.json()).data;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async getTransactionForm(currency: string) {
    try {
      const response = await fetch(
        `${this.baseUrl}/transaction/form?currency=${currency}`,
        { method: "GET", headers: Api.getHeaders() }
      );

      return (await response.json()).data;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async createTransaction(
    account: string,
    payload: {
      amount: number;
      remark: string;
      beneficiary: {
        id: string;
      };
      save_beneficiary?: boolean;
      supporting_document?: string;
      purpose_of_transaction?: string;
    }
  ) {
    try {
      const response = await fetch(
        `${this.baseUrl}/accounts/${account}/withdraw`,
        {
          method: "POST",
          body: JSON.stringify(payload),
          headers: Api.getHeaders(),
        }
      );

      return (await response.json()).data;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async initiateTransaction(publicKey: string) {
    try {
      const response = await fetch(
        `${this.baseUrl}/transaction/payout/initiate-challenge`,
        {
          method: "POST",
          body: JSON.stringify({ publicKey }),
          headers: Api.getHeaders(),
        }
      );

      return (await response.json()).data;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async getTransactionToSign(transaction_id: string) {
    try {
      const response = await fetch(
        `${this.baseUrl}/transaction/payout/body-to-sign/${transaction_id}`,
        {
          method: "GET",
          headers: Api.getHeaders(),
        }
      );

      return (await response.json()).data;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async executeTransaction(transaction_id: string, signature: string) {
    try {
      const response = await fetch(
        `${this.baseUrl}/transaction/payout/execute/${transaction_id}`,
        {
          method: "POST",
          body: JSON.stringify({ signature, pin: "123456" }),
          headers: Api.getHeaders(),
        }
      );

      return (await response.json()).data;
    } catch (e) {
      console.error(e);
      return null;
    }
  }
}

export default new Api();
