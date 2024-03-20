const router = require("express").Router()

// router.get("/oauth", (req, res) => {
//   const csrfState = Math.random().toString(36).substring(2);
//   res.cookie("csrfState", csrfState, { maxAge: 60000 });

//   let url = "https://www.tiktok.com/v2/auth/authorize/";

//   // the following params need to be in `application/x-www-form-urlencoded` format.
//   url += "?client_key={process.env.TIKTOK_CLIENT_KEY}";
//   url += "&scope=user.info.basic";
//   url += "&response_type=code";
//   url += "&redirect_uri={SERVER_TIKTOK_ENDPOINT_REDIRECT}";
//   url += "&state=" + csrfState;

//   res.redirect(url);
//});
const axios = require("axios");

const tiktokAuthUrl = "https://open-api.tiktok.com/platform/oauth/connect/";
const clientId = process.env.TIKTOK_CLIENT_KEY;
const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
const redirectUri = "https://www.creedlance.net";




// Redirect users to TikTok authorization URL
router.get("/", (req, res) => {
  // const authUrl = `${tiktokAuthUrl}?client_key=${clientId}&redirect_uri=${redirectUri}&scope=user.info.basic+user.info.avatar&response_type=code`;

  const csrfState = Math.random().toString(36).substring(2);
  res.cookie("csrfState", csrfState, { maxAge: 60000 });

  // let url = "https://www.tiktok.com/v2/auth/authorize/";
  let url = "https://open-api.tiktok.com/platform/oauth/connect/";

  // the following params need to be in `application/x-www-form-urlencoded` format.
  url += `?client_key=${clientId}`;
  url += "&scope=user.info.basic";
  url += "&response_type=code";
  url += `&redirect_uri=${redirectUri}`;
  url += "&state=" + csrfState;
  console.log(url)
  res.redirect(url);
});

module.exports = router;





router.get("/callback", async (req, res) => {
  const code = req.query.code;

  const tokenUrl = "https://open-api.tiktok.com/oauth/access_token/";
  const tokenParams = {
    client_key: process.env.TIKTOK_CLIENT_KEY,
    client_secret: process.env.TIKTOK_CLIENT_SECRET,
    code: code,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
  };

  try {
    const tokenResponse = await axios.post(tokenUrl, null, {
      params: tokenParams,
    });
    const accessToken = tokenResponse.data.data.access_token;

    // Save the accessToken and TikTok user ID to your MongoDB
    // Use the user's TikTok ID as a unique identifier
    const tiktokUserId = tokenResponse.data.data.open_id;
    console.log(tiktokUserId)
    await User.findOneAndUpdate(
      { tiktokId: tiktokUserId },
      { accessToken: accessToken },
      { upsert: true }
    );

    res.send("Authentication successful!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error during authentication");
  }
});
