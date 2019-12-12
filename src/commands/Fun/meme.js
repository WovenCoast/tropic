const {
    MessageEmbed
} = require('discord.js');
const {
    Command
} = require('klasa');
const meme = require('memejs');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            description: 'Shows a meme image from reddit.',
            cooldown: 5
        });
    }

    async run(msg) {
        meme((data) => {
            if (!data.subreddit) return this.run(msg);
            const embed = new MessageEmbed()
                .setTitle(data.title[0])
                .setColor(this.client.primaryColor)
                .setImage(data.url[0])
                .setFooter(`${data.author[0]} in r/${data.subreddit[0]}`)
                .setTimestamp()
            msg.channel.send(embed);
        });
    }

};