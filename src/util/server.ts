import { RunType } from '../constants';

export const getCollectionName = (
	inputString: string | string[],
	collectionType: string
): string => {
	const runTypeString = Array.isArray(inputString) ? inputString[0] : inputString;

	const runType = Object.values(RunType).find((type) => type === runTypeString) ?? '';
	return `${collectionType}_${runType}`;
};
