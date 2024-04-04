require("dotenv").config();
const bodyParser = require("body-parser");
const express = require("express");
const cors = require("cors");
const startConnection = require("./server.js");
const { URL: URLModule } = require("url");
const URL = require("./model/index.js");
const dns = require("dns");
const { promisify } = require("util");

const dnsLookup = promisify(dns.lookup);
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

async function generateShortURL() {
  try {
    const latestURL = await URL.findOne().sort({ createdAt: -1 });
    if (latestURL) {
      return latestURL.suffix + 1;
    } else {
      return 1;
    }
  } catch (err) {
    console.error(err);
  }
}

async function checkURLValidity(url) {
  try {
    const hostname = new URLModule(url).hostname;

    const { address } = await dnsLookup(hostname);

    console.log(`${hostname} is a valid URL with IP address ${address}`);
    return true;
  } catch (err) {
    return false;
  }
}

async function findLongURL(longURL) {
  try {
    const data = await URL.findOne({ long: longURL });
    return data;
  } catch (error) {
    throw new Error("Communication Failed with the Server");
  }
}
async function findShortURL(suffix) {
  try {
    const data = await URL.findOne({ suffix });
    return data;
  } catch (error) {
    throw new Error("Communication Failed with the Server");
  }
}

app.post("/api/shorturl", async (req, res) => {
  const originalURL = req.body.url;
  const valid = await checkURLValidity(originalURL);

  if (!valid) {
    console.log("url not Stored");
    return res.send({ error: "Invalid url" });
  }

  const urlData = await findLongURL(originalURL);
  if (urlData) {
    res.send({
      original_url: urlData.long,
      short_url: urlData.suffix,
    });
  } else {
    const suffix = await generateShortURL();
    const short =
      req.protocol + "://" + req.get("host") + `/api/shorturl/${suffix}`;

    try {
      const newURL = new URL({
        long: originalURL,
        short,
        suffix,
      });

      await newURL.save();

      res.send({
        original_url: originalURL,
        short_url: suffix,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
  }
});

app.get("/api/shorturl/:suffix", async (req, res) => {
  const { suffix } = req.params;
  const data = await findShortURL(suffix);
  if (data) {
    res.redirect(data.long);
  } else {
    res.sendStatus(404);
  }
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
  startConnection();
});
