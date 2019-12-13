const { Command } = require('klasa');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            description: 'Transfers an amount of money from your wallet to your bank account',
            usage: '<amount:amt>'
        });
    }

    async run(msg, [amount]) {
        if (amount === "all") amount = msg.member.settings.wallet;
        if (amount > msg.member.settings.wallet) return msg.channel.send(':octagonal_sign: You cannot deposit more than what you have!');
        if (amount === 0) return msg.channel.send(':octagonal_sign: You cannot deposit nothing into your bank! Money doesn\'t come from trees')
        await msg.author.settings.update('bank', msg.author.settings.bank + amount);
        await msg.member.settings.update('wallet', msg.member.settings.wallet - amount);
        msg.channel.send(`:white_check_mark: Successfully deposited ${this.client.currency(amount)} to your bank account!`);
    }
};