require('dotenv').config();
const http = require("http");
const fs = require("fs");
var requests = require("requests");

// Read HTML, CSS, and JavaScript files
const homeFile = fs.readFileSync("./src/index.html", "utf-8");
const cssFile = fs.readFileSync("./src/style.css", "utf-8");
const jsFile = fs.readFileSync("./src/script.js", "utf-8");

// Function to replace placeholders in HTML with real-time data
const replaceVal = (tempVal, orgVal) => {
  let temperature = tempVal.replace("{%tempval%}", orgVal.main.temp);
  temperature = temperature.replace("{%tempmin%}", orgVal.main.temp_min);
  temperature = temperature.replace("{%tempmax%}", orgVal.main.temp_max);
  temperature = temperature.replace("{%location%}", orgVal.name);
  temperature = temperature.replace("{%country%}", orgVal.sys.country);
  temperature = temperature.replace("{%tempstatus%}", orgVal.weather[0].main);

  return temperature;
};

const server = http.createServer((req, res) => {
  // Serve HTML file
  if (req.url == "/") {
    requests(
      `https://api.openweathermap.org/data/2.5/weather?q=pune&appid=${process.env.API_KEY}`
    )
      .on("data", (chunk) => {
        const objdata = JSON.parse(chunk);
        const arrData = [objdata];
        // console.log(arrData[0].main.temp);
        const realTimeData = arrData
          .map((val) => replaceVal(homeFile, val))
          .join("");
        res.write(realTimeData);
        // console.log(realTimeData);
      })
      .on("end", (err) => {
        if (err) return console.log("connection closed due to errors", err);
        res.end();
      });
  } 
  // Serve CSS file
  else if (req.url == "/style.css") {
    res.writeHead(200, { "Content-Type": "text/css" });
    res.write(cssFile);
    res.end();
  } 
  // Serve JavaScript file
  else if (req.url == "/script.js") {
    res.writeHead(200, { "Content-Type": "text/javascript" });
    res.write(jsFile);
    res.end();
  } 
  // Handle other requests
  else {
    res.writeHead(404);
    res.end("File not found");
  }
});

server.listen(8000, "127.0.0.1", () => {
  console.log("Server is running on port 8000");
});