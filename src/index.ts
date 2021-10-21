import type { Options, InstanceOptions } from "./types";
import RequestHandler from "./util/RequestHandler";
import Posts from "./modules/Posts";
import UserFeedback from "./modules/UserFeedback";
import Users from "./modules/Users";
import PostSets from "./modules/PostSets";
import Pools from "./modules/Pools";
import AuthenticatedUser from "./structures/AuthenticatedUser";
import Pool from "./structures/Pool";
import PoolHistory from "./structures/PoolHistory";
import Post from "./structures/Post";
import PostSet from "./structures/PostSet";
import User from "./structures/User";
import pkg from "../package.json";

// note for future reference (browser compatibility?)
// POST with "_method=*" can be used in place of PUT/PATCH/DELETE
export default class E621 {
	request = new RequestHandler(this);
	postSets = new PostSets(this);
	pools = new Pools(this);
	posts = new Posts(this);
	userFeedback = new UserFeedback(this);
	users = new Users(this);
	private readonly auth: string | null;
	readonly options: InstanceOptions;
	constructor(options?: Options) {
		if (!options) options = {};

		if (!options.instanceHost) options.instanceHost = "e621.net";
		options.instanceSSL = options.instanceSSL ?? ["e621.net", "yiff.rest"].includes(options.instanceHost);
		if (!options.instancePort) options.instancePort = options.instanceSSL ? 443 : 80;
		if (!options.imageReconstructionType) {
			switch (options.instanceHost) {
				case "e621.net": options.imageReconstructionType = "e621"; break;
				case "yiff.rest": options.imageReconstructionType = "yiffy"; break;
				case "e621.local": options.imageReconstructionType = "dev"; break;
				default: {
					options.imageReconstructionType = null;
					if (!options.reconstructStaticURL) process.emitWarning("You specified a host that wasn't in our known list (e621.net, yiff.rest, e621.local) and didn't also specify imageReconstructionType or reconstructStaticURL. This WILL cause an error if we see any null file urls.");
				}
			}
		}

		Object.defineProperties(this, {
			auth: {
				get(this: E621) {
					return !this.options.authUser || !this.options.authKey ? null : `Basic ${Buffer.from(`${this.options.authUser}:${this.options.authKey}`).toString("base64")}`;
				},
				configurable: false,
				enumerable: false
			},
			options: {
				value: {
					instanceHost: options.instanceHost,
					instancePort: options.instancePort,
					instanceSSL: options.instanceSSL,
					authUser: options.authUser ?? null,
					authKey: options.authKey ?? null,
					reconstructStaticURL: options.reconstructStaticURL || null,
					imageReconstructionType: options.imageReconstructionType || "hierarchy",
					userAgent: options.userAgent ?? `E621/${pkg.version} (https://github.com/DonovanDMC/E621${!options.authUser ? "" : `; "${options.authUser}"`})`,
					requestTimeout: options.requestTimeout ?? 30
				},
				configurable: false,
				enumerable: false,
				writable: false
			}
		});
	}
}
export * from "./types";
export { APIError } from "./util/RequestHandler";
export { AuthenticatedUser, Pool, PoolHistory, Post, PostSet, User };
