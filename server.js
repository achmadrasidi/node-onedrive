require("dotenv").config();
require("isomorphic-fetch");
const express = require("express");
const oneDriveAPI = require("onedrive-api");
const fs = require("fs");
const axios = require("axios").default;
const mime = require("mime");
const file = "./reviewfazz.PNG"; // Filename you want to upload on your local PC
const onedrive_folder = "testing"; // Folder name on OneDrive
const onedrive_filename = "test.png"; // Filename on OneDrive
const { ClientCredentials, ResourceOwnerPassword, AuthorizationCode } = require("simple-oauth2");
const { Client } = require("@microsoft/microsoft-graph-client");
const { TokenCredentialAuthenticationProvider } = require("@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials");
const { ClientSecretCredential, DeviceCodeCredential } = require("@azure/identity");
const app = express();

const credential = new DeviceCodeCredential("42f2ebfd-eaa5-4efa-8808-27d2edfdcdd826a95df0-102e-4206-953e-1c88b3099d3b", "42f2ebfd-eaa5-4efa-8808-27d2edfdcdd8", ".CK8Q~5B7QkFbEbTrSDk.BPETwUnYGmrMPtnaaNd");
const authProvider = new TokenCredentialAuthenticationProvider(credential, {
  scopes: ["https://graph.microsoft.com/.default"],
});

const client = Client.initWithMiddleware({
  debugLogging: true,
  authProvider,
  // Use the authProvider object to create the class.
});

const PORT = process.env.PORT || 5001;
app.use(express.urlencoded({ extended: true }));

app.get("/new", async (req, res) => {
  try {
    const driveItem = {
      name: "New Folder",
      folder: {},
      "@microsoft.graph.conflictBehavior": "rename",
    };
    const user = await client.api("/me/drive").get();
    res.json(user);
  } catch (error) {
    res.json(error);
  }
});

app.get("/dashboard", async (req, res) => {
  try {
    const form = {
      client_id: "42f2ebfd-eaa5-4efa-8808-27d2edfdcdd8",
      scope: "https://graph.microsoft.com/.default",
      client_secret: ".CK8Q~5B7QkFbEbTrSDk.BPETwUnYGmrMPtnaaNd",
      grant_type: "client_credentials",
    };
    const response = await axios.post("https://login.microsoftonline.com/26a95df0-102e-4206-953e-1c88b3099d3b/oauth2/v2.0/token", form, { "Content-Type": "application/x-www-form-urlencoded" });
    console.log(response);
    const { body } = response;
    // fs.readFile(
    //   file,
    //   read(async (e, f) => {
    //     const config = {
    //       Authorization: "Bearer " + JSON.parse(body).access_token,
    //       "Content-Type": mime.getType(file), // When you use old version, please modify this to "mime.lookup(file)",
    //     };
    //     try {
    //       const result = await axios.put("https://graph.microsoft.com/v1.0/drive/root:/" + onedrive_folder + "/" + onedrive_filename + ":/content", f, config);
    //       res.status(200).json({
    //         data: result,
    //       });
    //     } catch (error) {
    //       console.log(error);
    //     }
    //   })
    // );
  } catch (error) {
    console.log(error);
  }
});
const config = {
  client: {
    id: "42f2ebfd-eaa5-4efa-8808-27d2edfdcdd8",
    secret: ".CK8Q~5B7QkFbEbTrSDk.BPETwUnYGmrMPtnaaNd",
  },
  auth: {
    tokenHost: "https://login.microsoftonline.com/26a95df0-102e-4206-953e-1c88b3099d3b/oauth2/v2.0/token",
  },
};
app.get("/test", (req, res) => {
  (async () => {
    const client = new ClientCredentials(config);

    const tokenParams = {
      scope: "https://graph.microsoft.com/.default",
    };

    try {
      const accessToken = await client.getToken(tokenParams, { json: true });
      client.createToken(accessToken);
      console.log(accessToken);
    } catch (error) {
      console.log("Access Token error", error.message);
    }
  })();
});
app.post("/folder", (req, res) => {
  oneDriveAPI.items
    .createFolder({
      accessToken: process.env.ONEDRIVE_ACCESS_TOKEN,
      rootItemId: "root",
      name: "test",
    })
    .then((item) => {
      res.json(item);
      // returns body of https://dev.onedrive.com/items/create.htm#response
    })
    .catch((error) => res.json(error));
});

app.listen(PORT, console.log(`server running at PORT ${PORT}`));
