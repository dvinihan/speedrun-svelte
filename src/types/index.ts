export interface RunSegmentTime {
	segmentId: number;
	time: number;
}

export type SegmentRow = {
	id: number;
	name: string;
};

export type RunSegment = {
	runId: number;
	segmentId: number;
	segmentTime: number;
	isCompleted: boolean;
};

export type RunsApiResponse = {
	bestPossibleTime: number;
	bestSegmentTimes: RunSegmentTime[];
	bestOverallTime: number;
	latestRunSegments: RunSegment[];
	overUnders: RunSegmentTime[];
};
