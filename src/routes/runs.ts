import type { Request } from '@sveltejs/kit';
import type { RunsApiResponse } from 'src/types';
import connectToDatabase from '../util/mongodb';
import { getRuns } from '../util/server';

export const get = async ({ query }: Request): Promise<{ body: RunsApiResponse }> => {
	const runType = query.get('runType');

	const db = await connectToDatabase();

	const runData = await getRuns(db, runType);
	return { body: runData };
};
