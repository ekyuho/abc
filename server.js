const express = require('express')
const app = express()
bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

myutil = require("./myutil")
require('date-utils')

app.get('/', function (req, res) {
    console.log("touched /")
    res.send('Your IP Address is '+ req.ip.replace(/^.*:/, ''))
})

//  curl "http://localhost:9900/logone?u=1&f=3&s=44&i=0H12.75,0T17.32,0C595,0M0,0Q5,0D18,1D27,0S33,1S47"

app.all('/add|/logone', function(req, res) {
    var u3
    var s3
    r2 = {}

    switch(req.method) {
        case "GET":
            r = req.query;
            u1 = String(r.u)
            if (u1.indexOf(',') > -1) {
                u2 = u1.split(",")
                u3 = u2[0]
            } else u3 = u1

            if (r.format == '2') {
                u3 = r.user
                r2.u = r.user
                r2.s = r.serial
                r2.i = String(r.items).replace(/-/g,"")
                //console.log('r2.i='+ r2.i)
                r2.f = '3'
                r = r2
            }
            break
        case "POST":
            r = req.body
            //console.log('%j', req.body)
            u3 = r.u
            s3 = r.s
            //console.log(`POST ${s3}, ${r.s}`)
            break
        default:
            console.log("Unknowd Method");
            console.log(req);
            break;
    }
    if (r.f != '3' && r.f != '4E' && r.f != 'E') {
        console.log('format != 3,E,4E %j', r)
    }

    if (! /[0-9]+/.test(u3)) {
        cosole.log(`Wrong user: %j`, r)
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end(`X-NACK: data fomat err, ${req.ip.replace(/^.*:/, '')} `+ JSON.strinfify(r));
        return false;
    }

    var start = new Date();
    t1 = JSON.stringify(r)
    if (t1.length > 100) t1 = t1.slice(0,100)+'...'

    console.log(start.toFormat("MM-DD HH24:MI:SS ")+req.method+' '+u3 +' '+ t1)
    r.ip = req.ip.replace(/^.*:/, '');
    myutil.getpost(r, res);
});

app.listen(9500, () => console.log('listening on port 9500!'))
