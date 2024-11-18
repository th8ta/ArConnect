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
import type { OnMessageCallback } from "@arconnect/webext-bridge";
import type { JSONObject } from "@segment/analytics-next";

export interface PageData extends JSONObject {
  content: string;
  mimeType: string;
  title: string;
}

export type ReturnType = "OK" | "FAILED";

/**
 * Handles the request from the user to archive the page to Arweave
 */
export const handleArchiveRequest: OnMessageCallback<
  PageData,
  ReturnType
> = async ({ data: pageData, sender }) => {
  if (sender.context !== "content-script") return;

  let returnStatus: ReturnType = "OK";

  // wallet
  let decryptedWallet: DecryptedWallet;

  try {
    // build data blog
    const data = new Blob([pageData.content], { type: pageData.mimeType });

    // get user wallet
    decryptedWallet = await getActiveKeyfile();

    if (decryptedWallet.type === "hardware")
      throw new Error("Cannot archive with a hardware wallet.");

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

    try {
      // sign an upload data
      await dataEntry.sign(dataSigner);
      await uploadDataToTurbo(dataEntry, "https://turbo.ardrive.io");

      await sleep(2000);

      // this has to be one of FAILED, INVALID_DATA, INVALID_TICKET, OK
      // resultCallback("OK");

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

      await sleep(2000);

      transactionId = transaction.id;
    }

    // open in new tab
    await chrome.tabs.create({
      url: `${concatGatewayURL(gateway)}/${transactionId}`
    });
    returnStatus = "OK";
  } catch (e) {
    returnStatus = "FAILED";
    console.log("Printing failed:\n", e);
    // resultCallback("FAILED");
  }

  // free wallet from memory
  if (decryptedWallet?.type == "local")
    freeDecryptedWallet(decryptedWallet.keyfile);

  return returnStatus;
};
