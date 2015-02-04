var request = require('request');

var base = 'https://bank.simple.com';

function Goal(account, data) {
    Object.defineProperty(this, 'account', { enumerable: false, value: account });
    this.amount = data.amount;
    this.archived = data.archived;
    this.color = data.color;
    this.contributed_amount = data.contributed_amount;
    this.created = new Date(data.created);
    this.entry_ids = data.entry_ids;
    this.finish = new Date(data.finish);
    this.id = data.id;
    this.locked = data.locked;
    this.modified = new Date(data.modified);
    this.name = data.name;
    this.paused = data.paused;
    this.recurring_goal_id = data.recurring_goal_id;
    this.references = data.references;
    this.seq = data.seq;
    this.start = new Date(data.start);
    this.target_amount = data.target_amount;
    this.user_id = data.user_id;
}

Goal.prototype.transfer = function (amount, cb) {
    var ropt = {
        url: base + '/goals/' + this.id + '/transactions',
        jar: this.account.jar,
        formData: {
            _csrf: this.account.csrf,
            amount: amount * 10000
        }
    };
        
    request.post(ropt, function (err, res, body) {
        if (err) return cb(err);
        if (res.statusCode === 302) return cb(new Error('Not logged in'));
        if (res.statusCode !== 200) return cb(new Error('Unknown error ' + res.statusCode));
        cb(err, body);
    });
};

Goal.prototype.toString = function () {
    return this.name;
}

module.exports = Goal;