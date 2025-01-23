import type { ProtocolWithReturn } from "@arconnect/webext-bridge";
import type { DisplayTheme } from "@arconnect/components";
import type { Chunk } from "~api/modules/sign/chunks";
import type { InjectedEvents } from "~utils/events";
import "styled-components";
import type {
  AuthRequestMessageData,
  AuthResult
} from "~utils/auth/auth.types";

declare module "@arconnect/webext-bridge" {
  export interface ProtocolMap {
    /**
     * `api/foreground/foreground-setup-wallet-sdk.ts` use `postMessage()` to send `arweaveWallet.*` calls that are
     * received in `contents/api.ts`, which then sends them to the background using `sendMessage()`.
     */
    api_call: ProtocolWithReturn<ApiCall, ApiResponse>;

    /**
     * `dispatch.foreground.ts` and `sign.foreground.ts` use `sendChunk()` to send chunks to the background.
     */
    chunk: ProtocolWithReturn<ApiCall<Chunk>, ApiResponse<number>>;

    /**
     * `createAuthPopup()` in `auth.utils.ts` sends `auth_request` messages from the background to the auth popup, which
     * are received in `auth.provider.ts`.
     */
    auth_request: AuthRequestMessageData;

    /**
     * `auth.hook.ts` uses `auth_result` messages (calling `replyToAuthRequest()`) to reply to the `AuthRequest`s.
     */
    auth_result: AuthResult<any>;

    /**
     * `signAuth()` in `sign_auth.ts` uses `auth_chunk` to send chunked transactions or binary data from the background
     * to the auth popup.
     */
    auth_chunk: Chunk;

    /**
     * The background sends `auth_tab_closed` messages to notify the auth popup of closed tabs.
     */
    auth_tab_closed: number;

    /**
     * The background sends `auth_tab_reloaded` messages to notify the auth popup of reloaded tabs.
     */
    auth_tab_reloaded: number;

    /**
     * The background sends `auth_active_wallet_change` messages to notify the auth popup of active wallet changes.
     */
    auth_active_wallet_change: number;

    /**
     * The background sends `auth_app_disconnected` messages to notify the auth popup of disconnected apps.
     */
    auth_app_disconnected: number;

    // EMBEDDED:

    embedded_auth: any;
    embedded_balance: any;
    embedded_resize: any;
    embedded_close: any;

    // OTHER:

    switch_wallet_event: string | null;
    copy_address: string;
    event: Event;
    ar_protocol: ProtocolWithReturn<{ url: string }, { url: sting }>;
  }
}

interface ApiCall<DataType = any> extends JsonValue {
  type: string;
  data?: DataType;
  callID: number | string;
}

interface ApiResponse<DataType = any> extends ApiCall<DataType> {
  error?: boolean;
}

interface Event {
  name: keyof InjectedEvents;
  value: unknown;
}

declare module "styled-components" {
  export interface DefaultTheme {
    displayTheme: DisplayTheme;
    theme: string;
    primaryText: string;
    secondaryText: string;
    secondaryTextv2: string;
    background: string;
    backgroundSecondary: string;
    secondaryBtnHover: string;
    inputField: string;
    primary: string;
    backgroundv2;
    cardBorder: string;
    fail: string;
    secondaryDelete: string;
    delete: string;
    cardBackground: string;
    primaryBtnHover: string;
    primaryTextv2: string;
  }
}

declare namespace NodeJS {
  interface ProcessEnv {
    BETA_VERSION?: string;
  }
}
