String.prototype.trim = function () {
    return this.replace(/^\s*(\S*(\s+\S+)*)\s*$/, "$1");
};

function dayToNum(day) {
    week=["sun","mon","tue","wed","thu","fri","sat"];
    return week.indexOf(day.toLowerCase().substr(0,3));
}

function isDayInRange(di) {
    //var di = dayToNum(day);
    if(di == this.end || di== this.begin) return true;
    if(this.end - this.begin > 0 && di > this.begin && di < this.end) {
        return true;
    }
    if(this.end - this.begin < 0 && (di > this.end || di < this.begin)) {
        return true;
    }
    return false;
}

function addTimeRange(tr) {
    this.times.push(tr);
}

function isOpenNow(dt) {
    d=dt.getDay();
    h=dt.getHours();
    m=dt.getMinutes();
    if(this.isDayInRange(d)) {
        var i;
        for(i=0;i<this.times.length;i++) {
            tr=this.times[i];
            if(tr.bh==h && tr.bm <= m) return true;
            if(tr.eh==h && tr.em >= m) return true;
            if(tr.bh < h && tr.eh > h) return true;
        }
    }
    return false;
}

function stringifyToTwoPlaces(n) {
	if(n<10) return "0"+n;
	else return n.toString();
}

function makeTime(h,m) {
	return stringifyToTwoPlaces(h)+":"+stringifyToTwoPlaces(m);
}

function nextClose(dt) {
    d=dt.getDay();
    h=dt.getHours();
    m=dt.getMinutes();
    if(this.isDayInRange(d)) {
        var i;
        for(i=0;i<this.times.length;i++) {
            tr=this.times[i];
            if((tr.bh==h && tr.bm <= m) ||
               (tr.eh==h && tr.em >= m) ||
               (tr.bh < h && tr.eh > h)) return makeTime(tr.eh,tr.em);
        }
    }
	return "Closed"; 	
}

function DateRange(stringrange) {
    this.times=new Array();

    if(typeof(_dr_prototype_called) == 'undefined') {
        _dr_prototype_called = true;
        DateRange.prototype.isDayInRange = isDayInRange;
        DateRange.prototype.dayToNum = dayToNum;
        DateRange.prototype.addTimeRange = addTimeRange;
        DateRange.prototype.isOpenNow = isOpenNow;
        DateRange.prototype.nextClose = nextClose;
    }
    if (stringrange.indexOf("-") == -1) {
        this.begin=dayToNum(stringrange.trim());
        this.end=this.begin;
    } else {
        this.begin=dayToNum(stringrange.split("-")[0].trim());
        this.end=dayToNum(stringrange.split("-")[1].trim());
    }
}

function isADayOrHyphen(str) {
    return isADay(str) || str == "-";
}

function isANumberOrColon(str) {
    return str.match(/[:0-9]+/)!=null;
}

function isANumberOrColonOrHyphen(str) {
    return str.match(/[-:0-9]+/) != null;
}

function isADay(str) {
    week=["sun","mon","tue","wed","thu","fri","sat"];
    return (week.indexOf(str.toLowerCase().substr(0,3)) > -1);
}

function isATimeRange(stringrange) {
    ca=stringrange.match(/([:0-9]+)-([:0-9]+)/);
    return (ca != null && ca.length==3);
}

function TimeRange(stringrange) {
    this.bm = 0;
    this.em = 0;

    ca=stringrange.match(/([:0-9]+)-([:0-9]+)/);
    this.bh = parseInt(ca[1].split(":")[0]*1);
    if(ca[1].split(":").length>1) this.bm = parseInt(ca[1].split(":")[1]*1);
    this.eh = parseInt(ca[2].split(":")[0]*1);
    if(ca[2].split(":").length>1) this.em = parseInt(ca[2].split(":")[1]*1);
}

function parseLine(ln) {
    if(ln==null) return null;
    a=ln.split(/[ ,]+/);
    drs=new Array();
    dr = "";
    tr = "";
    d = null;
    state = "d";
    while(b = a.shift()) {
        if(b=="" || b==null) continue;
        if(state=="d") {
            if(isADayOrHyphen(b)) {
                dr += b;
            } else {
                d=new DateRange(dr);
                dr="";
                drs.push(d);
                if(isANumberOrColon(b)) {
                    state="t";
                } else {
                    //console.log("Not a day, hyphen, number or colon: "+b);
                    return null;
                }
            }
        }
        if(state=="t") {
            if(isADay(b)) {
                state="d";
                a.unshift(b);
            } else {
                if(isANumberOrColonOrHyphen(b)) {
                    tr += b;
                    if(isATimeRange(tr)) {
                        t = new TimeRange(tr);
                        tr="";
                        d.addTimeRange(t);
                    }
                } else {
                    //console.log("Not a day, number or colon: "+b);
                    return null;
                }
            }
        }
    }
    return drs;
}

function checkOpeningHours(dt,str) {
    var z=parseLine(str);
    if(z) {
        var j=0;
        for(j=0;j<z.length;j++) {
            if(z[j].isOpenNow(dt)) return true;
        }
    }
}

function showClosedOrClosing(dt,str) {
	    var z=parseLine(str);
	if(z) {
        var j=0;
        for(j=0;j<z.length;j++) {
            if(z[j].isOpenNow(dt)) return "Open. Closes at " + z[j].nextClose(dt);
        }
		return "Closed";
	} else {
		return "Unknown";
	}
}

//node.js exports

exports.checkOpeningHours = checkOpeningHours;
exports.showClosedOrClosing = showClosedOrClosing;