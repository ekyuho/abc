var fs = require('fs')

function write(str) {
    var fname = (new Date()).toFormat("YYYY-MM-DD.csv");

    fs.appendFile(fname, str, function(err) {
        if (err) throw err
    })
}

function do_format3(r, res) {
    user = ""
    params = ['f', 's', 'u', 'i', 'ip']
    
    diff = Object.keys(r).filter(x => !params.includes(x))
    //console.log(diff)
    if (diff.length > 0 || !('f' in r) || !('s' in r) || !('u' in r) || !('i' in r) || !r.i) {
        if (diff.length > 0) m = 'data fomat err: unaccepted field '+ diff
        else if (!r.i) m = 'got empty r.i'
        else m = 'data format err: must be fsui'
        console.log(m)
        ret = "data fomat err, "+ m
        return ret
    }

    var time = (new Date()).toFormat("YYYY-MM-DD HH24:MI");
    var vv = r.i.split(',')
    var str = ""
    for (i=0; i<vv.length; i++) {
        v = vv[i]
        var re = /^(\d+)([A-Z]*)([-\d\.]*)$/;  // 25T-2.5   no dash
        var m = v.match(re);

        if (m == null) {
            console.log("?? v="+ v);
            continue
        }


        var o = {};
        // Quick work around from bugs.
        if (Array.isArray(r.u)) o.user = r.u[0];
        else o.user = r.u;
        o.type = m[2];
        o.value = m[3];
        o.user2 = m[1];
        o.serial = r.s;
        o.time = time;
        o.ip = r.ip;

        str += o.user +","+ o.serial +","+ o.value +","+ o.type +","+ o.user2 +","+ o.time +","+ o.ip+'\n'
    }
    write(str)
    return "ok"

}

function insert_sensors(user, type, v, user2, serial, ip, res) {

    var d = new Date();
    d = new Date(d.setSeconds(d.getSeconds() - v.length))
    
    var q = ""
    for (var i=0; i<v.length; i++) {
        q += user +","+ serial +","+ v[i] +","+ type +","+ user2 +","+ d.toFormat("YYYY-MM-DD HH24:MI:SS") +","+ ip.replace(/^.*:/, '')
        d = new Date(d.setSeconds(d.getSeconds() + 1))
    }
    write(str)
}

// f=3&s=33&u=5550001&i=45T2.3,
getpost = function getpost(r, res) {
    ret = "ok"
    if (r.f == '3') {
        ret = do_format3(r, res);
    } else if (r.f == 'E') {
        if (!r.type) r.type = 'E'
        if (!r.user2) r.user2 = '0'
        v = r.i.split(",")
        insert_sensors(r.u, r.type, v, r.user2, r.s, r.ip, res);
    } else if (r.f == '4E') {
        if (r.spike.length > 0) {
            console.log(`r.spike= %j`, r.spike)
            for (i=0; i< r.spike.length; i++) {
                k = r.spike[i];
                console.log(`k=%j`, k)
                insert_sensors(r.u, 'P', k.value, k.u2, r.s, r.ip, res);        
            }
        }
        delete r.spike
        ret = do_format3(r, res);
    } else {
        console.log("Unknown format")
        return;
    }

    res.writeHead(200, {'Content-Type': 'text/plain'});
    if (ret == "ok") res.end('X-ACK: '+ JSON.stringify(r));
    else res.end('X-NAK: '+ ret +' '+ JSON.stringify(r))
}

module.exports = {
    getpost: getpost
}
