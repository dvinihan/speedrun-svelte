import type { RequestHandler } from '@sveltejs/kit';
import type { WithId } from 'mongodb';
import { SEGMENT_COLLECTION_NAME } from '../constants';
import type { SegmentRow } from 'src/types';
import connectToDatabase from '../util/mongodb';
import { getCollectionName } from '../util/server';

type SegmentsResponse = {
	body: SegmentRow[];
};

export const get: RequestHandler<SegmentsResponse> = async ({ query }) => {
	const runType = query.get('runType');

	const db = await connectToDatabase();
	const collectionName = getCollectionName(runType, SEGMENT_COLLECTION_NAME);

	const segments = await db.collection(collectionName).find().toArray();

	return {
		body: segments.map((segment: WithId<SegmentRow>) => {
			delete segment._id;
			return segment;
		})
	};
};
