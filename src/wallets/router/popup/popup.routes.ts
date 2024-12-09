import { LoadingView } from "~components/page/common/loading/loading.view";
import { HomeView } from "~routes/popup";
import { CollectibleView } from "~routes/popup/collectible/[id]";
import { CollectiblesView } from "~routes/popup/collectibles";
import { ConfirmPurchaseView } from "~routes/popup/confirm";
import { ExploreView } from "~routes/popup/explore";
import { MessageNotificationView } from "~routes/popup/notification/[id]";
import { NotificationsView } from "~routes/popup/notifications";
import { PendingPurchaseView } from "~routes/popup/pending";
import { PurchaseView } from "~routes/popup/purchase";
import { ReceiveView } from "~routes/popup/receive";
import { SendView } from "~routes/popup/send";
import { SendAuthView } from "~routes/popup/send/auth";
import { ConfirmView } from "~routes/popup/send/confirm";
import { RecipientView } from "~routes/popup/send/recipient";
import { ApplicationsView } from "~routes/popup/settings/apps";
import { AppSettingsView } from "~routes/popup/settings/apps/[url]";
import { AppPermissionsView } from "~routes/popup/settings/apps/[url]/permissions";
import { ContactsView } from "~routes/popup/settings/contacts";
import { ContactSettingsView } from "~routes/popup/settings/contacts/[address]";
import { NewContactView } from "~routes/popup/settings/contacts/new";
import { NotificationSettingsView } from "~routes/popup/settings/notifications";
import { QuickSettingsView } from "~routes/popup/settings/quickSettings";
import { TokensSettingsView } from "~routes/popup/settings/tokens";
import { TokenSettingsView } from "~routes/popup/settings/tokens/[id]";
import { NewTokenSettingsView } from "~routes/popup/settings/tokens/new";
import { WalletsView } from "~routes/popup/settings/wallets";
import { WalletView } from "~routes/popup/settings/wallets/[address]";
import { ExportWalletView } from "~routes/popup/settings/wallets/[address]/export";
import { GenerateQRView } from "~routes/popup/settings/wallets/[address]/qr";
import { SubscriptionDetailsView } from "~routes/popup/subscriptions/subscriptionDetails";
import { SubscriptionManagementView } from "~routes/popup/subscriptions/subscriptionManagement";
import { SubscriptionPaymentView } from "~routes/popup/subscriptions/subscriptionPayment";
import { SubscriptionsView } from "~routes/popup/subscriptions/subscriptions";
import { AssetView } from "~routes/popup/token/[id]";
import { TokensView } from "~routes/popup/tokens";
import { TransactionView } from "~routes/popup/transaction/[id]";
import { TransactionsView } from "~routes/popup/transaction/transactions";
import { UnlockView } from "~routes/popup/unlock";
import { getExtensionOverrides } from "~wallets/router/extension/extension.routes";
import type { RouteConfig } from "~wallets/router/router.types";

export type PopupRoutePath =
  | "/"
  | `/purchase`
  | `/confirm-purchase/${string}`
  | `/purchase-pending`
  | `/receive`
  | `/send/transfer`
  | `/send/transfer/${string}`
  | `/send/auth/${string}`
  | `/explore`
  | `/subscriptions`
  | `/subscriptions/${string}`
  | `/subscriptions/${string}/manage`
  | `/subscriptions/${string}/payment`
  | `/transactions`
  | `/notifications`
  | `/notification/${string}`
  | `/tokens`
  | `/token/${string}`
  | `/collectibles`
  | `/collectible/${string}`
  | `/transaction/${string}`
  | `/transaction/${string}/${string}`
  | `/send/confirm/${string}/${string}/${string}`
  | `/send/confirm/${string}/${string}/${string}/${string}`
  | `/send/recipient/${string}/${string}/${string}`
  | `/quick-settings`
  | `/quick-settings/wallets`
  | `/quick-settings/wallets/${string}`
  | `/quick-settings/wallets/${string}/export`
  | `/quick-settings/wallets/${string}/qr`
  | `/quick-settings/apps`
  | `/quick-settings/apps/${string}`
  | `/quick-settings/apps/${string}/permissions`
  | `/quick-settings/tokens`
  | `/quick-settings/tokens/new`
  | `/quick-settings/tokens/${string}`
  | `/quick-settings/contacts`
  | `/quick-settings/contacts/new`
  | `/quick-settings/contacts/${string}`
  | `/quick-settings/notifications`;

export const PopupPaths = {
  Home: "/",
  Purchase: "/purchase",
  ConfirmPurchase: "/confirm-purchase/:quoteId?",
  PendingPurchase: "/purchase-pending",
  Receive: "/receive",
  Send: "/send/transfer/:id?",
  SendAuth: "/send/auth/:tokenID?",
  Explore: "/explore",
  Subscriptions: "/subscriptions",
  SubscriptionDetails: "/subscriptions/:id",
  SubscriptionManagement: "/subscriptions/:id/manage",
  SubscriptionPayment: "/subscriptions/:id/payment",
  Transactions: "/transactions",
  Notifications: "/notifications",
  MessageNotification: "/notification/:id",
  Tokens: "/tokens",
  Asset: "/token/:id",
  Collectibles: "/collectibles",
  Collectible: "/collectible/:id",
  Transaction: "/transaction/:id/:gateway?",
  Confirm: "/send/confirm/:token/:qty/:recipient/:message?",
  Recipient: "/send/recipient/:token/:qty/:message?",
  QuickSettings: "/quick-settings",
  Wallets: "/quick-settings/wallets",
  Wallet: "/quick-settings/wallets/:address",
  ExportWallet: "/quick-settings/wallets/:address/export",
  GenerateQR: "/quick-settings/wallets/:address/qr",
  Applications: "/quick-settings/apps",
  AppSettings: "/quick-settings/apps/:url",
  AppPermissions: "/quick-settings/apps/:url/permissions",
  TokensSettings: "/quick-settings/tokens",
  NewTokenSettings: "/quick-settings/tokens/new",
  TokenSettings: "/quick-settings/tokens/:id",
  Contacts: "/quick-settings/contacts",
  NewContact: "/quick-settings/contacts/new",
  ContactSettings: "/quick-settings/contacts/:address",
  NotificationSettings: "/quick-settings/notifications"
} as const satisfies Record<string, PopupRoutePath>;

export const POPUP_ROUTES = [
  ...getExtensionOverrides({
    unlockView: UnlockView,
    loadingView: LoadingView
  }),
  {
    path: PopupPaths.Home,
    component: HomeView
  },
  {
    path: PopupPaths.Purchase,
    component: PurchaseView
  },
  {
    path: PopupPaths.ConfirmPurchase,
    component: ConfirmPurchaseView
  },
  {
    path: PopupPaths.PendingPurchase,
    component: PendingPurchaseView
  },
  {
    path: PopupPaths.Receive,
    component: ReceiveView
  },
  {
    path: PopupPaths.Send,
    component: SendView
  },
  {
    path: PopupPaths.SendAuth,
    component: SendAuthView
  },
  {
    path: PopupPaths.Explore,
    component: ExploreView
  },
  {
    path: PopupPaths.Subscriptions,
    component: SubscriptionsView
  },
  {
    path: PopupPaths.SubscriptionDetails,
    component: SubscriptionDetailsView
  },
  {
    path: PopupPaths.SubscriptionManagement,
    component: SubscriptionManagementView
  },
  {
    path: PopupPaths.SubscriptionPayment,
    component: SubscriptionPaymentView
  },
  {
    path: PopupPaths.Transactions,
    component: TransactionsView
  },
  {
    path: PopupPaths.Notifications,
    component: NotificationsView
  },
  {
    path: PopupPaths.MessageNotification,
    component: MessageNotificationView
  },
  {
    path: PopupPaths.Tokens,
    component: TokensView
  },
  {
    path: PopupPaths.Asset,
    component: AssetView
  },
  {
    path: PopupPaths.Collectibles,
    component: CollectiblesView
  },
  {
    path: PopupPaths.Collectible,
    component: CollectibleView
  },
  {
    path: PopupPaths.Transaction,
    component: TransactionView
  },
  {
    path: PopupPaths.Confirm,
    component: ConfirmView
  },
  {
    path: PopupPaths.Recipient,
    component: RecipientView
  },
  {
    path: PopupPaths.QuickSettings,
    component: QuickSettingsView
  },
  {
    path: PopupPaths.Wallets,
    component: WalletsView
  },
  {
    path: PopupPaths.Wallet,
    component: WalletView
  },
  {
    path: PopupPaths.ExportWallet,
    component: ExportWalletView
  },
  {
    path: PopupPaths.GenerateQR,
    component: GenerateQRView
  },
  {
    path: PopupPaths.Applications,
    component: ApplicationsView
  },
  {
    path: PopupPaths.AppSettings,
    component: AppSettingsView
  },
  {
    path: PopupPaths.AppPermissions,
    component: AppPermissionsView
  },
  {
    path: PopupPaths.TokensSettings,
    component: TokensSettingsView
  },
  {
    path: PopupPaths.NewTokenSettings,
    component: NewTokenSettingsView
  },
  {
    path: PopupPaths.TokenSettings,
    component: TokenSettingsView
  },
  {
    path: PopupPaths.Contacts,
    component: ContactsView
  },
  {
    path: PopupPaths.NewContact,
    component: NewContactView
  },
  {
    path: PopupPaths.ContactSettings,
    component: ContactSettingsView
  },
  {
    path: PopupPaths.NotificationSettings,
    component: NotificationSettingsView
  }
] as const satisfies RouteConfig[];
