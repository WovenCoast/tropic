const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['bal'],
            description: 'Checks the balance available on the user',
            usage: ''
        });
    }

    async run(msg) {
        const embed = new MessageEmbed()
            .setColor(this.client.primaryColor)
            .setAuthor(`Balance of ${msg.author.tag}`, msg.author.avatarURL())
            .addField(':classical_building: Bank', this.client.currency(msg.author.settings.bank))
            .addField(':moneybag: Wallet', this.client.currency(msg.member.settings.wallet))
        msg.channel.send(embed);
    }
};