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
        if (!serverQueue) return msg.channel.send("This server doesn't have a queue");
        if (serverQueue.playing === false) return msg.channel.send("Queue already paused");
        const player = client.player.get(msg.guild.id);
        if (!player) return msg.channel.send("No Lavalink player found");
        player.pause(true);
        serverQueue.playing = false;
        return msg.channel.send("Paused the music");
    }
};