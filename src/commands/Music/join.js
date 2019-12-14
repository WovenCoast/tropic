const { Command } = require('klasa');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: [],
            description: language => language.get('COMMAND_JOIN_DESCRIPTION'),
            usage: ''
        });
    }

    async run(msg) {
        if (!msg.member || !msg.member.voice.channel) return msg.reply(":x: You must be in a voice channel for this command.");

        let serverQueue = this.client.queue.get(msg.guild.id);
        if (!(serverQueue && serverQueue.voiceChannel === msg.member.voice.channel)) {
            const queueConstruct = {
                textChannel: msg.channel,
                voiceChannel: msg.member.voice.channel,
                player: null,
                songs: [],
                volume: 100,
                playing: true,
                loop: "off"
            };
            this.client.queue.set(msg.guild.id, queueConstruct);

            try {
                queueConstruct.player = await this.client.player.join({
                    guild: msg.guild.id,
                    channel: msg.member.voice.channel.id,
                    host: this.client.player.nodes.first().host
                }, { selfdeaf: true });
            } catch (error) {
                this.client.console.error(`I could not join the voice channel: ${error}`);
                this.client.queue.delete(msg.guild.id);
                this.client.player.leave(msg.guild.id);
                return msg.channel.send(`:x: I could not join the voice channel: ${error.message}`);
            };
        } else {
            return msg.channel.send(`:octagonal_sign: I am already in the voice channel that you are in!`);
        };
    }
};
