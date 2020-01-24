const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

const randomMessages = [
    "It's a plane! It's a boomer! No, its just **{tag}**",
    "Hello **{tag}**, nothing too fancy here",
    "Hmm, **{tag}** seems like he is too op, please nerf",
    "Anyone got anything good? Cuz **{guildname}** has, and its **{tag}**!"
];
const description = "In other words, welcome to **{guildname}**! Now we are **{membercount}** members.";
module.exports = class extends Event {

    constructor(...args) {
        super(...args, {
            enabled: true,
            event: 'guildMemberAdd',
            once: false
        });
    }

    run(member) {
        member.guild.channels.find(c => c.name == member.guild.settings.welcomeLeaveChannel).send(new MessageEmbed().setAuthor(member.user.tag, member.user.avatarURL()).setColor('GREEN').setTitle(randomMessages[Math.floor(Math.random() * randomMessages.length)].replace("{guildname}", member.guild.name).replace("{tag}", member.user.tag)).setDescription(description.replace("{guildname}", member.guild.name).replace("{tag}", member.user.tag).replace("{membercount}", member.guild.memberCount)));
    }

};