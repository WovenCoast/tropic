const { Command } = require('klasa');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: [],
            description: language => language.get('COMMAND_VOLUME_DESCRIPTION'),
            usage: '[volume:number]'
        });

        this.normalUserLimit = 200;
    }

    async run(msg, [volume]) {
        let serverQueue = this.client.queue.get(msg.guild.id);
        if (!serverQueue) return msg.sendLocale('NO_QUEUE');
        if (!volume) {
            return msg.channel.send(`:loudspeaker: The current volume is **${serverQueue.volume}%**.`);
        } else {
            if (serverQueue.volume == volume) return msg.channel.send(`:shrug: The volume is already at **${serverQueue.volume}%**...`)
            if (!msg.guild.settings.isPremium && volume > this.normalUserLimit) return msg.channel.send(`:x: This guild needs Tropic Premium to set the volume higher than ${this.normalUserLimit}%!`)
            if (serverQueue.voiceChannel.members.size > 1 && msg.member.permissions.has(this.client.djPerms)) {
                const message = await msg.channel.send(`Can I make sure that the majority of you want to set the volume from ${serverQueue.volume} to ${volume}?`);
                await message.react(this.client.yesEmoji);
                const goAhead = await message.promptReact((reaction, user) => reaction.emoji.name === this.client.yesEmoji && serverQueue.voiceChannel.members.map(m => m.user.id).includes(user.id), { minReactUsers: Math.floor(serverQueue.voiceChannel.members.size / 2) });
                if (!goAhead) return msg.channel.send(`:x: Majority didn't really want to change the volume`);
            }
            serverQueue.volume = volume;
            serverQueue.player.volume(serverQueue.volume);
            return msg.channel.send(`:white_check_mark: Successfully set the volume to **${volume}%**.`);
        };
    }
};