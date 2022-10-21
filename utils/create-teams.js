const { shuffleArray } = require('./array-shuffle');

const createTeam = (userArray, numOfTeams) => {
	const randArray = shuffleArray(userArray);

	let i = 0;

	const finalTeams = [];

	for (let x = 0; x < numOfTeams; x++) {
		finalTeams[x] = [];
	}

	randArray.forEach(user => {

		finalTeams[i][finalTeams[i].length] = user;

		i++;

		if (i >= numOfTeams) {
			i = 0;
		}
	});

	return finalTeams;
};

const createOutputString = (teams) => {
	let outputString = '';

	let i = 1;

	teams.forEach(team => {
		outputString += `\tTeam ${i}: `;

		team.forEach(user => {
			outputString += user.displayName + ', ';
		});

		outputString = outputString.slice(0, outputString.length - 2) + '\n';

		i++;
	});

	return outputString;
};

module.exports = {
	createTeam, createOutputString,
};