/*
This is a Date parsing library by Nicholas Barthelemy.
Old, Inactive Homepage: https://svn.nbarthelemy.com/date-js/. I can't find it anywhere else, this is an unpacked version from Jester 1.3 
*/

Number.prototype.zf || (Number.prototype.zf = function(a) {
    return this.toString().zf(a);
});
String.prototype.zf || (String.prototype.zf = function(a) {
    return '0'.str(a - this.length) + this;
});
String.prototype.str || (String.prototype.str = function(a) {
    var s = '',
    i = 0;
    while (i++<a) {
        s += this;
    }
    return s;
});
Number.prototype.rz || (Number.prototype.rz = function() {
    return this.toString().rz();
});
String.prototype.rz || (String.prototype.rz = function() {
    var n = this,
    l = n.length,
    i = -1;
    while (i++<l) {
        this.substring(i, i + 1) == 0 ? n = n.substring(1, n.length) : i = l
    }
    return n;
});
Date.MONTH_NAMES = "January February March April May June July August September October November December".split(" ");
Date.DAY_NAMES = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" ");
Date.DAYS_PER_MONTH = "31 28 31 30 31 30 31 31 30 31 30 31".split(" ");
Date.FORMATS = {
    db: "%Y-%m-%d %H:%M:%S",
    iso8601: "%Y-%m-%dT%H:%M:%S%T",
    rfc822: "%a, %d %b %Y %H:%M:%S %Z",
    short: "%d %b %H:%M",
    long: "%B %d, %Y %H:%M"
};
Date.EPOCH = -1;
Date.ERA = -2; (function() {
    var d = Date;
    d["MILLISECOND"] = 1;
    d["SECOND"] = 1000;
    d["MINUTE"] = d["SECOND"] * 60;
    d["HOUR"] = d["MINUTE"] * 60;
    d["DAY"] = d["HOUR"] * 24;
    d["WEEK"] = d["DAY"] * 7;
    d["MONTH"] = d["DAY"] * 31;
    d["YEAR"] = d["DAY"] * 365;
    d["DECADE"] = d["YEAR"] * 10;
    d["CENTURY"] = d["YEAR"] * 100;
    d["MILLENNIUM"] = d["YEAR"] * 1000
})();
Date.prototype.clone || (Date.prototype.clone = function() {
    return new Date(this.getTime());
});
Date.prototype.increment || (Date.prototype.increment = function(a, b) {
    this.setTime(this.getTime() + ((a || Date.DAY) * (b || 1)));
    return this;
});
Date.prototype.decrement || (Date.prototype.decrement = function(a, b) {
    this.setTime(this.getTime() - ((a || Date.DAY) * (b || 1)));
    return this;
});
Date.prototype.clearTime || (Date.prototype.clearTime = function() {
    this.setHours(0);
    this.setMinutes(0);
    this.setSeconds(0);
    this.setMilliseconds(0);
    return this
});
Date.prototype.diff || (Date.prototype.diff = function(a, b) {
    if (typeof a == 'string') a = Date.parse(a);
    return Math.floor((this.getTime() - a.getTime()) / (b | Date.DAY))
});
Date.prototype.compare || (Date.prototype.compare = Date.prototype.diff);
Date.prototype.getOrdinal || (Date.prototype.getOrdinal = function() {
    d = String(this);
    return d.substr( - (Math.min(d.length, 2))) > 3 && d.substr( - (Math.min(d.length, 2))) < 21 ? "th": ["th", "st", "nd", "rd", "th"][Math.min(Number(d) % 10, 4)]
});
Date.prototype.getWeek || (Date.prototype.getWeek = function() {
    var f = (new Date(this.getFullYear(), 0, 1)).getDay();
    return Math.round((this.getDayOfYear() + (f > 3 ? f - 4: f + 3)) / 7)
});
Date.prototype.getTimezone = function() {
    return this.toString().replace(/^.*? ([A-Z]{3}) [0-9]{4}.*$/, "$1").replace(/^.*?\(([A-Z])[a-z]+ ([A-Z])[a-z]+ ([A-Z])[a-z]+\)$/, "$1$2$3")
};
Date.prototype.getGMTOffset = function() {
    return (this.getTimezoneOffset() > 0 ? "-": "+") + String(Math.floor(this.getTimezoneOffset() / 60)).zf(2) + String(this.getTimezoneOffset() % 60, 2, "0").zf(2)
};
Date.prototype.getDayOfYear || (Date.prototype.getDayOfYear = function() {
    return ((Date.UTC(this.getFullYear(), this.getMonth(), this.getDate() + 1, 0, 0, 0) - Date.UTC(this.getFullYear(), 0, 1, 0, 0, 0)) / Date.DAY)
});
Date.prototype.lastDayOfMonth || (Date.prototype.lastDayOfMonth = function() {
    var a = this.clone();
    a.setMonth(a.getMonth() + 1);
    a.setDate(0);
    return a.getDate()
});
Date.daysInMonth || (Date.daysInMonth = function(a, b) {
    a = (a + 12) % 12;
    if (Date.isLeapYear(b) && a == 1) return 29;
    return Date.Convensions.DAYS_IN_MONTH[a]
});
Date.isLeapYear || (Date.isLeapYear = function(a) {
    return (((a % 4) == 0) && ((a % 100) != 0) || ((a % 400) == 0))
});
Date.prototype.strftime || (Date.prototype.strftime = function(c) {
    if (!this.valueOf()) return '&nbsp;';
    var d = this;
    if (Date.FORMATS[c.toLowerCase()]) c = Date.FORMATS[c.toLowerCase()];
    return c.replace(/\%([aAbBcdHIjmMpSUWwxXyYTZ])/g,
    function(a, b) {
        switch (b) {
        case 'a':
            return Date.parseDay(d.getDay()).substr(0, 3);
        case 'A':
            return Date.parseDay(d.getDay());
        case 'b':
            return Date.parseMonth(d.getMonth()).substr(0, 3);
        case 'B':
            return Date.parseMonth(d.getMonth());
        case 'c':
            return d.toString();
        case 'd':
            return d.getDate().zf(2);
        case 'H':
            return d.getHours().zf(2);
        case 'I':
            return ((h = d.getHours() % 12) ? h: 12).zf(2);
        case 'j':
            return d.getDayOfYear().zf(3);
        case 'm':
            return (d.getMonth() + 1).zf(2);
        case 'M':
            return d.getMinutes().zf(2);
        case 'p':
            return d.getHours() < 12 ? 'AM': 'PM';
        case 'S':
            return d.getSeconds().zf(2);
        case 'U':
            return d.getWeek().zf(2);
        case 'W':
            throw Error("%W is not supported yet");
        case 'w':
            return d.getDay();
        case 'x':
            return d.format("%m/%d/%Y");
        case 'X':
            return d.format("%I:%M%p");
        case 'y':
            return d.getFullYear().toString().substr(2);
        case 'Y':
            return d.getFullYear();
        case 'T':
            return d.getGMTOffset();
        case 'Z':
            return d.getTimezone();
        }
    })
});
Date.prototype.format || (Date.prototype.format = Date.prototype.strftime);
Date.__native_parse = Date.parse;
Date.parse = function(a) {
    if (typeof a != 'string') return a;
    if (a.length == 0 || (/^\s+$/).test(a)) return;
    for (var i = 0; i < Date.__PARSE_PATTERNS.length; i++) {
        var r = Date.__PARSE_PATTERNS[i].re.exec(a);
        if (r) return Date.__PARSE_PATTERNS[i].handler(r);
    }
    return new Date(Date.__native_parse(a));
};
Date.parseMonth || (Date.parseMonth = function(c) {
    var d = -1;
    if (typeof c == 'object') {
        return Date.MONTH_NAMES[c.getMonth()];
    } else if (typeof c == 'number') {
        d = c - 1;
        if (d < 0 || d > 11) throw new Error("Invalid month index value must be between 1 and 12:" + d);
        return Date.MONTH_NAMES[d];
    }
    var m = Date.MONTH_NAMES.findAll(function(a, b) {
        if (new RegExp("^" + c, "i").test(a)) {
            d = b;
            return true
        }
        return false
    });
    if (m.length == 0) throw new Error("Invalid month string");
    if (m.length > 1) throw new Error("Ambiguous month");
    return Date.MONTH_NAMES[d]
});
Date.parseDay || (Date.parseDay = function(c) {
    var d = -1;
    if (typeof c == 'number') {
        d = c - 1;
        if (d < 0 || d > 6) throw new Error("Invalid day index value must be between 1 and 7");
        return Date.DAY_NAMES[d]
    }
    var m = Date.DAY_NAMES.findAll(function(a, b) {
        if (new RegExp("^" + c, "i").test(a)) {
            d = b;
            return true
        }
        return false
    });
    if (m.length == 0) throw new Error("Invalid day string");
    if (m.length > 1) throw new Error("Ambiguous day");
    return Date.DAY_NAMES[d]
});
Date.__PARSE_PATTERNS || (Date.__PARSE_PATTERNS = [{
    re: /(\d{1,2})\/(\d{1,2})\/(\d{2,4})/,
    handler: function(a) {
        var d = new Date();
        d.setYear(a[3]);
        d.setDate(parseInt(a[2], 10));
        d.setMonth(parseInt(a[1], 10) - 1);
        return d
    }
},
{
    re: /(\d{4})(?:-?(\d{2})(?:-?(\d{2})(?:[T ](\d{2})(?::?(\d{2})(?::?(\d{2})(?:\.(\d+))?)?)?(?:Z|(?:([-+])(\d{2})(?::?(\d{2}))?)?)?)?)?)?/,
    handler: function(a) {
        var b = 0;
        var d = new Date(a[1], 0, 1);
        if (a[2]) d.setMonth(a[2] - 1);
        if (a[3]) d.setDate(a[3]);
        if (a[4]) d.setHours(a[4]);
        if (a[5]) d.setMinutes(a[5]);
        if (a[6]) d.setSeconds(a[6]);
        if (a[7]) d.setMilliseconds(Number("0." + a[7]) * 1000);
        if (a[9]) {
            b = (Number(a[9]) * 60) + Number(a[10]);
            b *= ((a[8] == '-') ? 1: -1)
        }
        b -= d.getTimezoneOffset();
        time = (Number(d) + (b * 60 * 1000));
        d.setTime(Number(time));
        return d
    }
},
{
    re: /^tod/i,
    handler: function() {
        return new Date()
    }
},
{
    re: /^tom/i,
    handler: function() {
        var d = new Date();
        d.setDate(d.getDate() + 1);
        return d
    }
},
{
    re: /^yes/i,
    handler: function() {
        var d = new Date();
        d.setDate(d.getDate() - 1);
        return d
    }
},
{
    re: /^(\d{1,2})(st|nd|rd|th)?$/i,
    handler: function(a) {
        var d = new Date();
        d.setDate(parseInt(a[1], 10));
        return d
    }
},
{
    re: /^(\d{1,2})(?:st|nd|rd|th)? (\w+)$/i,
    handler: function(a) {
        var d = new Date();
        d.setDate(parseInt(a[1], 10));
        d.setMonth(Date.parseMonth(a[2]));
        return d
    }
},
{
    re: /^(\d{1,2})(?:st|nd|rd|th)? (\w+),? (\d{4})$/i,
    handler: function(a) {
        var d = new Date();
        d.setDate(parseInt(a[1], 10));
        d.setMonth(Date.parseMonth(a[2]));
        d.setYear(a[3]);
        return d
    }
},
{
    re: /^(\w+) (\d{1,2})(?:st|nd|rd|th)?$/i,
    handler: function(a) {
        var d = new Date();
        d.setDate(parseInt(a[2], 10));
        d.setMonth(Date.parseMonth(a[1]));
        return d
    }
},
{
    re: /^(\w+) (\d{1,2})(?:st|nd|rd|th)?,? (\d{4})$/i,
    handler: function(a) {
        var d = new Date();
        d.setDate(parseInt(a[2], 10));
        d.setMonth(Date.parseMonth(a[1]));
        d.setYear(a[3]);
        return d
    }
},
{
    re: /^next (\w+)$/i,
    handler: function(a) {
        var d = new Date();
        var b = d.getDay();
        var c = Date.parseDay(a[1]);
        var e = c - b;
        if (c <= b) {
            e += 7
        }
        d.setDate(d.getDate() + e);
        return d
    }
},
{
    re: /^last (\w+)$/i,
    handler: function(a) {
        throw new Error("Not yet implemented");
    }
}]);