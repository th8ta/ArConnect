export const wanderButtonTemplateContent = (customStyles = "") => `
<style>
  .button {
    position: fixed;
    display: flex;
    align-items: center;
    gap: var(--gapInside);
    outline: none;
    user-select: none;
    cursor: pointer;
    transition: transform linear 50ms;

    min-width: var(--minWidth);
    min-height: var(--minHeight);
    z-index: var(--zIndex);
    padding: var(--padding);
    font: var(--font);

    background: var(--background);
    color: var(--color);
    border: var(--borderWidth) solid var(--borderColor);
    border-radius: var(--borderRadius);
    box-shadow: var(--boxShadow);
  }

  .button:hover .wanderLogo {
    animation: sail 3s infinite;
  }

  .button:active {
    transform: scale(0.95);
  }

  .logos {
    position: relative;
  }

  .wanderLogo {
    width: 32px;
    aspect-ratio: 1;
  }

  .dappLogo {
    position: absolute;
    bottom: 0;
    right: 0;
    background: red;
    width: 16px;
    height: 16px;
  }

  .isConnected .dappLogo {
    transform: none;
  }

  .label:empty {
    display: none;
  }

  .label:not(:empty) + .balance {
    display: none;
  }

  .notifications {
    position: absolute;
    right: -4px;
    bottom: -4px;
    z-index: -1;
    padding: 2px 4px;
    background: red;
    border-radius: 16px;
    font-size: 12px;
    font-weight: bold;
    min-height: 22px;
    min-width: 22px;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform linear 150ms;
  }

  .notifications:empty {
    transform: scale(0);
  }

  @keyframes sail {
    0% {
      transform: rotate(-10deg) translate(0, 1px);
    }
    50% {
      transform: rotate(10deg) translate(0, -1px);
    }
    100% {
      transform: rotate(-10deg) translate(0, 1px);
    }
  }

  ${customStyles}
</style>

<button class="button">

  <span class="logos>
    <svg
      class="wanderLogo"
      viewBox="0 0 257 121"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">

      <path fill-rule="evenodd" clip-rule="evenodd" d="M177.235 60.5134L131.532 2.56198C129.607 0.0634354 127.719 -0.344614 125.651 2.33897L79.8771 60.4191L124.181 100.462L128.483 8.72145L132.785 100.462L177.235 60.5134Z" fill="url(#gradient1)"/>
      <path d="M209.689 120.406L256.138 21.2852C257.135 19.114 254.755 16.9443 252.685 18.1364L183.231 58.0562L138.086 108.914L209.689 120.406Z" fill="url(#gradient2)"/>
      <path d="M47.211 120.406L0.762138 21.2853C-0.234245 19.1141 2.14523 16.9445 4.21552 18.1365L73.6694 58.0564L118.814 108.914L47.211 120.406Z" fill="url(#gradient3)"/>

      <defs>
        <linearGradient
          id="gradient1"
          x1="128.213"
          y1="100.462"
          x2="128.213"
          y2="0.5"
          gradientUnits="userSpaceOnUse">
          <stop stop-color="#6B57F9"/>
          <stop offset="1" stop-color="#9787FF"/>
        </linearGradient>

        <linearGradient
          id="gradient2"
          x1="156.561"
          y1="80.0762"
          x2="218.926"
          y2="115.502"
          gradientUnits="userSpaceOnUse">
          <stop stop-color="#6B57F9"/>
          <stop offset="1" stop-color="#9787FF"/>
        </linearGradient>

        <linearGradient
          id="gradient3"
          x1="100.34"
          y1="80.0764"
          x2="37.9744"
          y2="115.502"
          gradientUnits="userSpaceOnUse">
          <stop stop-color="#6B57F9"/>
          <stop offset="1" stop-color="#9787FF"/>
        </linearGradient>
      </defs>
    </svg>

    <img class="dappLogo" />
  </span>

  <span class="label">Sign in</span>
  <span class="balance"></span>
  <span class="notifications"></span>
</button>
`;
