/**
 * Decap CMS — GitHub OAuth 代理 (Cloudflare Worker)
 * ----------------------------------------------------
 * 浏览器无法直连 GitHub 换 token（CORS），本 Worker 代为完成 OAuth 握手。
 * 部署：Cloudflare 控制台 → Workers → 新建 → 粘贴本文件 → 添加两个 Secret：
 *   GITHUB_CLIENT_ID      = Ov23lioRdgEWBmFGNlvh
 *   GITHUB_CLIENT_SECRET  = 在 GitHub OAuth App 设置里生成的 client secret
 * 并把 GitHub OAuth App 的回调地址设为： https://<你的worker>.workers.dev/callback
 *
 * Decap 端 config.yml 只需：
 *   base_url: https://<你的worker>.workers.dev
 *   auth_endpoint: auth
 *   app_id: Ov23lioRdgEWBmFGNlvh
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ① 登录入口：跳转到 GitHub 授权页
    if (url.pathname === "/auth") {
      const state = crypto.randomUUID();
      const githubAuthUrl =
        `https://github.com/login/oauth/authorize` +
        `?client_id=${env.GITHUB_CLIENT_ID}` +
        `&scope=repo` +
        `&state=${state}`;

      return new Response("Redirecting to GitHub...", {
        status: 302,
        headers: {
          Location: githubAuthUrl,
          "Set-Cookie":
            "sx_state=" + state +
            "; HttpOnly; Secure; Path=/; Max-Age=600; SameSite=Lax",
        },
      });
    }

    // ② 回调：用 code 换 access_token，再与 Decap CMS 完成 postMessage 握手
    if (url.pathname === "/callback") {
      const code = url.searchParams.get("code");
      const returnedState = url.searchParams.get("state");
      const cookies = request.headers.get("Cookie") || "";
      const savedState = (cookies.match(/sx_state=([^;]+)/) || [])[1];

      if (!returnedState || returnedState !== savedState) {
        return new Response("State 校验失败，请求可能被篡改。", { status: 403 });
      }

      const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
        }),
      });
      const data = await tokenRes.json();

      if (!data.access_token) {
        return new Response("GitHub 授权失败：" + JSON.stringify(data), { status: 401 });
      }

      // 与 Decap CMS (gR 客户端) 的握手：先回 "authorizing:github"，
      // 收到 CMS echo 后再回 "authorization:github:success:{token}"
      const html = `<!doctype html><html><body><script>
        (function () {
          function receiveMessage(e) {
            window.opener.postMessage(
              'authorization:github:success:' + JSON.stringify({
                token: ${JSON.stringify(data.access_token)},
                provider: "github"
              }),
              e.origin
            );
          }
          window.addEventListener("message", receiveMessage, false);
          window.opener.postMessage("authorizing:github", "*");
        })();
      </script></body></html>`;

      return new Response(html, {
        headers: {
          "content-type": "text/html; charset=utf-8",
          "Set-Cookie": "sx_state=; HttpOnly; Secure; Path=/; Max-Age=0",
        },
      });
    }

    return new Response("OAuth Proxy is running.", { status: 200 });
  },
};
