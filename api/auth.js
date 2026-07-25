/**
 * Decap CMS — GitHub OAuth 代理 (Vercel Serverless Function)
 * -----------------------------------------------------------
 * 浏览器无法直连 GitHub 换 token（CORS），此函数代为完成 OAuth 握手。
 *
 * 部署方法见项目 README 或 Vercel 控制台。
 *
 * 所需环境变量 (Vercel Dashboard → Project → Settings → Environment Variables)：
 *   GITHUB_CLIENT_ID      = Ov23lioRdgEWBmFGNlvh
 *   GITHUB_CLIENT_SECRET  = 在 GitHub OAuth App 设置里生成的 client secret
 *
 * 本函数同时处理两条路径：
 *   GET  /api/auth                    → 跳转 GitHub 授权
 *   GET  /api/auth?code=&state=       → 换 token + postMessage 握手
 */

export default async function handler(req, res) {
  const { code } = req.query;

  // ── ① 授权流程：跳转 GitHub ──
  if (!code) {
    const state = crypto.randomUUID();
    const githubAuthUrl =
      "https://github.com/login/oauth/authorize" +
      "?client_id=" + process.env.GITHUB_CLIENT_ID +
      "&scope=repo" +
      "&state=" + state;

    // 通过 Set-Cookie 校验 state，防止 CSRF
    res.setHeader("Set-Cookie",
      "sx_state=" + state +
      "; HttpOnly; Secure; Path=/; Max-Age=600; SameSite=Lax"
    );
    // 302 跳转到 GitHub 授权页
    res.status(302).setHeader("Location", githubAuthUrl).end();
    return;
  }

  // ── ② 回调流程：用 code 换 access_token ──
  const returnedState = req.query.state;
  const cookies = req.headers.cookie || "";
  const savedState = (cookies.match(/sx_state=([^;]+)/) || [])[1];

  if (!returnedState || returnedState !== savedState) {
    res.status(403).send("State 校验失败，请求可能被篡改。");
    return;
  }

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });
  const data = await tokenRes.json();

  if (!data.access_token) {
    res.status(401).send("GitHub 授权失败：" + JSON.stringify(data));
    return;
  }

  // 与 Decap CMS (gR 客户端) 的 postMessage 握手
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

  res.setHeader("Set-Cookie",
    "sx_state=; HttpOnly; Secure; Path=/; Max-Age=0"
  );
  res.status(200).setHeader("content-type", "text/html; charset=utf-8").send(html);
}
