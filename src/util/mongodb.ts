import { Db, MongoClient } from 'mongodb';

// const { MONGODB_URI, MONGODB_DB } = process.env;

// if (!MONGODB_URI) {
// 	throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
// }

// if (!MONGODB_DB) {
// 	throw new Error('Please define the MONGODB_DB environment variable inside .env.local');
// }

const MONGODB_URI =
	'mongodb+srv://danielvinihan:GGJSkLY8xmE7Xx@cluster0.sqsuc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
const MONGODB_DB = 'super_mario_odyssey';
/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongo;

if (!cached) {
	// eslint-disable-next-line no-multi-assign
	cached = global.mongo = { conn: null, promise: null };
}

const connectToDatabase: () => Promise<Db> = async () => {
	if (cached.conn) {
		return cached.conn;
	}

	if (!cached.promise) {
		cached.promise = MongoClient.connect(MONGODB_URI).then((client) => client.db(MONGODB_DB));
	}
	cached.conn = await cached.promise;
	return cached.conn;
};

export default connectToDatabase;
