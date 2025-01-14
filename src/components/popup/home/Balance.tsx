import { formatFiatBalance } from "~tokens/currency";
import { Loading } from "@arconnect/components-rebrand";
import { useEffect, useMemo, useState, type HTMLProps } from "react";
import { useStorage } from "@plasmohq/storage/hook";
import { ExtensionStorage } from "~utils/storage";
import { useBalance } from "~wallets/hooks";
import { getAr24hChange, useArPrice } from "~lib/coingecko";
import useSetting from "~settings/hook";
import styled, { useTheme } from "styled-components";
import { Text } from "@arconnect/components-rebrand";
import BigNumber from "bignumber.js";

export default function Balance() {
  // balance in AR
  const { balance, loaded } = useBalance();
  const [percentage, setPercentage] = useState(BigNumber("0"));

  // balance in local currency
  const [currency] = useSetting<string>("currency");
  const { price } = useArPrice(currency);
  const fiat = useMemo(() => price.multipliedBy(balance), [price, balance]);

  // balance display
  const [hideBalance, setHideBalance] = useStorage<boolean>(
    {
      key: "hide_balance",
      instance: ExtensionStorage
    },
    false
  );

  const [savedAr24hChange, setSavedAr24hChange] = useStorage<{
    value: number;
    timestamp: string;
  }>({
    key: "saved_ar_24h_change",
    instance: ExtensionStorage
  });

  useEffect(() => {
    if (!currency) return;

    (async () => {
      try {
        if (balance.isEqualTo("0")) {
          setPercentage(BigNumber(0));
          return;
        }
        const ar24hChange = await getAr24hChange(currency);

        setSavedAr24hChange({
          value: ar24hChange,
          timestamp: Date.now().toString()
        });

        setPercentage(BigNumber(ar24hChange));
      } catch (error) {
        console.error("Error fetching AR 24h change:", error);

        // Check if we have a saved value
        if (savedAr24hChange) {
          const fallbackPercentage = BigNumber(savedAr24hChange.value);
          setPercentage(fallbackPercentage);
        } else {
          setPercentage(BigNumber(0));
        }
      }
    })();
  }, [balance, currency]);

  return (
    <BalanceHead>
      {!loaded && <Loading style={{ width: "20px", height: "20px" }} />}
      {loaded && (
        <div>
          <BalanceText onClick={() => setHideBalance((val) => !val)} noMargin>
            {(!hideBalance &&
              formatFiatBalance(fiat, currency.toLowerCase())) ||
              "*".repeat(fiat.toFixed(2).length)}
          </BalanceText>

          <PriceChangeIndicator
            percentageChange={percentage}
            fiatChange={formatFiatBalance(
              fiat.multipliedBy(percentage.dividedBy(100)),
              currency.toLowerCase()
            )}
            hideBalance={hideBalance}
          />
        </div>
      )}
    </BalanceHead>
  );
}

function PriceChangeIndicator({
  percentageChange,
  fiatChange,
  hideBalance
}: {
  percentageChange: BigNumber;
  fiatChange: string;
  hideBalance?: boolean;
}) {
  const theme = useTheme();
  const isPositive = percentageChange.isGreaterThanOrEqualTo(0);
  const isZeroChange = percentageChange.isEqualTo(0);
  const absoluteFiatChange = fiatChange.replace(/[+-]/, "");

  return (
    <PercentageChangeContainer>
      <Text variant="secondary" weight="medium" noMargin>
        {isZeroChange ? "" : isPositive ? "+" : "-"}
        {!hideBalance
          ? absoluteFiatChange
          : absoluteFiatChange.charAt(0) +
            "*".repeat(absoluteFiatChange.length - 1)}
      </Text>

      <Text variant="secondary" weight="medium" noMargin>
        ({percentageChange.abs().toFixed(2)}%)
      </Text>
      {!isZeroChange && (
        <TriangleIcon
          negative={!isPositive}
          color={isPositive ? theme.success : theme.fail}
        />
      )}
    </PercentageChangeContainer>
  );
}

interface TriangleIconProps {
  width?: number;
  height?: number;
  color: string;
  negative?: boolean;
}

const TriangleIcon: React.FC<TriangleIconProps> = ({
  width = 8.66,
  height = 6,
  color,
  negative = false
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 9 7"
      fill="none"
      style={{ transform: `rotate(${negative ? "180deg" : "0deg"})` }}
    >
      <path
        d="M4.49999 0.5L8.83012 6.5H0.169861L4.49999 0.5Z"
        fill={color || "#000000"}
      />
    </svg>
  );
};

const PercentageChangeContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
`;

const BalanceHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 0px;
`;

const BalanceText = styled(Text).attrs({
  size: "4xl",
  weight: "medium",
  noMargin: true
})`
  cursor: pointer;
  text-align: center;
`;

export const CompassIcon = (props: HTMLProps<SVGElement>) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...(props as any)}
  >
    <path
      d="M11.75 19.5C16.0302 19.5 19.5 16.0302 19.5 11.75C19.5 7.46979 16.0302 4 11.75 4C7.46979 4 4 7.46979 4 11.75C4 16.0302 7.46979 19.5 11.75 19.5Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13.8596 8.85612C14.2383 8.72991 14.4276 8.66681 14.5535 8.7117C14.663 8.75077 14.7492 8.83698 14.7883 8.94654C14.8332 9.07243 14.7701 9.26174 14.6439 9.64037L13.491 13.0989C13.4551 13.2067 13.4371 13.2607 13.4065 13.3054C13.3794 13.3451 13.3451 13.3794 13.3054 13.4065C13.2607 13.4371 13.2067 13.4551 13.0989 13.491L9.64037 14.6439C9.26174 14.7701 9.07243 14.8332 8.94654 14.7883C8.83698 14.7492 8.75077 14.663 8.7117 14.5535C8.66681 14.4276 8.72991 14.2383 8.85612 13.8596L10.009 10.4011C10.0449 10.2933 10.0629 10.2393 10.0935 10.1946C10.1206 10.1549 10.1549 10.1206 10.1946 10.0935C10.2393 10.0629 10.2933 10.0449 10.4011 10.009L13.8596 8.85612Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
