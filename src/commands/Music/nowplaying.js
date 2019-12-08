const { Command } = require('klasa');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['np'],
            description: language => language.get('COMMAND_NOWPLAYING_DESCRIPTION'),
            usage: ''
        });
    }

    async run(msg) {
        let serverQueue = this.client.queue.get(msg.guild.id);
        if (!serverQueue) return msg.sendLocale('NO_QUEUE');
        if (serverQueue.playing === false) return msg.channel.send(":x: Not playing anything because the queue is paused")
        return msg.channel.send(`:arrow_forward: Now playing: **${serverQueue.songs[0].info.title}** by **${serverQueue.songs[0].info.author}**`);
    }
};