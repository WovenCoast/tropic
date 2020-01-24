const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

const randomMessages = [
    "Good bye **{tag}**, goodbye to you, goodbye, good bye, goo dbye",
    "I'll miss you **{tag}**",
    "Did anyone roast **{tag}** just now? Cuz if you did **{tag}** is pretty mad about it",
    "Didn't like **{guildname}**? At least give us some feedback!"
];
const description = "In other words, good bye **{guildname}**! Now we are **{membercount}** members :(";
module.exports = class extends Event {

    constructor(...args) {
        super(...args, {
            enabled: true,
            event: 'guildMemberRemove',
            once: false
        });
    }

    run(member) {
        member.guild.channels.find(c => c.name == member.guild.settings.welcomeLeaveChannel).send(new MessageEmbed().setAuthor(member.user.tag, member.user.avatarURL()).setColor('RED').setTitle(randomMessages[Math.floor(Math.random() * randomMessages.length)].replace("{guildname}", member.guild.name).replace("{tag}", member.user.tag)).setDescription(description.replace("{guildname}", member.guild.name).replace("{tag}", member.user.tag).replace("{membercount}", member.guild.memberCount)));
    }

};