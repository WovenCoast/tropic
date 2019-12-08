const { Command } = require('klasa');
const utils = require('../../utils.js');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: [],
            description: language => language.get('COMMAND_VOLUME_DESCRIPTION'),
            usage: '[volume:number]'
        });

        this.normalUserLimit = 200;
    }

    async run(msg, [volume]) {
        let serverQueue = this.client.queue.get(msg.guild.id);
        if (!serverQueue) return msg.sendLocale('NO_QUEUE');
        if (!volume) {
            return msg.channel.send(`:loudspeaker: The current volume is **${serverQueue.volume}%**.`);
        } else {
            if (serverQueue.volume == volume) return msg.channel.send(`:shrug: The volume is already at **${serverQueue.volume}%**...`)
            if (!utils.guildIsPremium(this.client, msg.guild.id) && volume > this.normalUserLimit) return msg.channel.send(`:x: This guild needs Flamey Premium to set the volume higher than ${this.normalUserLimit}%!`)
            serverQueue.volume = volume;
            serverQueue.player.volume(serverQueue.volume);
            return msg.channel.send(`:white_check_mark: Successfully set the volume to **${volume}%**.`);
        };
    }
};