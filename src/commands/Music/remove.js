const { Command } = require('klasa');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['rm'],
            description: language => language.get('COMMAND_REMOVE_DESCRIPTION'),
            usage: '<index:number>'
        });
    }

    async run(msg, [index]) {
        let serverQueue = this.client.queue.get(msg.guild.id);
        if (!serverQueue) return msg.channel.send("This server doesn't have a queue");
        const [removed] = serverQueue.songs.splice(index, 1);
        msg.channel.send(`:white_check_mark: Removed **${removed.info.title}** which was requested by *${removed.requestedBy.tag}*`)
    }
};