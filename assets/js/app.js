// If you want to use Phoenix channels, run `mix help phx.gen.channel`
// to get started and then uncomment the line below.
// import "./user_socket.js"

// You can include dependencies in two ways.
//
// The simplest option is to put them in assets/vendor and
// import them using relative paths:
//
//     import "../vendor/some-package.js"
//
// Alternatively, you can `npm install some-package --prefix assets` and import
// them using a path starting with the package name:
//
//     import "some-package"
//

// Include phoenix_html to handle method=PUT/DELETE in forms and buttons.
import "phoenix_html";
// Establish Phoenix Socket and LiveView configuration.
import { Socket } from "phoenix";
import { LiveSocket } from "phoenix_live_view";
import topbar from "../vendor/topbar";

let Hooks = {};

const ActivityEvents = ["mousemove", "keyup", "keydown", "click"];
const reportCooldown = 30 * 1000;
const timeToIdle = 10 * 1000;

Hooks.KeepAlive = {
  mounted() {
    this.active = true;
    this.lastChange = Date.now();

    this.handleActivity = () => {
      this.active = true;
      this.lastChange = Date.now();
    };

    this.report = () => {
      this.pushEventTo("#keep-alive", "user_activity_report", {
        active: this.active,
        last_change: this.lastChange,
      });

      if (Date.now() - this.lastChange >= timeToIdle && this.active) {
        this.active = false;
        this.lastChange = Date.now();
      }
    };

    this.reportInterval = setInterval(this.report, reportCooldown);

    ActivityEvents.forEach((event) => {
      window.addEventListener(event, this.handleActivity);
    });

    this.handleEvent("session_refresh", () => {
      function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(";").shift();
      }

      const token = getCookie("_access_token");

      if (token) {
        document.cookie = `_access_token=${token}; MaxAge=${3600}; Path=/; Secure=true; SameSite=lax;`;
      }
    });

    this.report();
  },

  destroyed() {
    ActivityEvents.forEach((event) => {
      window.removeEventListener(event, this.handleEvent);
    });

    clearInterval(this.reportInterval);
  },
};

let csrfToken = document
  .querySelector("meta[name='csrf-token']")
  .getAttribute("content");
let liveSocket = new LiveSocket("/live", Socket, {
  longPollFallbackMs: 2500,
  params: { _csrf_token: csrfToken },
  hooks: Hooks,
});

// Show progress bar on live navigation and form submits
topbar.config({ barColors: { 0: "#29d" }, shadowColor: "rgba(0, 0, 0, .3)" });
window.addEventListener("phx:page-loading-start", (_info) => topbar.show(300));
window.addEventListener("phx:page-loading-stop", (_info) => topbar.hide());

// connect if there are any LiveViews on the page
liveSocket.connect();

// expose liveSocket on window for web console debug logs and latency simulation:
// >> liveSocket.enableDebug()
// >> liveSocket.enableLatencySim(1000)  // enabled for duration of browser session
// >> liveSocket.disableLatencySim()
window.liveSocket = liveSocket;

// TODO: Add some kind of hook or ability to add loading states whenever a request is inflight
