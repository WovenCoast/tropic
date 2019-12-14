const { Command } = require('klasa');
const loopStates = ['one', 'all', 'off'];

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: [],
            description: language => language.get('COMMAND_LOOP_DESCRIPTION'),
            usage: '[looptype:string]'
        });
    }

    async run(msg, [looptype]) {
        const loopType = looptype;
        let serverQueue = this.client.queue.get(msg.guild.id);
        if (!serverQueue) return msg.sendLocale('NO_QUEUE');
        if (loopStates.includes(loopType)) {
            serverQueue.loop = loopType;
            return msg.channel.send(`:arrows_counterclockwise: Loop has been set to *${serverQueue.loop}*, type in the command again to go to another loop state!`);
        } else {
            serverQueue.loop = loopStates[(loopStates.indexOf(serverQueue.loop) + 1 !== loopStates.length ? loopStates.indexOf(serverQueue.loop) + 1 : 0)];
            return msg.channel.send(`:arrows_counterclockwise: Loop has been set to *${serverQueue.loop}*, type in the command again to go to another loop state!`);
        }
    }
};