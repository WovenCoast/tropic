const { Command } = require('klasa');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            description: 'Transfers an amount of money from your bank account to your wallet',
            usage: '<amount:amt>'
        });
    }

    async run(msg, [amount]) {
        if (amount === "all") amount = msg.author.settings.bank;
        if (amount > msg.author.settings.bank) return msg.channel.send(':octagonal_sign: You cannot withdraw more than what you have!');
        if (amount === 0) return msg.channel.send(':octagonal_sign: You cannot withdraw nothing into your wallet! Money doesn\'t come from trees')
        await msg.author.settings.update('bank', msg.author.settings.bank - amount);
        await msg.member.settings.update('wallet', msg.member.settings.wallet + amount);
        msg.channel.send(`:white_check_mark: Successfully withdrawn ${this.client.economy.currency(amount)} from your bank account!`);
    }
};