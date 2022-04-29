// Place your server entry point code here


// Require Express.js
const express = require('express');
const app = express();

// require morgan
const morgan = require('morgan')

// require database stuff
const fs = require ('fs')
const db = require("./src/services/database")

// get user input arguments
const args = require('minimist')(process.argv.slice(2))


args["debug"] || false
var debug = args.debug
args["help"]

// store help text
const help = (`
server.js [options]
--port	Set the port number for the server to listen on. Must be an integer
            between 1 and 65535.
--debug	If set to true, creates endlpoints /app/log/access/ which returns
            a JSON access log from the database and /app/error which throws 
            an error with the message "Error test successful." Defaults to 
            false.
--log		If set to false, no log files are written. Defaults to true.
            Logs are always written to database.
--help	Return this message and exit.
`)

// If --help or -h, echo help text to STDOUT and exit
if (args.help || args.h) {
  console.log(help)
  process.exit(0)
}

// error endpoint
if (args.debug === true) {

  app.get('/app/log/access', (req,res) => {
    // the strange stuff was previously 'SELECT * FROM accesslog'
    const stmt = db.prepare("\[\{.*(id).*\}\]").all()
    res.status(200).json(stmt)
  })

  app.get('/app/error', (req,res) => {
    throw new Error('Error test successful.')
  })

}


let portNum = require('minimist')(process.argv.slice(2));
var port = args.port || 5555;


const server = app.listen(port, () => {
    console.log('App is running on port %PORT%'.replace('%PORT%', port))
})


function coinFlip() {
    let coinValue;
    let coinNum = Math.random();
    if (coinNum < 0.5 ) {
      coinValue = "heads";
    } else {
      coinValue = "tails";
    }
    return coinValue;
}

app.get('/app/flip', (req, res) => {
    res.status(200).json({ 'flip' : coinFlip()})
})


function coinFlips(flips) {
    const flippies = [];
    for (let i = 0; i < flips; i ++) {
      flippies.push(coinFlip())
    }
    return flippies;
}

function countFlips(array) {
  
    let headsCounter = 0;
    let tailsCounter = 0;
    for (let i = 0; i < array.length; i ++) {
      if (array[i] == "heads") {
        headsCounter += 1;
      } else {
        tailsCounter += 1;
      }
    }
    if (headsCounter == 0 && tailsCounter != 0) {
      const tailFlipsOnly = {tails: tailsCounter};
      return tailFlipsOnly;
    } else if (headsCounter != 0 && tailsCounter == 0) {
      const headFlipsOnly = {heads: headsCounter};
      return headFlipsOnly;
    } else if (headsCounter == 0 && tailsCounter == 0) {
      const noFlips = {};
      return noFlips;
    } else {
      const flips = {tails: tailsCounter, heads: headsCounter};
      return flips;
    }
}

app.get('/app/flips/:number', (req, res) => {
    res.status(200).json({ 'raw' : coinFlips(req.params.number), 'summary' : countFlips(coinFlips(req.params.number))})
})




function flipACoin(call) {
    let currentCoin = coinFlip();
    let status;
  
    if (currentCoin == call) {
      status = "win";
    } else {
      status = "lose";
    }
      
    const output = {call: call, flip: currentCoin, result: status};
    return output;
}


app.get('/app/flip/call/heads', (req, res) => {
    res.status(200).json(flipACoin("heads"))
})


app.get('/app/flip/call/tails', (req, res) => {
    res.status(200).json(flipACoin("tails"))
})


app.get('/app', (req, res) => {
    res.status(200).end('The API is working')
    res.type('text/plain')
})

// this was previously "Endpoint does not exist" in the quotes
app.use(function(req, res){
    res.status(404).send("\[\{.*(id).*\}\]")
    res.type("text/plain")
})



if (args.log == true) {
  // Use morgan for logging to files
  // Create a write stream to append (flags: 'a') to a file
  const WRITESTREAM = fs.createWriteStream('FILE', { flags: 'a' })
  // Set up the access logging middleware
  app.use(morgan('combined', { stream: accesslog }))
}


// Middleware
app.use( (req, res, next) => {
  let logdata = {
      remoteaddr: req.ip,
      remoteuser: req.user,
      time: Date.now(),
      method: req.method,
      url: req.url,
      protocol: req.protocol,
      httpversion: req.httpVersion,
      status: res.statusCode,
      referer: req.headers['referer'],
      useragent: req.headers['user-agent']
  }
  const stmt = db.prepare('INSERT INTO accesslog (remoteaddr, remoteuser, time, method, url, protocol, httpversion, status, referer, useragent) VALUES (?,?,?,?,?,?,?,?,?,?)')
  next()
})




app.get('/app/', (req,res) => {
      res.statusCode = 200;
      res.statusMessage = 'OK';
      res.writeHead(res.statusCode, {'Content-Type' : 'text/plain'});
      res.end(res.statusCode+ ' ' +res.statusMessage);
})