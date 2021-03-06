var request = require('request');
var Goal = require('./Goal.js');

var base = 'https://bank.simple.com';
var csrfRegex = /<meta name="_csrf" content="(.*)">/;

function Account(opt) {
    this.username = opt.username;
    this.password = opt.password;
    this.csrf;
    this.jar = request.jar();
}

Account.prototype.getCSRF = function (cb) {
    var ropt = {
        url: base,
        jar: this.jar
    };
    var self_ = this;
    
    request(ropt, function (err, res, body) {
        if (err) return cb(err);
        self_.csrf = csrfRegex.exec(body)[1];
        cb(null, self_.csrf);
    });
};

Account.prototype.login = function (cb) {
    var ropt = {
        method: 'POST',
        url: base + '/signin',
        jar: this.jar,
        form: {
            username: this.username,
            password: this.password
        }
    };
    
    this.getCSRF(function (err, token) {
        if (err) return cb(err);
        ropt.form._csrf = token;
        request(ropt, function (err, res, body) {
            if (err) return cb(err);
            if (res.statusCode !== 303) return cb(new Error('Login failed: ' + res.statusCode));
            cb();
        });
    });
};

Account.prototype.logout = function (cb) {
    var ropt = {
        url: base + '/signout',
        jar: this.jar
    };
    
    request(ropt, function (err, res, body) {
        if (err) return cb(err);
        if (res.statusCode !== 302) return cb(new Error('Logout failed: ' + res.statusCode));
        cb();
    });
};

Account.prototype.card = function (cb) {
    var ropt = {
        url: base + '/card',
        jar: this.jar,
        json: true
    };
    
    request(ropt, function (err, res, body) {
        if (err) return cb(err);
        if (res.statusCode === 302) return cb(new Error('Not logged in'));
        if (res.statusCode !== 200) return cb(new Error('Unknown error ' + res.statusCode));
        cb(null, body);
    });
};

Account.prototype.balance = function (cb) {
    var ropt = {
        url: base + '/account/balances',
        jar: this.jar,
        json: true
    };
    
    request(ropt, function (err, res, body) {
        if (err) return cb(err);
        if (res.statusCode === 302) return cb(new Error('Not logged in'));
        if (res.statusCode !== 200) return cb(new Error('Unknown error ' + res.statusCode));
        
        body.total /= 10000;
        body.safe_to_spend /= 10000;
        cb(null, body);
    });
};

Account.prototype.external = function (cb) {
    var ropt = {
        url: base + '/linked-accounts',
        jar: this.jar,
        json: true
    };
    
    request(ropt, function (err, res, body) {
        if (err) return cb(err);
        if (res.statusCode === 302) return cb(new Error('Not logged in'));
        if (res.statusCode !== 200) return cb(new Error('Unknown error ' + res.statusCode));
        
        cb(null, body.accounts);
    });
};

Account.prototype.goals = function (cb) {
    var ropt = {
        url: base + '/goals/data',
        jar: this.jar,
        json: true
    };
    var self_ = this;
    
    request(ropt, function (err, res, body) {
        if (err) return cb(err);
        if (res.statusCode === 302) return cb(new Error('Not logged in'));
        if (res.statusCode !== 200) return cb(new Error('Unknown error ' + res.statusCode));
        
        // convert to goal instance
        for (var i = 0; i < body.length; i++) body[i] = new Goal(self_, body[i]);
        
        // return goals
        cb(null, body);
    });
};

Account.prototype.transactions = function (cb) {
    var ropt = {
        url: base + '/transactions/data',
        jar: this.jar,
        json: true
    };
    
    request(ropt, function (err, res, body) {
        if (err) return cb(err);
        if (res.statusCode === 302) return cb(new Error('Not logged in'));
        if (res.statusCode !== 200) return cb(new Error('Unknown error ' + res.statusCode));
        
        cb(null, body);
    });
};

module.exports = Account;
