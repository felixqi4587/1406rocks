/* ===========================================================================
   app.js — shared backbone for all 1406rocks pages (KvK, gift codes, future…)
   Defines globals used by every page: helpers, the cloud base URL, the auth
   module (password is NEVER hardcoded — typed once, validated by the Worker,
   kept in sessionStorage), and a clock. New pages just <script src="app.js">.
   =========================================================================== */
window.WBASE = "https://1406rocks-plan.kingshot1406.workers.dev";

/* ---- tiny DOM/format helpers ---- */
window.$ = function (i) { return document.getElementById(i); };
window.esc = function (s) { return (s || "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;"); };
window.pad = function (n) { return (n < 10 ? "0" : "") + n; };
window.clk = function (ms) { var d = new Date(ms); return pad(d.getUTCHours()) + ":" + pad(d.getUTCMinutes()) + ":" + pad(d.getUTCSeconds()); };
window.toast = function (t) { var el = $("toast"); if (!el) return; el.textContent = t; el.classList.add("show"); setTimeout(function () { el.classList.remove("show"); }, 2200); };

/* ---- auth: the admin password is validated server-side and held in sessionStorage,
        so it is never written into the public page source ---- */
window.PW_KEY = "rocks1406_pw";
window.getPw = function () { try { return sessionStorage.getItem(PW_KEY) || ""; } catch (e) { return ""; } };
window.setPw = function (p) { try { sessionStorage.setItem(PW_KEY, p); } catch (e) {} };
window.clearPw = function () { try { sessionStorage.removeItem(PW_KEY); } catch (e) {} };
window.verifyPw = function (p) {
  return fetch(WBASE + "/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: p }) })
    .then(function (r) { return r.ok; }).catch(function () { return false; });
};
// POST to the Worker with the stored password injected
window.authedFetch = function (path, body) {
  body = body || {}; body.password = getPw();
  return fetch(WBASE + path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
};
// ensure we have a valid password (prompt + verify if not). resolves true/false.
window.requireAuth = function (label) {
  if (getPw()) return Promise.resolve(true);
  var p = prompt(label || "管理密码：");
  if (p == null) return Promise.resolve(false);
  return verifyPw(p).then(function (ok) { if (ok) { setPw(p); return true; } toast("密码错误"); return false; });
};

/* ---- shared header clock (fills #utc / #loc if present) ---- */
window.startClock = function () {
  function tick() {
    var d = new Date(), u = $("utc"), l = $("loc");
    if (u) u.textContent = pad(d.getUTCHours()) + ":" + pad(d.getUTCMinutes()) + ":" + pad(d.getUTCSeconds());
    if (l) l.textContent = pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds());
  }
  tick(); setInterval(tick, 500);
};
