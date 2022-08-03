export const addSpecialRule = (spiritBoard) => {
	spiritBoard.specialRules.rules.push({
		id: spiritBoard.specialRules.rules.length,
		name: "",
		effect: "",
	});
	return spiritBoard;
};
