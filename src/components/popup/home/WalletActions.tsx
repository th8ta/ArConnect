import styled from "styled-components";
import browser from "webextension-polyfill";
import { Text } from "@arconnect/components-rebrand";
import { useLocation, type NavigateAction } from "~wallets/router/router.utils";

export default function WalletActions() {
  const { navigate } = useLocation();

  return (
    <Container>
      {actions.map((action) => (
        <div
          key={action.name}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            cursor: "pointer"
          }}
          onClick={() => navigate(action.route as NavigateAction)}
        >
          <CircleButton color={"#5842F8"}>{action.icon}</CircleButton>
          <ButtonText>{browser.i18n.getMessage(action.label)}</ButtonText>
        </div>
      ))}
    </Container>
  );
}

const SendIcon = () => (
  <svg
    width="57"
    height="59"
    viewBox="0 0 57 59"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g id="Round Button">
      <rect
        x="0.75"
        width="56"
        height="56"
        rx="28"
        fill="url(#paint0_linear_846_505)"
      />
      <g id="Send Icon" filter="url(#filter0_dd_846_505)">
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M31.8038 46.5175L40.7908 17.0111C41.1288 15.6894 40.7821 15.0717 39.3626 15.4347L9.79538 24.4465L23.2284 30.8178L37.9663 18.2779L25.4263 33.0157L31.8038 46.5175Z"
          fill="#FFFEFC"
        />
      </g>
    </g>
    <defs>
      <filter
        id="filter0_dd_846_505"
        x="1.79538"
        y="11.3321"
        width="47.1153"
        height="47.1855"
        filterUnits="userSpaceOnUse"
        color-interpolation-filters="sRGB"
      >
        <feFlood flood-opacity="0" result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset dy="2" />
        <feGaussianBlur stdDeviation="2" />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0"
        />
        <feBlend
          mode="normal"
          in2="BackgroundImageFix"
          result="effect1_dropShadow_846_505"
        />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset dy="4" />
        <feGaussianBlur stdDeviation="4" />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"
        />
        <feBlend
          mode="normal"
          in2="effect1_dropShadow_846_505"
          result="effect2_dropShadow_846_505"
        />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect2_dropShadow_846_505"
          result="shape"
        />
      </filter>
      <linearGradient
        id="paint0_linear_846_505"
        x1="2.46386"
        y1="51.5455"
        x2="55.228"
        y2="3.02133"
        gradientUnits="userSpaceOnUse"
      >
        <stop stop-color="#5842F8" />
        <stop offset="1" stop-color="#6B57F9" />
      </linearGradient>
    </defs>
  </svg>
);

const ReceiveIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="57"
    height="56"
    viewBox="0 0 57 56"
    fill="none"
  >
    <rect
      x="0.75"
      width="56"
      height="56"
      rx="28"
      fill="url(#paint0_linear_846_509)"
    />
    <g filter="url(#filter0_dd_846_509)">
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M25.6415 9.86579L16.6545 39.3722C16.3165 40.6939 16.6632 41.3116 18.0827 40.9486L47.6499 31.9368L34.2169 25.5655L19.479 38.1054L32.019 23.3676L25.6415 9.86579Z"
        fill="#FFFEFC"
      />
    </g>
    <defs>
      <filter
        id="filter0_dd_846_509"
        x="8.53464"
        y="5.86578"
        width="47.1153"
        height="47.1855"
        filterUnits="userSpaceOnUse"
        color-interpolation-filters="sRGB"
      >
        <feFlood flood-opacity="0" result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset dy="2" />
        <feGaussianBlur stdDeviation="2" />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0"
        />
        <feBlend
          mode="normal"
          in2="BackgroundImageFix"
          result="effect1_dropShadow_846_509"
        />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset dy="4" />
        <feGaussianBlur stdDeviation="4" />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"
        />
        <feBlend
          mode="normal"
          in2="effect1_dropShadow_846_509"
          result="effect2_dropShadow_846_509"
        />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect2_dropShadow_846_509"
          result="shape"
        />
      </filter>
      <linearGradient
        id="paint0_linear_846_509"
        x1="2.46386"
        y1="51.5455"
        x2="55.228"
        y2="3.02133"
        gradientUnits="userSpaceOnUse"
      >
        <stop stop-color="#5842F8" />
        <stop offset="1" stop-color="#6B57F9" />
      </linearGradient>
    </defs>
  </svg>
);

const BuyIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="57"
    height="56"
    viewBox="0 0 57 56"
    fill="none"
  >
    <rect
      x="0.75"
      width="56"
      height="56"
      rx="28"
      fill="url(#paint0_linear_846_513)"
    />
    <g filter="url(#filter0_dd_846_513)">
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M28.7754 43.118C37.0597 43.118 43.7754 36.4022 43.7754 28.118C43.7754 19.8337 37.0597 13.118 28.7754 13.118C20.4911 13.118 13.7754 19.8337 13.7754 28.118C13.7754 36.4022 20.4911 43.118 28.7754 43.118ZM28.8337 20.2097C29.6621 20.2097 30.3337 20.8813 30.3337 21.7097V26.8129H35.4369C36.2654 26.8129 36.9369 27.4845 36.9369 28.3129C36.9369 29.1414 36.2654 29.8129 35.4369 29.8129H30.3337V34.9162C30.3337 35.7446 29.6621 36.4162 28.8337 36.4162C28.0053 36.4162 27.3337 35.7446 27.3337 34.9162V29.8129H22.2305C21.402 29.8129 20.7305 29.1414 20.7305 28.3129C20.7305 27.4845 21.402 26.8129 22.2305 26.8129H27.3337V21.7097C27.3337 20.8813 28.0053 20.2097 28.8337 20.2097Z"
        fill="#FFFEFC"
      />
    </g>
    <defs>
      <filter
        id="filter0_dd_846_513"
        x="5.77539"
        y="9.11795"
        width="46"
        height="46"
        filterUnits="userSpaceOnUse"
        color-interpolation-filters="sRGB"
      >
        <feFlood flood-opacity="0" result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset dy="2" />
        <feGaussianBlur stdDeviation="2" />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0"
        />
        <feBlend
          mode="normal"
          in2="BackgroundImageFix"
          result="effect1_dropShadow_846_513"
        />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset dy="4" />
        <feGaussianBlur stdDeviation="4" />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"
        />
        <feBlend
          mode="normal"
          in2="effect1_dropShadow_846_513"
          result="effect2_dropShadow_846_513"
        />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect2_dropShadow_846_513"
          result="shape"
        />
      </filter>
      <linearGradient
        id="paint0_linear_846_513"
        x1="2.46386"
        y1="51.5455"
        x2="55.228"
        y2="3.02133"
        gradientUnits="userSpaceOnUse"
      >
        <stop stop-color="#5842F8" />
        <stop offset="1" stop-color="#6B57F9" />
      </linearGradient>
    </defs>
  </svg>
);

const actions = [
  {
    name: "send",
    label: "send",
    icon: <SendIcon />,
    route: "/send/transfer"
  },
  {
    name: "receive",
    label: "receive",
    icon: <ReceiveIcon />,
    route: "/receive"
  },
  {
    name: "buy",
    label: "buy",
    icon: <BuyIcon />,
    route: "/purchase"
  }
];

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 32px;
`;

const CircleButton = styled.div`
  cursor: pointer;
`;

const ButtonText = styled(Text).attrs({
  variant: "secondary",
  size: "sm",
  weight: "semibold",
  noMargin: true
})``;
