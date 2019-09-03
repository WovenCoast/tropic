const { Monitor, util: { exec } } = require('klasa');

module.exports = class extends Monitor {

    constructor(...args) {
        super(...args, {
            name: 'gitPulling'
        });
    }

    async run(msg) {
        if (msg.channel.id !== process.env.GIT_COMMITS_CHANNEL && msg.guild.id !== process.env.GIT_COMMITS_GUILD) return;
        await exec(`git pull`, { timeout: 'timeout' in msg.flags ? Number(msg.flags.timeout) : 60000 })
            .catch(error => ({ stdout: null, stderr: error }));
    }
};