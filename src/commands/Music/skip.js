const { Command } = require('klasa');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: [],
            description: language => language.get('COMMAND_SKIP_DESCRIPTION'),
            usage: '[amount:number]'
        });
    }

    async run(msg, [amount]) {
        let serverQueue = this.client.queue.get(msg.guild.id);
        if (!serverQueue) return msg.channel.send(":x: This server doesn't have a queue");
        if (serverQueue.playing === false) serverQueue.playing = true;
        if (amount > 1) {
            serverQueue.loop ? serverQueue.songs.splice(0, amount - 1).forEach(e => serverQueue.songs.push(e)) : null;
        }
        serverQueue.player.stop();
        return msg.channel.send(`:white_check_mark: Skipped!`);
    }
};