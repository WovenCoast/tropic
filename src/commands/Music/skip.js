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
        if (!serverQueue) return msg.sendLocale('NO_QUEUE');
        if (!amount) amount = 1;
        const currentSong = serverQueue.songs[0];
        if (serverQueue.playing === false) serverQueue.playing = true;
        if (amount > 0) {
            if (serverQueue.loop === "loopone") {
                serverQueue.loop = "loopall";
                serverQueue.player.stop();
                serverQueue.loop = "loopone";
            } else {
                serverQueue.player.stop();
            }
            return msg.channel.send(`:white_check_mark: Skipped the song **${currentSong.info.title}** requested by *${currentSong.requestedBy.tag}*`);
        } else {
            return msg.channel.send(`:octagonal_sign: You can't skip ${amount} songs!`);
        }
    }
};