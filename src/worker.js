export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const host = (request.headers.get("host") || "").split(":")[0].toLowerCase();

    if (url.hostname === "www.ken-haas.com" || host === "www.ken-haas.com") {
      url.protocol = "https:";
      url.hostname = "ken-haas.com";
      url.port = "";
      return Response.redirect(url.toString(), 301);
    }

    return env.ASSETS.fetch(request);
  },
};
