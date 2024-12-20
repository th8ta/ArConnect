import { useAuth } from "~utils/authentication/authentication.hooks";
import { WalletService } from "~utils/wallets/wallets.service";
import { WalletUtils } from "~utils/wallets/wallets.utils";
import { Link } from "~wallets/router/components/link/Link";
import Arweave from "arweave";
import { defaultGateway } from "~gateways/gateway";
import { MockedFeatureFlags } from "~utils/authentication/fakeDB";

export function AuthGenerateWalletEmbeddedView() {
  const { authMethod, addWallet } = useAuth();

  const handleContinue = async () => {
    const seedPhrase = await WalletUtils.generateSeedPhrase();
    const jwk = await WalletUtils.generateWalletJWK(seedPhrase);
    const { authShare, deviceShare } =
      await WalletUtils.generateWalletWorkShares(jwk);
    const deviceSharePublicKey = await WalletUtils.generateSharePublicKey(
      deviceShare
    );
    const arweave = new Arweave(defaultGateway);
    const walletAddress = await arweave.wallets.jwkToAddress(jwk);
    const deviceNonce =
      WalletUtils.getDeviceNonce() || WalletUtils.generateDeviceNonce();

    const dbWallet = await WalletService.createWallet({
      publicKey: jwk.n,
      walletType: "public",
      deviceNonce,
      authShare,
      deviceSharePublicKey,
      canBeUsedToRecoverAccount: false,

      source: {
        type: "generated",
        from: "seedPhrase"
      }
    });

    WalletUtils.storeDeviceNonce(deviceNonce);
    WalletUtils.storeDeviceShare(deviceShare, walletAddress);

    if (MockedFeatureFlags.maintainSeedPhrase) {
      WalletUtils.storeEncryptedSeedPhrase(seedPhrase, jwk);
    }

    await addWallet(jwk, dbWallet);
  };

  return (
    <div>
      <h3>Account Confirmation</h3>
      <p>Your wallet has been created</p>
      <button onClick={handleContinue}>Continue</button>

      <Link to="/auth/import-wallet">
        <button>I already have a wallet</button>
      </Link>

      {authMethod === "passkey" ? (
        <Link to="/auth/add-device">
          <button>Add this device to an existing account</button>
        </Link>
      ) : (
        <Link to="/auth/add-auth-provider">
          <button>Add {authMethod} to an existing account</button>
        </Link>
      )}
    </div>
  );
}
