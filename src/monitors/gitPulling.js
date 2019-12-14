const { Monitor, util: { exec } } = require('klasa');

module.exports = class extends Monitor {

    constructor(...args) {
        super(...args, {
            name: 'gitPulling'
        });
    }

    async run(msg) {
        if (`${msg.guild.id}-${msg.channel.id}` === '630072317904683018-653558671749677056') {
            await exec(`git pull`, { timeout: 60000 })
                .catch(error => ({ stdout: null, stderr: error }))
            await exec(`pnpm i`, { timeout: 1000000 })
                .catch(error => ({ stdout: null, stderr: error }));
        }
    }
};