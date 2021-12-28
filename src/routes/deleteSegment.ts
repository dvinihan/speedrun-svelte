import type { RequestHandler } from '@sveltejs/kit';
import { SEGMENT_COLLECTION_NAME } from '../constants';
import connectToDatabase from '../util/mongodb';
import { getCollectionName } from '../util/server';

export const del: RequestHandler = async ({ query }) => {
	const runType = query.get('runType');
	const id = query.get('id');

	const db = await connectToDatabase();
	const collectionName = getCollectionName(runType, SEGMENT_COLLECTION_NAME);

	const singleId = typeof id === 'string' ? id : id[0];
	const idQuery = Number.parseInt(singleId, 10);

	const matchingSegment = await db.collection(collectionName).findOne({ id: idQuery });

	if (matchingSegment) {
		await db.collection(collectionName).deleteOne({ id: idQuery });
	}

	return {};
};
