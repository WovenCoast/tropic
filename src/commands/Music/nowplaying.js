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
        return msg.channel.send(`:arrow_forward: Now playing: **${this.parse(serverQueue.player.state.position)} / ${this.parse(serverQueue.songs[0].info.length)}** of **${serverQueue.songs[0].info.title}** by *${serverQueue.songs[0].info.author}*`);
    }

    parse(length) {
        const milliseconds = parseInt(length / 1000);
        const seconds = parseInt(milliseconds % 60);
        const minutes = parseInt((milliseconds / 60) % 60);
        const hours = parseInt((milliseconds / 60) / 60);
        return `${hours ? hours + ':' : ''}${minutes + ':' + (seconds < 10 ? '0' + seconds : seconds)}`;
    }
};