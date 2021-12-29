import type { Db } from 'mongodb';
import type { RunsApiResponse, RunSegment, RunSegmentTime, SegmentRow } from 'src/types';
import { RunType, RUN_SEGMENT_COLLECTION_NAME, SEGMENT_COLLECTION_NAME } from '../constants';
import { groupBy, sumBy, minBy } from 'lodash';

export const getCollectionName = (
	inputString: string | string[],
	collectionType: string
): string => {
	const runTypeString = Array.isArray(inputString) ? inputString[0] : inputString;

	const runType = Object.values(RunType).find((type) => type === runTypeString) ?? '';
	return `${collectionType}_${runType}`;
};

export const getRuns = async (db: Db, runType: string | string[]): Promise<RunsApiResponse> => {
	const runSegmentsCollectionName = getCollectionName(runType, RUN_SEGMENT_COLLECTION_NAME);
	const segmentsCollectionName = getCollectionName(runType, SEGMENT_COLLECTION_NAME);

	const [allRunSegments, segments] = await Promise.all([
		db.collection<RunSegment>(runSegmentsCollectionName).find().toArray(),
		db.collection<SegmentRow>(segmentsCollectionName).find().toArray()
	]);

	const latestOrCurrentRunId = Math.max(...allRunSegments.map((r) => r.runId));
	const latestOrCurrentRunSegments = allRunSegments.filter((r) => r.runId === latestOrCurrentRunId);

	const bestSegmentTimes = getBestSegmentTimes(allRunSegments);

	return {
		bestPossibleTime: getBestPossibleTime(segments, bestSegmentTimes, latestOrCurrentRunSegments),
		bestSegmentTimes,
		bestOverallTime: getBestOverallTime(allRunSegments, segments),
		latestRunSegments: latestOrCurrentRunSegments.map((runSegment) => {
			delete runSegment._id;
			return runSegment;
		}),
		overUnders: getOverUnders(allRunSegments, latestOrCurrentRunId, latestOrCurrentRunSegments)
	};
};

export const getBestSegmentTimes = (allRunSegments: RunSegment[]): RunSegmentTime[] => {
	const completedRunSegments = allRunSegments.filter(
		(runSegment) => runSegment.isCompleted && runSegment.segmentTime > 0
	);
	const groupedTimes: Record<string, RunSegment[]> = groupBy(
		completedRunSegments,
		(runSegment: RunSegment) => runSegment.segmentId
	);
	return Object.entries(groupedTimes).map(([runId, runSegments]) => ({
		segmentId: parseInt(runId),
		time: Math.min(...runSegments.map((r) => r.segmentTime))
	}));
};

export const getBestPossibleTime = (
	segments: SegmentRow[],
	bestSegmentTimes: RunSegmentTime[],
	latestRunSegments: RunSegment[]
): number => {
	let finishedSegmentsTotalTime = 0;
	let unfinishedSegmentsTotalBestTime = 0;

	segments.forEach((segment) => {
		const runSegment = latestRunSegments.find((r) => r.segmentId === segment.id);

		if (!runSegment || !runSegment.isCompleted) {
			const bestSegmentTime = bestSegmentTimes.find((r) => r.segmentId === segment.id);
			unfinishedSegmentsTotalBestTime += bestSegmentTime?.time ?? 0;
		} else {
			finishedSegmentsTotalTime += runSegment.segmentTime;
		}
	});

	return finishedSegmentsTotalTime + unfinishedSegmentsTotalBestTime;
};

export const getBestOverallTime = (
	allRunSegments: RunSegment[],
	segments: SegmentRow[]
): number => {
	const segmentCount = segments.length;

	const completedRunSegments = allRunSegments.filter(
		(runSegment) => runSegment.isCompleted && runSegment.segmentTime > 0
	);

	const groupedRunSegments: Record<string, RunSegment[]> = groupBy(
		completedRunSegments,
		(runSegment) => runSegment.runId
	);

	const completedRunTimes = Object.values(groupedRunSegments)
		.filter((runSegmentList) => runSegmentList.length === segmentCount)
		.map((runSegmentList) => sumBy(runSegmentList, (runSegment) => runSegment.segmentTime));

	return Math.min(...completedRunTimes);
};

export const getOverUnders = (
	allRunSegments: RunSegment[],
	latestOrCurrentRunId: number,
	latestOrCurrentRunSegments: RunSegment[]
): RunSegmentTime[] => {
	const allPastRunSegments = allRunSegments.filter(
		(runSegment) => runSegment.runId !== latestOrCurrentRunId && runSegment.isCompleted
	);

	return latestOrCurrentRunSegments.reduce((agg: RunSegmentTime[], runSegment) => {
		const pastRunSegments = allPastRunSegments.filter((r) => r.segmentId === runSegment.segmentId);
		const bestPastSegment = minBy(pastRunSegments, (r) => r.segmentTime);
		const diff = runSegment.segmentTime - (bestPastSegment?.segmentTime ?? 0);
		return [...agg, { segmentId: runSegment.segmentId, time: diff }];
	}, []);
};
