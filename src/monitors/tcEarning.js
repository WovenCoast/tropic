const { Monitor } = require('klasa');

module.exports = class extends Monitor {

    constructor(...args) {
        super(...args, {
            name: 'tcEarning'
        });
        this.percent = 30;
    }

    async run(msg) {
        if (Math.random() < (this.percent / 100)) {
            const amount = Math.floor(Math.random() * 9) + 1;
            console.log(`${msg.author.tag} just got ${this.client.economy.currency(amount)}!`);
            msg.member.settings.update('wallet', msg.member.settings.wallet + amount);
        }
    }
};