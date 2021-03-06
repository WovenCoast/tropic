const { Command } = require('klasa');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['fuckoff', 'stop'],
            description: language => language.get('COMMAND_LEAVE_DESCRIPTION'),
            usage: ''
        });
    }

    async run(msg) {
        let serverQueue = this.client.queue.get(msg.guild.id);
        if (!serverQueue) return msg.sendLocale('NO_QUEUE');
        await this.client.player.leave(msg.guild.id);
        this.client.queue.delete(msg.guild.id);
        return msg.channel.send(":white_check_mark: Successfully left the voice channel");
    }
};