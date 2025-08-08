import { EndUserCustodialSDK } from "@muralpay/browser-sdk";

class EndUserCustodialSDKWrapper {
  private sdk: EndUserCustodialSDK | null = null;
  private iframeElement: HTMLElement | null = null;

  constructor() {
    console.log("EndUserCustodialSDKWrapper initialized");
  }

  async initialize(iframeContainerId: string = "auth-iframe-container-id") {
    try {
      // Create iframe container if it doesn't exist
      this.iframeElement = document.getElementById(iframeContainerId);
      if (!this.iframeElement) {
        this.iframeElement = document.createElement("div");
        this.iframeElement.id = iframeContainerId;
        this.iframeElement.style.display = "none"; // Hide the iframe for demo
        document.body.appendChild(this.iframeElement);
      }

      console.log("Creating EndUserCustodialSDK instance...");
      this.sdk = await EndUserCustodialSDK.createInstance({
        iframeElement: this.iframeElement,
        iframeContainerId: iframeContainerId,
      });

      console.log("SDK wrapper ready for initialization");
      return true;
    } catch (error) {
      console.error("Failed to initialize SDK:", error);
      return false;
    }
  }

  // Get the public key for email auth flow
  getPublicKey(): string | null {
    if (!this.sdk) {
      console.error("SDK not initialized");
      return null;
    }
    try {
      const publicKey = this.sdk.getPublicKey();
      console.log("Public key retrieved:", publicKey);
      return publicKey;
    } catch (error) {
      console.error("Failed to get public key:", error);
      return null;
    }
  }

  // Start a session with the SDK
  async startSession(payload: { code: string; authenticatorId: string }) {
    if (!this.sdk) {
      throw new Error("SDK not initialized. Call initialize() first.");
    }

    console.log("Starting session with payload:", payload);
    try {
      await this.sdk.startSession(payload);
      console.log("Session started successfully");
      return true;
    } catch (error) {
      console.error("Failed to start session:", error);
      throw error;
    }
  }

  // Check if session is active
  isSessionActive(): boolean {
    if (!this.sdk) {
      console.log("SDK not initialized");
      return false;
    }

    const isActive = this.sdk.isSessionActive();
    console.log("Session active:", isActive);
    return isActive;
  }

  // Clear the current session
  clearSession(): void {
    if (!this.sdk) {
      console.log("SDK not initialized");
      return;
    }

    console.log("Clearing session...");
    this.sdk.clearSession();
    console.log("Session cleared");
  }

  // Get session expiry
  getSessionExpiry(): Date | null {
    if (!this.sdk) {
      console.log("SDK not initialized");
      return null;
    }

    const expiry = this.sdk.getClientSessionExpiry();
    console.log("Session expiry:", expiry);
    return expiry;
  }

  // Sign a payout payload
  async signPayoutPayload(payload: any): Promise<string | null> {
    if (!this.sdk) {
      throw new Error("SDK not initialized. Call initialize() first.");
    }

    console.log("Signing payout payload:", payload);
    try {
      const signature = await this.sdk.signPayoutPayload(payload);
      console.log("Payload signed successfully");
      return signature;
    } catch (error) {
      console.error("Failed to sign payout payload:", error);
      throw error;
    }
  }

  getStatus() {
    const status = {
      initialized: this.sdk !== null,
      sessionActive: this.isSessionActive(),
      sessionExpiry: this.getSessionExpiry(),
      publicKey: this.sdk ? this.getPublicKey() : null,
    };
    console.log("SDK status:", status);
    return status;
  }
}

export default new EndUserCustodialSDKWrapper();
