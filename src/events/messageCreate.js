const DailyManager = require('../services/DailyManager');

module.exports = {
	name: 'messageCreate',
	async execute(message) {
        await DailyManager.handleMessage(message);
	},
};
