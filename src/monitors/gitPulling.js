const { Monitor, util: { exec } } = require('klasa');

module.exports = class extends Monitor {

    constructor(...args) {
        super(...args, {
            name: 'gitPulling'
        });
    }

    async run(msg) {
        if (msg.channel.id !== '653558671749677056' && msg.guild.id !== '630072317904683018') return;
        await exec(`git pull`, { timeout: 'timeout' in msg.flags ? Number(msg.flags.timeout) : 60000 })
            .catch(error => ({ stdout: null, stderr: error }));
    }
};