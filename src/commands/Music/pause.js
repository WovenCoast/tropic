const { Command } = require('klasa');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: [],
            description: language => language.get('COMMAND_PAUSE_DESCRIPTION'),
            usage: ''
        });
    }

    async run(msg) {
        let serverQueue = this.client.queue.get(msg.guild.id);
        if (!serverQueue) return msg.sendLocale('NO_QUEUE');
        if (serverQueue.playing === false) return msg.channel.send(":x: Queue already paused");
        const player = this.client.player.get(msg.guild.id);
        if (!player) return msg.channel.send(":x: No Lavalink player found");
        player.pause(true);
        serverQueue.playing = false;
        return msg.channel.send(":white_check_mark: Paused the music, use the command `unpause` to unpause the song!");
    }
};