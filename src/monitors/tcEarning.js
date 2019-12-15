const { Monitor } = require('klasa');
const timeout = new Set();

module.exports = class extends Monitor {

    constructor(...args) {
        super(...args, {
            name: 'tcEarning'
        });
        this.percent = 30;
        this.rateLimit = 10;
    }

    async run(msg) {
        if (timeout.has(`${msg.guild.id}-${msg.author.id}`)) return;

        if (Math.random() < (this.percent / 100)) {
            const amount = Math.floor(Math.random() * 9) + 1;
            msg.member.settings.update('wallet', msg.member.settings.wallet + amount);
            timeout.add(`${msg.guild.id}-${msg.author.id}`);
            setTimeout(() => timeout.delete(`${msg.guild.id}-${msg.author.id}`), this.rateLimit * 1000);
        }
    }
};