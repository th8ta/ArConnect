import type { JWKInterface } from "arweave/web/lib/wallet";
import Arweave from "arweave";
import { defaultGateway } from "~gateways/gateway";
import { WalletUtils } from "~utils/wallets/wallets.utils";
import { Link } from "~wallets/router/components/link/Link";
import { MockedFeatureFlags } from "~utils/authentication/fakeDB";
import { WalletService } from "~utils/wallets/wallets.service";
import { useAuth } from "~utils/authentication/authentication.hooks";

export function AuthImportWalletEmbeddedView() {
  const { addWallet } = useAuth();

  const handleImport = async () => {
    // TODO: Add inputs to grab these:
    const importedSeedPhrase: string | null = null;
    const importedJWK: JWKInterface | null = null;

    const jwk =
      importedJWK || (await WalletUtils.generateWalletJWK(importedSeedPhrase));
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

    if (importedSeedPhrase && MockedFeatureFlags.maintainSeedPhrase) {
      WalletUtils.storeEncryptedSeedPhrase(importedSeedPhrase, jwk);
    }

    addWallet(jwk, dbWallet);
  };

  return (
    <div>
      <h3>Import Wallet</h3>
      <p>...</p>
      <button onClick={handleImport}>Import</button>
      <Link to="/auth/generate-wallet">Back</Link>
    </div>
  );
}
