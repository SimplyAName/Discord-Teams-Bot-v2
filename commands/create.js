const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { createTeam, createOutputString } = require('../utils/create-teams');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('create')
		.setDescription('Creates a teams!')
		.addSubcommand(voiceSubCommand =>
			voiceSubCommand
				.setName('with-voice')
				.setDescription('Create teams and sends users to a voice channel. 🔊')
				.addIntegerOption(option => option.setName('number-of-teams')
					.setDescription('The number of teams to split players into. (2 by default)')
					.setMaxValue(9)
					.setRequired(false)))
		.addSubcommand(noVoiceSubCommand =>
			noVoiceSubCommand
				.setName('without-voice')
				.setDescription('Create teams without sending users to a voice channel. 🔈')
				.addIntegerOption(option => option.setName('number-of-teams')
					.setDescription('The number of teams to split players into. (2 by default)')
					.setMaxValue(9)
					.setRequired(false))),
	async execute(interaction) {

		const numOfTeams = interaction.options.getInteger('number-of-teams') ?? 2;

		const requestingMember = await interaction.member.fetch();

		console.debug('Requesting user: ' + requestingMember);

		if (requestingMember.voice.channel == null) {
			await interaction.reply('Please join a voice channel with the other members you wish to create teams with!');

			return;
		}

		const players = requestingMember.voice.channel.members;

		console.debug(players.toJSON());

		const shuffledTeams = createTeam(players, numOfTeams);

		const outputString = createOutputString(shuffledTeams);

		const teamEmojis = ['🟥', '🟦', '🟩', '🟨', '🟪', '🟧', '🟫', '⬛', '⬜'];

		if (interaction.options.getSubcommand() == 'with-voice') {

			const teamChannels = [];

			// Create team channel category to place voice channels into
			const teamsCategory = await interaction.guild.channels.create({
				name: 'Team channels 🏆',
				type: ChannelType.GuildCategory,
			});

			// Create voice channels for teams
			for (let y = 0; y < shuffledTeams.length; y++) {

				// Create voice channel
				teamChannels[y] = await interaction.guild.channels.create({
					name: `Team ${y + 1} ${teamEmojis[y]}`,
					type: ChannelType.GuildVoice,
					parent: teamsCategory.id,
				});

				console.debug(`Team ${y + 1} channel created`);

				console.debug(`Moving members for team ${y + 1 }`);

				// Send users to voice channels
				shuffledTeams[y].forEach(member => {
					console.debug(`Moving user: ${member.displayName}`);

					member.voice.setChannel(teamChannels[y], `Moved to team channel ${y}`);
				});
			}

			await interaction.reply('Created team and sending teams to voice channels!\n\nThe teams are:\n' + outputString);
		}
		else {
			await interaction.reply('Create teams!.\n\nThe teams are:\n' + outputString);
		}
	},
};