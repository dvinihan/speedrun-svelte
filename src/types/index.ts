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
