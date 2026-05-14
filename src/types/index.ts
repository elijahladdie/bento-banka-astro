export type RoleSlug = "client" | "cashier" | "manager";

export type UserStatus = "active" | "inactive" | "suspended" | "pending_approval";
export type AccountStatus = "Active" | "Inactive" | "Dormant";
export type AccountType = "saving" | "fixed";
export type TransactionType = "deposit" | "withdraw" | "transfer";
export type TransactionStatus = "completed" | "failed" | "pending" | "reversed";

export type Role = {
	id?: string;
	name?: string;
	slug: RoleSlug | string;
};

export type UserRole = {
	roleId?: string;
	role: Role;
};

export type User = {
	id: string;
	firstName: string;
	lastName?: string | null;
	email: string;
	preferredLanguage?: "en" | "fr" | "kin";
	phoneNumber?: string | null;
	nationalId?: string;
	profilePicture?: string | null;
	status: UserStatus;
	age?: number;
	createdAt: string;
	updatedAt?: string;
	userRoles: UserRole[];
};

export type Account = {
	id: string;
	ownerId: string;
	accountNumber: string;
	balance: number;
	status: AccountStatus;
	type: AccountType;
	createdBy: string;
	createdAt: string;
	updatedAt: string;
	owner?: {
		id?: string;
		firstName: string;
		lastName?: string | null;
		email: string;
		nationalId?: string;
		userRoles?: Array<{
			role?: {
				slug?: string;
			};
		}>;
	};
};

export type Transaction = {
	id: string;
	type: TransactionType;
	fromAccount: string | null;
	toAccount: string | null;
	performedBy: string;
	amount: number;
	reference: string;
	status: TransactionStatus;
	confirmationToken?: string | null;
	description: string;
	balanceBefore: number;
	balanceAfter: number;
	currency: string;
	fee: number;
	createdAt: string;
	updatedAt: string;
};

export type Notification = {
	id: string;
	type: string;
	title: string;
	message: string;
	isRead: boolean;
	readAt: string | null;
	userId: string;
	direction: "SENT" | "RECEIVED";
	createdAt: string;
};

export type Pagination = {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
	hasNext: boolean;
	hasPrev: boolean;
};

export type ApiSuccess<T> = {
	success: boolean;
	message: string;
	data: T;
	pagination?: Pagination;
};

export type ApiError = {
	success: boolean;
	message: string;
	errors?: Array<{ field: string; message: string }>;
};

export type LoginPayload = {
	token: string;
	user: User;
};

export type StatsOverview = {
	activeUsers: number;
	totalAccounts: number;
	transactionCount: number;
	transactionVolume: number;
	pendingApprovals: number;
};

export type StatsTransactionSeries = Array<{
	type: string;
	_sum: { amount: number | null };
	_count: { id: number };
}>;

export type StatsAccountSeries = Array<{
	type: string;
	status: string;
	_count: { id: number };
}>;

export type StatsUserSeries = Array<{
	role: string;
	count: number;
}>;
