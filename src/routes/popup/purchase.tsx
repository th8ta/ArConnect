import {
  Text,
  ListItem,
  ButtonV2,
  Loading,
  useToasts,
  ListItemIcon
} from "@arconnect/components";
import { Input as InputV2, useInput } from "@arconnect/components-rebrand";
import browser from "webextension-polyfill";
import { Bank, BankNote01, ChevronDown } from "@untitled-ui/icons-react";
import switchIcon from "url:/assets/ecosystem/switch-vertical.svg";
import styled from "styled-components";
import HeadV2 from "~components/popup/HeadV2";
import { useEffect, useMemo, useState } from "react";
import { PageType, trackPage } from "~utils/analytics";
import type { PaymentType, Quote } from "~lib/onramper";
import { useLocation } from "~wallets/router/router.utils";
import { ExtensionStorage } from "~utils/storage";
import { useDebounce } from "~wallets/hooks";
import { retryWithDelay } from "~utils/promises/retry";
import SliderMenu from "~components/SliderMenu";
import { paymentMethods } from "~utils/ramps";
import { useTheme } from "styled-components";
import arLogo from "url:/assets/ecosystem/ar-logo.svg";
import CommonImage from "~components/common/Image";
import getSymbolFromCurrency from "currency-symbol-map";
import { useStorage } from "@plasmohq/storage/hook";

export function PurchaseView() {
  const { navigate } = useLocation();

  const youPayInput = useInput();
  const debouncedYouPayInput = useDebounce(youPayInput.state, 300);
  const [arConversion, setArConversion] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<any | null>();
  const [paymentMethod, setPaymentMethod] = useState<PaymentType | null>();
  const [showPaymentSelector, setShowPaymentSelector] = useState(false);
  const [showCurrencySelector, setShowCurrencySelector] = useState(false);
  const [quote, setQuote] = useState<Quote | null>();
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [payInputValue, setpayInputValue] = useState<string>("");
  const { setToast } = useToasts();
  const theme = useTheme();

  const [activeAddress] = useStorage<string>({
    key: "active_address",
    instance: ExtensionStorage
  });

  const handlePaymentClose = () => {
    setShowPaymentSelector(false);
  };

  const handleCurrencyClose = () => {
    setShowCurrencySelector(false);
  };

  const showTransakErrorToast = () => {
    setToast({
      type: "error",
      content: browser.i18n.getMessage("transak_unavailable"),
      duration: 2400
    });
  };

  const finishUp = (quote: Quote | null) => {
    if (quote) {
      const rate = quote.fiatAmount / quote.cryptoAmount;
      setExchangeRate(rate);
    }
    setQuote(quote);
    setLoading(false);
  };

  //segment
  useEffect(() => {
    trackPage(PageType.TRANSAK_PURCHASE);
  }, []);

  useEffect(() => {
    const fetchCurrencies = async () => {
      const url =
        "https://api-stg.transak.com/api/v2/currencies/fiat-currencies?apiKey=a2bae4d6-8e3d-4777-b123-3ff31f653aa0";
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const currencyInfo = data.response.map((currency) => ({
          symbol: currency.symbol,
          logo: `https://cdn.onramper.com/icons/tokens/${currency.symbol.toLowerCase()}.svg`,
          name: currency.name,
          paymentOptions: currency.paymentOptions
        }));
        setCurrencies(currencyInfo || []);
        setSelectedCurrency(currencyInfo[0]);
        setPaymentMethod(currencyInfo[0].paymentOptions[0]);
      } catch (error) {
        console.error("Failed to fetch currencies:", error);
      }
    };

    fetchCurrencies();
  }, []);

  useEffect(() => {
    const fetchQuote = async () => {
      setLoading(true);
      setQuote(null);
      if (
        Number(debouncedYouPayInput) <= 0 ||
        debouncedYouPayInput === "" ||
        !selectedCurrency ||
        !paymentMethod
      ) {
        finishUp(null);
        return;
      }
      const baseUrl = "https://api.transak.com/api/v1/pricing/public/quotes";
      const params = new URLSearchParams({
        partnerApiKey: process.env.PLASMO_PUBLIC_TRANSAK_API_KEY,
        fiatCurrency: selectedCurrency?.symbol,
        cryptoCurrency: "AR",
        isBuyOrSell: "BUY",
        network: "mainnet",
        paymentMethod: paymentMethod.id
      });
      if (arConversion) {
        params.append("cryptoAmount", debouncedYouPayInput);
      } else {
        params.append("fiatAmount", debouncedYouPayInput);
      }

      const url = `${baseUrl}?${params.toString()}`;

      try {
        const response = await retryWithDelay(() => fetch(url));
        if (!response.ok) {
          try {
            const resJson = await response.json();
            if (resJson?.error?.message) {
              setToast({
                type: "error",
                content: resJson?.error?.message,
                duration: 2400
              });
            } else {
              throw new Error("Network response was not ok");
            }
          } catch {
            showTransakErrorToast();
          }
          finishUp(null);
          return;
        }
        const data = await response.json();
        finishUp(data.response);
      } catch (error) {
        console.error("Error fetching data:", error);
        showTransakErrorToast();
        finishUp(null);
      }
      setLoading(false);
    };

    if (debouncedYouPayInput) {
      fetchQuote();
    } else {
      setQuote(null);
    }
  }, [debouncedYouPayInput, selectedCurrency, paymentMethod, arConversion]);

  useEffect(() => {
    youPayInput.setState("");
    setExchangeRate(0);
  }, [selectedCurrency]);

  const buyAR = async () => {
    try {
      const baseUrl = "https://global.transak.com/";
      const params = new URLSearchParams({
        apiKey: process.env.PLASMO_PUBLIC_TRANSAK_API_KEY,
        defaultCryptoCurrency: "AR",
        defaultFiatAmount: (quote.fiatAmount + quote.totalFee).toString(),
        defaultFiatCurrency: quote.fiatCurrency,
        walletAddress: activeAddress,
        defaultPaymentMethod: quote.paymentMethod
      });
      const url = `${baseUrl}?${params.toString()}`;
      browser.tabs.create({
        url: url
      });
      navigate("/purchase-pending");
    } catch (error) {
      console.error("Error buying AR:", error);
    }
  };

  const handleInputChange = (event: React.FormEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    input.value = input.value.replace(/[^0-9]/g, "");
    setpayInputValue(input.value);
  };

  return (
    <>
      <HeadV2 title="Buy" />
      <Wrapper>
        <Top>
          <InputV2
            onInput={handleInputChange}
            inputMode="numeric"
            placeholder={
              arConversion
                ? "0"
                : `${getSymbolFromCurrency(selectedCurrency?.symbol) || ""}0`
            }
            {...youPayInput.bindings}
            fullWidth
            hasRightIcon
            iconRight={
              arConversion ? (
                <AR />
              ) : (
                <Tag
                  onClick={() => setShowCurrencySelector(true)}
                  currency={selectedCurrency?.symbol || ""}
                  currencyLogo={selectedCurrency?.logo || ""}
                />
              )
            }
            inputContainerStyle={{
              background: theme.surfaceTertiary,
              height: "90px",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              color: arConversion
                ? quote?.fiatAmount.toString()
                  ? theme.primaryTextv2
                  : theme.input.placeholder.search
                : quote?.cryptoAmount.toString()
                ? theme.primaryTextv2
                : theme.input.placeholder.search
            }}
          />
          <Switch
            onClick={() => {
              setArConversion(!arConversion);
            }}
          >
            <img style={{ height: "20px" }} src={switchIcon} />
          </Switch>
          <InputButton
            style={{
              background: theme.surfaceTertiary,
              height: "90px",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between"
            }}
            innerStyle={{
              fontSize: "40px",
              color: arConversion
                ? quote?.fiatAmount.toString()
                  ? theme.primaryTextv2
                  : theme.input.placeholder.search
                : quote?.cryptoAmount.toString()
                ? theme.primaryTextv2
                : theme.input.placeholder.search
            }}
            disabled={!arConversion}
            label={
              arConversion
                ? browser.i18n.getMessage("buy_screen_pay")
                : browser.i18n.getMessage("buy_screen_receive")
            }
            // label={arConversion ? "You Pay" : "You Receive"}
            onClick={() => setShowCurrencySelector(true)}
            body={
              loading ? (
                <Loading />
              ) : arConversion ? (
                `${getSymbolFromCurrency(selectedCurrency?.symbol) || ""}${
                  quote?.fiatAmount.toFixed(2) ?? "0"
                }`
              ) : (
                quote?.cryptoAmount.toString() ?? "0"
              )
            }
            icon={
              !arConversion ? (
                <AR />
              ) : (
                <Tag
                  currency={selectedCurrency?.symbol || ""}
                  currencyLogo={selectedCurrency?.logo || ""}
                  onClick={() => setShowCurrencySelector(true)}
                />
              )
            }
          />
          {exchangeRate && youPayInput.bindings.value ? (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%"
              }}
            >
              <Label
                style={{
                  paddingTop: "14px",
                  paddingBottom: "0px",
                  fontSize: "14px"
                }}
              >
                Exchange Rate
              </Label>
              <Label
                style={{
                  paddingTop: "14px",
                  paddingBottom: "0px",
                  fontSize: "14px",
                  margin: "right"
                }}
              >
                {getSymbolFromCurrency(selectedCurrency?.symbol) || ""}
                {exchangeRate.toFixed(2)} = 1 AR
              </Label>
            </div>
          ) : (
            ""
          )}
          <Line />
          <InputButton
            style={{ background: "#242426" }}
            label={browser.i18n.getMessage("buy_screen_payment_method_label")}
            onClick={() => setShowPaymentSelector(true)}
            disabled={!paymentMethod}
            body={paymentMethods(paymentMethod)}
            icon={
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <ChevronDown onClick={() => setShowPaymentSelector(true)} />
              </div>
            }
            outerLabel
          />

          <SliderMenu
            title={browser.i18n.getMessage("currency")}
            isOpen={showCurrencySelector}
            onClose={() => {
              setShowCurrencySelector(false);
            }}
          >
            <CurrencySelectorScreen
              onClose={handleCurrencyClose}
              updateCurrency={setSelectedCurrency}
              currencies={currencies}
            />
          </SliderMenu>

          <SliderMenu
            title={browser.i18n.getMessage("buy_screen_payment_method")}
            isOpen={showPaymentSelector}
            onClose={() => {
              setShowPaymentSelector(false);
            }}
          >
            <PaymentSelectorScreen
              payments={selectedCurrency?.paymentOptions}
              updatePayment={setPaymentMethod}
              onClose={handlePaymentClose}
            />
          </SliderMenu>
        </Top>
        <ButtonV2
          disabled={!quote}
          fullWidth
          onClick={async () => {
            await ExtensionStorage.set("transak_quote", quote);
            await buyAR();
          }}
        >
          {!quote ? "Enter amount" : "Review"}
        </ButtonV2>
      </Wrapper>
    </>
  );
}

const AR = () => {
  return (
    <div
      style={{
        cursor: "default",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: "4px"
      }}
    >
      <TokenLogo src={arLogo} />
      <span
        style={{
          fontSize: "16px",
          fontWeight: "bold",
          lineHeight: "1"
        }}
      >
        AR
      </span>
    </div>
  );
};

const Tag = ({
  currency,
  currencyLogo,
  onClick
}: {
  currency: string;
  currencyLogo: string;
  onClick: () => void;
}) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px"
      }}
      onClick={onClick}
    >
      <TokenLogo src={currencyLogo} />
      {currency} <ChevronDown />
    </div>
  );
};

const PaymentSelectorScreen = ({
  onClose,
  updatePayment,
  payments
}: {
  onClose: () => void;
  updatePayment: (payment: any) => void;
  payments: any[];
}) => {
  return (
    <SelectorWrapper>
      {payments.map((payment, index) => {
        if (payment.isActive) {
          const isWireTransfer = payment.id === "pm_us_wire_bank_transfer";
          const isCashApp = payment.id === "pm_cash_app";
          return (
            <ListItem
              key={index}
              small
              title={paymentMethods(payment)}
              description={`processing time ${payment.processingTime}`}
              img={!isWireTransfer && !isCashApp && payment.icon}
              onClick={() => {
                updatePayment(payment);
                onClose();
              }}
            >
              {isWireTransfer && <ListItemIcon as={Bank} />}
              {isCashApp && <ListItemIcon as={BankNote01} />}
            </ListItem>
          );
        }
        return null;
      })}
    </SelectorWrapper>
  );
};

const CurrencySelectorScreen = ({
  onClose,
  updateCurrency,
  currencies
}: {
  onClose: () => void;
  currencies: any[];
  updateCurrency: (currency: any) => void;
}) => {
  const searchInput = useInput();

  const filteredCurrencies = useMemo(() => {
    if (!searchInput.state) {
      return currencies;
    }
    return currencies.filter((currency) => {
      const name = currency.name?.toLowerCase() || "";
      const symbol = currency.symbol?.toLowerCase() || "";
      const searchLower = searchInput.state.toLowerCase();
      return name.includes(searchLower) || symbol.includes(searchLower);
    });
  }, [currencies, searchInput.state]);

  return (
    <SelectorWrapper>
      <div style={{ paddingBottom: "18px" }}>
        <InputV2
          placeholder="Enter currency name"
          fullWidth
          variant="search"
          sizeVariant="small"
          {...searchInput.bindings}
        />
      </div>
      {filteredCurrencies.map((currency, index) => {
        return (
          <ListItem
            key={index}
            small
            title={currency.symbol}
            description={currency.name}
            img={currency.logo}
            onClick={() => {
              updateCurrency(currency);
              onClose();
            }}
          />
        );
      })}
    </SelectorWrapper>
  );
};

const InputButton = ({
  label,
  body,
  icon,
  onClick,
  disabled,
  style,
  innerStyle,
  outerLabel
}: {
  label: string;
  body: string | React.ReactNode;
  icon: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  style?: React.CSSProperties;
  innerStyle?: React.CSSProperties;
  outerLabel?: boolean;
}) => {
  return (
    <div>
      {outerLabel && <Label outer={outerLabel}>{label}</Label>}
      <InputButtonWrapper onClick={onClick} disabled={disabled} style={style}>
        {!outerLabel && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              textAlign: "left"
            }}
          >
            <Label>{label}</Label>
            <div style={innerStyle}>{body}</div>
          </div>
        )}
        {outerLabel && <div style={innerStyle}>{body}</div>}
        {icon}
      </InputButtonWrapper>
    </div>
  );
};

const InputButtonWrapper = styled.button`
  background: ${(props) => props.style?.background ?? "none"};
  color: ${(props) => props.theme.primaryTextv2};
  font-size: ${(props) => props.style?.fontSize ?? "16px"};
  display: flex;
  height: ${(props) => props.style?.height ?? "42px"};
  padding: 10.5px 15px;
  border-radius: 10px;
  width: 100%;
  justify-content: space-between;
  cursor: ${(props) => (props.disabled ? "default" : "pointer")};

  &:hover {
    border-color: ${(props) => !props.disabled && props.theme.primaryTextv2};
  }
`;

const Label = styled.div<{ outer?: boolean }>`
  margin: ${(props) => props.style?.margin || "0"};
  padding-top: ${(props) => props.style?.paddingTop || "0px"};
  padding-bottom: ${(props) => props.style?.paddingBottom || "8px"};
  font-size: ${(props) => props.style?.fontSize || "16px"};
  color: ${(props) =>
    props.outer
      ? props.theme.primaryTextv2
      : props.theme.input.placeholder.default};
`;

const Wrapper = styled.div`
  padding: 15px;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 105px);
  justify-content: space-between;
`;

const Top = styled.div``;

const SelectorWrapper = styled.div`
  width: 100%;
`;

const Switch = styled.button`
  padding: 16px 0;
  display: flex;
  gap: 10px;
  border: none;
  background: none;
  outline: none;
  box-shadow: none;
  cursor: pointer;
  margin: auto;
`;
export const Line = styled.div<{ margin?: string }>`
  margin: ${(props) => (props.margin ? props.margin : "18px")} 0;
  height: 1px;
  width: 100%;
  background-color: #333333;
`;

const SwitchText = styled(Text)`
  color: ${(props) => props.theme.primaryTextv2};
`;

export const TokenLogo = styled(CommonImage).attrs({
  alt: "token-logo",
  draggable: false,
  backgroundColor: "#fffefc"
})`
  height: 24px;
  width: 24px;
  border-radius: 50%;
  display: block;
  vertical-align: middle;
`;
