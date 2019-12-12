const { Argument } = require('klasa');

module.exports = class extends Argument {

    constructor(...args) {
        super(...args, { aliases: ['amt'] });
    }

    run(arg, possible, message) {
        if (arg === "all") return "all";
        const number = parseInt(arg);
        if (!Number.isInteger(number)) throw message.language.get('RESOLVER_INVALID_AMT', possible.name);
        return number;
    }

};
