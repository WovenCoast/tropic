const { Command } = require('klasa');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['unpause'],
            description: language => language.get('COMMAND_RESUME_DESCRIPTION'),
            usage: ''
        });
    }

    async run(msg) {
        let serverQueue = this.client.queue.get(msg.guild.id);
        if (!serverQueue) return msg.sendLocale('NO_QUEUE');
        if (serverQueue.playing === true) return msg.channel.send(":x: Queue is being played");
        const player = this.client.player.get(msg.guild.id);
        if (!player) return msg.channel.send(":x: No Lavalink player found");
        player.pause(false);
        serverQueue.playing = true;
        return msg.channel.send(":white_check_mark: Resumed the music");
    }
};