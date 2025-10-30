import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
	interface User {
		id: string;
		email: string;
		firstName: string;
		lastName: string;
	}

	interface Session {
		user: {
			id: string;
			email: string;
			firstName: string;
			lastName: string;
		};
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		id: string;
		firstName: string;
		lastName: string;
	}
}
