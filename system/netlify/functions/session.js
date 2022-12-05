// Session
// Produces a valid URL for a given session backend.

/* #region todo 📓 
- [] Add a SAAS cache to replace "backends" maybe redis? 
+ Done
- [x] Produce a local URL when in development.
#endregion */

const dev = false; //process.env.NETLIFY_DEV;

async function fun(event, context) {
  let out,
    status = 200;
  if (dev) {
    out = { url: "http://localhost:8889" };
  } else {
    const { got } = await import("got");
    const slug = event.path.slice(1).split("/")[1];
    const jamSocketToken = process.env.JAMSOCKET_ACCESS_TOKEN;
    out = {};

    // rep.header("Access-Control-Allow-Origin", corsOrigin);

    // 1. Check to see if we actually should make a backend.
    if (slug.length === 0) {
      status = 500;
      out = { msg: "😇 Sorry. No backend could be spawned!" };
    }

    // Check to see if an "existing" backend for this slug is still alive.
    let headers;

    // TODO: Replace with redis or database. 🔴
    // if (backends[slug])
    //   headers = await got(
    //     `https://api.jamsocket.com/backend/${backends[slug].name}/status`
    //   ).json();

    if (headers?.state !== "Ready") {
      // Make a new session backend if one doesn't already exist.
      const session = await got
        .post({
          url: "https://api.jamsocket.com/user/jas/service/session-server/spawn",
          json: { grace_period_seconds: 60 }, // jamsocket api settings
          headers: { Authorization: `Bearer ${jamSocketToken}` },
        })
        .json(); // Note: A failure will yield a 500 code here to the client.

      // TODO: Replace with redis or database. 🔴
      // backends[slug] = session;

      out = session;
    }
    // TOOD: Pull from redis or database. 🔴
    // else return { ...backends[slug], preceding: true }; // Or return a cached one and mark it as preceding.
  }

  return {
    statusCode: status,
    body: JSON.stringify(out),
  };
}

export const handler = fun;
