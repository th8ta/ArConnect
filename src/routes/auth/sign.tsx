import { decodeSignature, transactionToUR } from "~wallets/hardware/keystone";
import { isSplitTransaction } from "~api/modules/sign/transaction_builder";
import { formatFiatBalance, formatTokenBalance } from "~tokens/currency";
import type { DecodedTag } from "~api/modules/sign/tags";
import type { Tag } from "arweave/web/lib/transaction";
import { useEffect, useMemo, useRef, useState } from "react";
import { useScanner } from "@arconnect/keystone-sdk";
import { useActiveWallet } from "~wallets/hooks";
import { formatAddress } from "~utils/format";
import { getArPrice } from "~lib/coingecko";
import type { UR } from "@ngraveio/bc-ur";
import {
  AmountTitle,
  FiatAmount,
  Properties,
  PropertyName,
  PropertyValue,
  TagValue,
  TransactionProperty
} from "~routes/popup/transaction/[id]";
import { Section, Spacer, Text, useToasts } from "@arconnect/components";
import AnimatedQRScanner from "~components/hardware/AnimatedQRScanner";
import AnimatedQRPlayer from "~components/hardware/AnimatedQRPlayer";
import Wrapper from "~components/auth/Wrapper";
import Progress from "~components/Progress";
import browser from "webextension-polyfill";
import useSetting from "~settings/hook";
import prettyBytes from "pretty-bytes";
import Arweave from "arweave";
import { defaultGateway } from "~gateways/gateway";
import BigNumber from "bignumber.js";
import { useCurrentAuthRequest } from "~utils/auth/auth.hooks";
import { HeadAuth } from "~components/HeadAuth";
import { AuthButtons } from "~components/auth/AuthButtons";
import { getTagValue } from "~tokens/aoTokens/ao";
import { humanizeTimestampTags } from "~utils/timestamp";

export function SignAuthRequestView() {
  const { authRequest, acceptRequest, rejectRequest } =
    useCurrentAuthRequest("sign");

  const { address, transaction, requestedAt } = authRequest;

  // quantity
  const quantity = useMemo(() => {
    if (!transaction?.quantity) {
      return BigNumber("0");
    }

    const arweave = new Arweave(defaultGateway);
    const ar = arweave.ar.winstonToAr(transaction.quantity);

    return BigNumber(ar);
  }, [transaction]);

  // currency setting
  const [currency] = useSetting<string>("currency");

  // arweave price
  const [arPrice, setArPrice] = useState(0);

  useEffect(() => {
    getArPrice(currency)
      .then((res) => setArPrice(res))
      .catch();
  }, [currency]);

  // transaction price
  const fiatPrice = useMemo(
    () => quantity.multipliedBy(arPrice),
    [quantity.toString(), arPrice]
  );

  // transaction fee
  const fee = useMemo(() => {
    if (!transaction?.reward) {
      return "0";
    }

    const arweave = new Arweave(defaultGateway);

    return arweave.ar.winstonToAr(transaction.reward);
  }, [transaction]);

  // transaction size
  const size = useMemo(() => {
    if (!transaction || isSplitTransaction(transaction)) return 0;

    return transaction?.sizeInBytes ?? transaction?.data?.length ?? 0;
  }, [transaction]);

  // tags
  const tags = useMemo<DecodedTag[]>(() => {
    if (!transaction || isSplitTransaction(transaction)) return [];

    // @ts-expect-error
    const tags = transaction.get("tags") as Tag[];
    const decodedTags = tags.map((tag) => ({
      name: tag.get("name", { decode: true, string: true }),
      value: tag.get("value", { decode: true, string: true })
    }));

    return humanizeTimestampTags(decodedTags);
  }, [transaction]);

  const headerTitle = useMemo(() => {
    if (!tags.length) return browser.i18n.getMessage("titles_sign");

    const actionValue = getTagValue("Action", tags);
    const isAOTransaction = tags.some(
      (tag) => tag.name === "Data-Protocol" && tag.value === "ao"
    );

    if (isAOTransaction && actionValue) {
      return actionValue.replace(/-/g, " ");
    }

    return browser.i18n.getMessage("titles_sign");
  }, [tags]);

  // Check if it's a printTx
  const isPrintTx = useMemo(() => {
    return (
      tags.some((tag) => tag.name === "print:title") &&
      tags.some((tag) => tag.name === "print:timestamp")
    );
  }, [tags]);

  const recipient = useMemo(() => {
    if (tags.length === 0) return transaction?.target || "";

    // Warp Token
    const isWarpTx =
      tags.some(
        (tag) => tag.name === "App-Name" && tag.value === "SmartWeaveAction"
      ) && tags.some((tag) => tag.name === "Contract");
    if (isWarpTx) {
      const inputTag = tags.find((tag) => tag.name === "Input");
      if (inputTag?.value) {
        try {
          const inputValue = JSON.parse(inputTag.value);
          if (inputValue?.function === "transfer" && inputValue?.target) {
            return inputValue.target;
          }
        } catch (error) {}
      }
    }

    // AO Token
    const isAOTransferTx =
      tags.some((tag) => tag.name === "Data-Protocol" && tag.value === "ao") &&
      tags.some((tag) => tag.name === "Action" && tag.value === "Transfer");
    if (isAOTransferTx) {
      const recipientTag = tags.find((tag) => tag.name === "Recipient");
      if (recipientTag?.value) return recipientTag.value;
    }

    return transaction?.target || "";
  }, [tags]);

  /**
   * Hardware wallet logic
   */

  // current wallet
  const wallet = useActiveWallet();

  // current page
  const [page, setPage] = useState<"qr" | "scanner">();

  // load tx UR
  const [transactionUR, setTransactionUR] = useState<UR>();

  async function loadTransactionUR() {
    if (
      wallet.type !== "hardware" ||
      !transaction ||
      isSplitTransaction(transaction)
    )
      return;

    // load the ur data
    // TODO: This function is actually mutating the transaction!
    const ur = await transactionToUR(transaction, wallet.xfp, wallet.publicKey);

    setTransactionUR(ur);
  }

  // loading
  const [loading, setLoading] = useState(false);

  // qr-tx scanner
  const scanner = useScanner(async (res) => {
    setLoading(true);

    try {
      // validation
      if (!transaction) {
        throw new Error("Transaction undefined");
      }

      if (wallet?.type !== "hardware") {
        throw new Error("Wallet switched while signing");
      }

      // decode signature
      const data = await decodeSignature(res);

      // reply
      await acceptRequest(data);
    } catch (e) {
      // log error
      console.error(
        `[ArConnect] Error decoding signature from keystone\n${e?.message || e}`
      );

      await rejectRequest("Failed to decode signature from keystone");
    }

    setLoading(false);
  });

  // toast
  const { setToast } = useToasts();

  return (
    <Wrapper>
      <div>
        <HeadAuth title={headerTitle} />
        <Spacer y={0.75} />
        {(!page && (
          <Section>
            {isPrintTx ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center"
                }}
              >
                <PropertyName>
                  {browser.i18n.getMessage("transaction_fee")}
                </PropertyName>
              </div>
            ) : (
              +fiatPrice > 0 && (
                <FiatAmount>
                  {formatFiatBalance(fiatPrice, currency)}
                </FiatAmount>
              )
            )}
            <AmountTitle>
              {isPrintTx
                ? size > 100000
                  ? formatTokenBalance(fee, 5)
                  : formatTokenBalance(0)
                : formatTokenBalance(quantity)}
              <span>AR</span>
            </AmountTitle>
            {isPrintTx && (
              <FiatAmount>{formatFiatBalance(fee, currency)}</FiatAmount>
            )}
            <Properties>
              <TransactionProperty>
                <PropertyName>
                  {browser.i18n.getMessage("transaction_from")}
                </PropertyName>
                <PropertyValue>{formatAddress(address, 6)}</PropertyValue>
              </TransactionProperty>

              {transaction?.target && (
                <TransactionProperty>
                  <PropertyName>
                    {browser.i18n.getMessage("transaction_to")}
                  </PropertyName>
                  <PropertyValue>{formatAddress(recipient, 6)}</PropertyValue>
                </TransactionProperty>
              )}

              {!isPrintTx && (
                <TransactionProperty>
                  <PropertyName>
                    {browser.i18n.getMessage("transaction_fee")}
                  </PropertyName>
                  <PropertyValue>
                    {fee}
                    {" AR"}
                  </PropertyValue>
                </TransactionProperty>
              )}

              <TransactionProperty>
                <PropertyName>
                  {browser.i18n.getMessage("transaction_size")}
                </PropertyName>
                <PropertyValue>{prettyBytes(size)}</PropertyValue>
              </TransactionProperty>

              <Spacer y={0.1} />

              <PropertyName>
                {browser.i18n.getMessage("transaction_tags")}
              </PropertyName>

              <Spacer y={0.05} />

              {tags.map((tag, i) => (
                <TransactionProperty key={i}>
                  <PropertyName>{tag.name}</PropertyName>
                  <TagValue>{tag.value}</TagValue>
                </TransactionProperty>
              ))}
            </Properties>
          </Section>
        )) || (
          <Section>
            <Text noMargin>{browser.i18n.getMessage("sign_scan_qr")}</Text>
            <Spacer y={1.5} />
            {(page === "qr" && <AnimatedQRPlayer data={transactionUR} />) || (
              <>
                <AnimatedQRScanner
                  {...scanner.bindings}
                  onError={(error) =>
                    setToast({
                      type: "error",
                      duration: 2300,
                      content: browser.i18n.getMessage(`keystone_${error}`)
                    })
                  }
                />
                <Spacer y={1} />
                <Text>
                  {browser.i18n.getMessage(
                    "keystone_scan_progress",
                    `${scanner.progress.toFixed(0)}%`
                  )}
                </Text>
                <Progress percentage={scanner.progress} />
              </>
            )}
          </Section>
        )}
      </div>

      <Section>
        <AuthButtons
          authRequest={authRequest}
          primaryButtonProps={
            page === "scanner"
              ? undefined
              : {
                  label: !page
                    ? browser.i18n.getMessage("sign_authorize")
                    : browser.i18n.getMessage("keystone_scan"),
                  disabled:
                    !transaction || loading || authRequest.status !== "pending",
                  loading: !transaction || loading,
                  onClick: async () => {
                    if (!transaction) return;
                    if (wallet.type === "hardware") {
                      // load tx ur
                      if (!page) await loadTransactionUR();

                      // update page
                      setPage((val) => (!val ? "qr" : "scanner"));
                    } else await acceptRequest();
                  }
                }
          }
          secondaryButtonProps={{
            onClick: () => rejectRequest()
          }}
        />
      </Section>
    </Wrapper>
  );
}
