import type { RequestHandler } from '@sveltejs/kit';
import type { Db } from 'mongodb';
import { RUN_SEGMENT_COLLECTION_NAME } from '../constants';
import type { RunsApiResponse, RunSegment } from 'src/types';
import connectToDatabase from '../util/mongodb';
import { getCollectionName, getRuns } from '../util/server';

export const post: RequestHandler<Record<string, never>, RunSegment, RunsApiResponse> = async ({
	query,
	body
}) => {
	const runType = query.get('runType');
	const { runId } = body;

	const db = await connectToDatabase();
	const collectionName = getCollectionName(runType, RUN_SEGMENT_COLLECTION_NAME);

	const doesMatchingRunExist = Boolean(
		await db.collection(collectionName).findOne<RunSegment>({ runId })
	);

	if (doesMatchingRunExist) {
		await updateExistingRun(db, body, collectionName);
	} else {
		await createNewRun(db, body, collectionName);
	}
	const newRunsData = await getRuns(db, runType);

	return { body: newRunsData };
};

const updateExistingRun = async (db: Db, body: RunSegment, collectionName: string) => {
	const { segmentId, segmentTime, isCompleted, runId } = body;

	const matchingSegment = await db
		.collection<RunSegment>(collectionName)
		.findOne({ runId, segmentId });

	if (matchingSegment) {
		await updateExistingSegment(db, body, collectionName);
	} else {
		await createNewSegmentForExistingRun(
			db,
			runId,
			segmentId,
			segmentTime,
			isCompleted,
			collectionName
		);
	}
};

const updateExistingSegment = async (db: Db, body: RunSegment, collectionName: string) => {
	const { segmentId, segmentTime, runId, isCompleted } = body;
	await db
		.collection<RunSegment>(collectionName)
		.updateOne({ runId, segmentId }, { $set: { segmentTime, isCompleted } });
};

const createNewSegmentForExistingRun = async (
	db: Db,
	runId: number,
	segmentId: number,
	segmentTime: number,
	isCompleted: boolean,
	collectionName: string
) => {
	await db
		.collection<RunSegment>(collectionName)
		.insertOne({ segmentId, segmentTime, runId, isCompleted });
};

const createNewRun = async (db: Db, body: RunSegment, collectionName: string) => {
	const { segmentId, segmentTime, isCompleted } = body;

	const maxRunIdList = await db
		.collection<RunSegment>(collectionName)
		.find()
		.sort({ runId: -1 })
		.limit(1)
		.toArray();
	const maxId = maxRunIdList[0]?.runId ?? 0;
	const newId = maxId + 1;

	await createNewSegmentForExistingRun(
		db,
		newId,
		segmentId,
		segmentTime,
		isCompleted,
		collectionName
	);
};
