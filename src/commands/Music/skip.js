const { Command } = require('klasa');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: [],
            description: language => language.get('COMMAND_SKIP_DESCRIPTION'),
            usage: '[amount:number]'
        });
        this.normalUserLimit = 5;
    }

    async run(msg, [amount]) {
        let serverQueue = this.client.queue.get(msg.guild.id);
        if (!serverQueue) return msg.sendLocale('NO_QUEUE');
        if (!amount) amount = 1;
        if (amount > serverQueue.songs.length) amount = amount % serverQueue.songs.length;
        if (!msg.guild.settings.isPremium && amount > this.normalUserLimit) return msg.channel.send(`:x: This guild needs Tropic Premium to skip more than ${this.normalUserLimit} songs!`)
        if (serverQueue.voiceChannel.members.size > 2 && msg.member.permissions.has(this.client.djPerms)) {
            const message = await msg.channel.send(`Can I make sure that the majority of you want to skip ${amount} song${amount === 1 ? '' : 's'}?`);
            await message.react(this.client.yesEmoji);
            const goAhead = await message.promptReact((reaction, user) => reaction.emoji.name === this.client.yesEmoji && serverQueue.voiceChannel.members.map(m => m.user.id).includes(user.id), { minReactUsers: Math.floor(serverQueue.voiceChannel.members.size / 2) });
            if (!goAhead) return msg.channel.send(`:x: Majority didn't really want to skip ${amount} song${amount === 1 ? '' : 's'}`);
        }
        for (let i = 0; i < amount; i++) {
            await this.skip(msg, serverQueue);
        }
    }

    async skip(msg, serverQueue) {
        let skippedSong;
        if (serverQueue.playing === false) serverQueue.playing = true;
        if (serverQueue.loop === "loopone") {
            serverQueue.loop = "loopall";
            skippedSong = serverQueue.songs[i];
            serverQueue.player.stop();
            serverQueue.loop = "loopone";
        } else {
            skippedSong = serverQueue.songs[i];
            serverQueue.player.stop();
        }
        return msg.channel.send(`:white_check_mark: Skipped the song **${skippedSong.info.title}** requested by *${skippedSong.requestedBy.tag}*`);
    }
};