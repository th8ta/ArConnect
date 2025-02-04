export const tabs = {
  create: async ({ url }) => {
    if (process.env.NODE_ENV === "development")
      console.log(`tabs.create({ ${url} })`);

    // URL =
    // browser.runtime.getURL("tabs/welcome.html")
    // browser.runtime.getURL("tabs/dashboard.html#/contacts")
    // browser.runtime.getURL("assets/animation/arweave.png");
    // browser.runtime.getURL("tabs/auth.html")}?${objectToUrlParams(...)}
    // `tabs/dashboard.html#/apps/${activeApp.url}`

    if (url === "tabs/welcome.html") {
      throw new Error("Welcome routes not added to ArConnect Embedded");

      // location.hash = "/welcome";
    } else if (url.startsWith("tabs/dashboard.html#")) {
      throw new Error("Dashboard not added to ArConnect Embedded");

      // const hash = url.split("#").pop();
      // location.hash = `/quick-settings${hash}`;
    } else if (url.startsWith("tabs/auth.html")) {
      console.warn("Trying to open `tabs/auth.html`");

      const paramsAndHash = url.replace("tabs/auth.html", "");
      location.hash = `/auth${paramsAndHash}`;
    } else if (url.startsWith("assets")) {
      throw new Error(`Cannot create tab for URL = ${url}`);
    } else {
      throw new Error(`Cannot create tab for URL = ${url}`);
    }
  },

  query: async () => {
    const parentURL =
      window.location.href === window.parent.location.href
        ? document.location.href
        : document.referrer;

    return { url: parentURL }; // satisfies browser.Tabs.Tab
  },

  onConnect: {
    addListener: () => {},
    removeListener: () => {}
  },

  onUpdated: {
    addListener: () => {},
    removeListener: () => {}
  }
};
