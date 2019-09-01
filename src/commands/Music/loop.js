const { Command } = require('klasa');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: [],
            description: language => language.get('COMMAND_LOOP_DESCRIPTION'),
            usage: ''
        });
    }

    async run(msg) {
        let serverQueue = this.client.queue.get(msg.guild.id);
        if (!serverQueue) return msg.channel.send("This server doesn't have a queue");
        serverQueue.loop = !serverQueue.loop;
        return msg.channel.send(`:arrows_counterclockwise: Loop has been ${serverQueue.loop ? "enabled" : "disabled"}`);
    }
};