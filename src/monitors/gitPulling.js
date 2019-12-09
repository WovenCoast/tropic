const { Monitor, util: { exec } } = require('klasa');

module.exports = class extends Monitor {

    constructor(...args) {
        super(...args, {
            name: 'gitPulling'
        });
    }

    async run(msg) {
        if (msg.channel.id !== '618363293278404629' && msg.guild.id !== '616614413348110336') return;
        await exec(`git pull`, { timeout: 'timeout' in msg.flags ? Number(msg.flags.timeout) : 60000 })
            .catch(error => ({ stdout: null, stderr: error }));
    }
};