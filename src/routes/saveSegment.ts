import type { RequestHandler } from '@sveltejs/kit';
import { SEGMENT_COLLECTION_NAME } from '../constants';
import connectToDatabase from '../util/mongodb';
import { getCollectionName } from '../util/server';

type Input = {
	id: number;
	name: string;
};

export const post: RequestHandler<Record<string, never>, Input, Record<string, never>> = async ({
	body,
	query
}) => {
	const { id, name } = body;
	const runType = query.get('runType');

	const db = await connectToDatabase();
	const collectionName = getCollectionName(runType, SEGMENT_COLLECTION_NAME);

	const matchingSegment = await db.collection(collectionName).findOne({ id });

	if (matchingSegment) {
		await db.collection(collectionName).updateOne({ id }, { $set: { name } });
	} else {
		await db.collection(collectionName).insertOne({ id, name });
	}

	return {};
};
