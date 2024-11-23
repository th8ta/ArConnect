import { uploadDataToTurbo } from "~api/modules/dispatch/uploader";
import { getActiveKeyfile, type DecryptedWallet } from "~wallets";
import { freeDecryptedWallet } from "~wallets/encryption";
import { createData, ArweaveSigner } from "arbundles";
import { concatGatewayURL } from "~gateways/utils";
import { findGateway } from "~gateways/wayfinder";
import browser from "webextension-polyfill";
import Arweave from "arweave";
import { signAuth } from "~api/modules/sign/sign_auth";
import { getActiveTab } from "~applications";
import { sleep } from "~utils/sleep";
import { sendMessage, type OnMessageCallback } from "@arconnect/webext-bridge";
import type { JSONObject } from "@segment/analytics-next";

export interface PageData extends JSONObject {
  content: string;
  mimeType: string;
  title: string;
}

export interface ArchiveResult extends JSONObject {
  transactionId?: string;
  status: "OK" | "FAILED";
  error?: string;
}

/**
 * Handles the request from the user to archive the page to Arweave
 */
export const handleArchiveRequest: OnMessageCallback<
  PageData,
  ArchiveResult
> = async ({ data: pageData, sender }) => {
  if (sender.context !== "content-script") {
    return { status: "FAILED", error: "Not allowed" };
  }

  // wallet
  let decryptedWallet: DecryptedWallet;

  try {
    // build data blog
    const data = new Blob([pageData.content], { type: pageData.mimeType });

    // get user wallet
    decryptedWallet = await getActiveKeyfile();

    if (decryptedWallet.type === "hardware") {
      return {
        status: "FAILED",
        error: "Cannot archive with a hardware wallet."
      };
    }

    // extension manifest
    const manifest = browser.runtime.getManifest();

    // setup tags
    const tags = [
      { name: "App-Name", value: manifest.name },
      { name: "App-Version", value: manifest.version },
      { name: "Type", value: "Archive" },
      { name: "Content-Type", value: pageData.mimeType },
      { name: "archive:title", value: pageData.title },
      { name: "archive:timestamp", value: new Date().getTime().toString() }
    ];

    let transactionId: string;

    // find a gateway to upload and display the result
    const gateway = await findGateway({});
    const arweave = Arweave.init(gateway);

    // create data item
    const dataSigner = new ArweaveSigner(decryptedWallet.keyfile);
    const transactionData = new Uint8Array(await data.arrayBuffer());
    const dataEntry = createData(transactionData, dataSigner, { tags });

    // calculate reward for the transaction
    const reward = await arweave.transactions.getPrice(
      transactionData.byteLength
    );

    // get active tab
    const activeTab = await getActiveTab();

    await signAuth(
      activeTab.url,
      // @ts-expect-error
      {
        ...dataEntry.toJSON(),
        reward,
        sizeInBytes: transactionData.byteLength
      },
      decryptedWallet.address
    );

    await sendMessage(
      "archive-authorized",
      null,
      `content-script@${sender.tabId}`
    );

    try {
      // sign an upload data
      await dataEntry.sign(dataSigner);
      await uploadDataToTurbo(dataEntry, "https://turbo.ardrive.io");

      transactionId = dataEntry.id;
    } catch (error) {
      // sign & post if there is something wrong with turbo

      const transaction = await arweave.createTransaction(
        { data: transactionData },
        decryptedWallet.keyfile
      );

      for (const tag of tags) {
        transaction.addTag(tag.name, tag.value);
      }

      // sign and upload
      await arweave.transactions.sign(transaction, decryptedWallet.keyfile);
      const uploader = await arweave.transactions.getUploader(transaction);

      while (!uploader.isComplete) {
        await uploader.uploadChunk();
      }

      transactionId = transaction.id;
    }

    await sleep(2000);

    // open in new tab
    await chrome.tabs.create({
      url: `${concatGatewayURL(gateway)}/${transactionId}`
    });

    return { status: "OK", transactionId };
  } catch (e) {
    return { status: "FAILED", error: String(e) || "Failed to archive page" };
  } finally {
    // free wallet from memory
    if (decryptedWallet?.type == "local") {
      freeDecryptedWallet(decryptedWallet.keyfile);
    }
  }
};
