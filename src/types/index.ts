import type { AstroComponent  } from "astro/types";

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

export type LocaleCode = "en" | "fr" | "kin";

export type AppLocals = {
	locale: LocaleCode;
};

export type AstroApiContext = import("astro").APIContext & {
	locals: AppLocals;
};

export type LayoutProps = {
	title: string;
	description: string;
	canonical: string;
	locale?: LocaleCode;
};

export type LandingProps = {
	locale?: LocaleCode;
};

export type ThemeToggleProps = {
	theme?: "system" | "dark" | "light";
	label: string;
	class?: string;
};

export type ButtonProps = {
	variant?: "primary" | "secondary" | "danger" | "icon";
	loading?: boolean;
	loadingText?: string;
	fullWidth?: boolean;
	class?: string;
	disabled?: boolean;
	children?: unknown;
	type?: "button" | "submit" | "reset";
};

export type CardProps = {
	heavy?: boolean;
	padding?: "none" | "sm" | "md" | "lg";
	nohover?: boolean;
	class?: string;
	key?: string | number;
};

export type SpinnerProps = {
	size?: number;
};

export type PricingSkeletonProps = {
	cardCount?: number;
};

export type PricingToggleProps = {
	interval: PricingInterval;
	monthlyLabel: string;
	yearlyLabel: string;
};

export type PricingCardProps = {
	plan: PricingPlan;
	interval: PricingInterval;
	locale: string;
	freeLabel: string;
	billingMonthLabel: string;
	billingYearLabel: string;
	popularLabel: string;
	trialLabel: string;
	ctaLabel: string;
};

export type PricingProps = {
	t: (path: string, fallback?: string) => string;
	locale?: LocaleCode;
};


export type PricingInterval = "month" | "year";

export type PricingApiResponse = {
  data: PricingProduct[];
};

export type PricingProduct = {
  id: string;
  name: string;
  description?: string | null;
  customData?: Record<string, string | undefined> | null;
  prices: PricingPrice[];
};

export type PricingPrice = {
  id: string;
  description?: string | null;
  billingCycle?: {
    interval?: PricingInterval | string;
    frequency?: number | null;
  } | null;
  trialPeriod?: {
    interval?: string;
    frequency?: number | null;
  } | null;
  unitPrice?: {
    amount?: string;
    currencyCode?: string;
  } | null;
  customData?: Record<string, string | undefined> | null;
};

export type PricingPlan = {
  id: string;
  name: string;
  description: string;
  order: number;
  popular: boolean;
  featureTitle: string;
  featureSubtitle: string;
  featureInfo: string;
  price_id: string | null;
  features: string[];
  priceAmount: string;
  currencyCode: string;
  billingInterval: PricingInterval | string;
  billingFrequency: number;
  trialLabel: string | null;
	intervalPrices: Record<
		PricingInterval,
		{
			price_id: string | null;
			priceAmount: string;
			currencyCode: string;
			billingInterval: PricingInterval | string;
			billingFrequency: number;
			trialLabel: string | null;
		}
	>;
};

export type ThemePreference = "system" | "dark" | "light";

export type PreferenceName = "theme" | "locale" | "pricingInterval";

export type StorageScope = "local" | "session";

export type CookieOptions = {
	path?: string;
	maxAge?: number;
	sameSite?: "lax" | "strict" | "none";
	secure?: boolean;
};

export type PreferenceStorage = "local" | "session";

export type PreferenceMeta = {
	storage: PreferenceStorage;
	cookie: boolean;
	cookieMaxAge?: number;
};

export type TranslationDictionary = Record<string, unknown>;

export type PlanMetadata = {
	title: string;
	subtitle?: string;
	info?: string;
	features: string[];
};

export type PricingCache = {
	month: PricingApiResponse | null;
	year: PricingApiResponse | null;
	loadedAt: number | null;
};

export type FeatureItem = {
	icon: AstroComponent ;
	titleKey: string;
	descKey: string;
};

export type FeaturesProps = {
	t: (key: string, fallback?: string) => string;
	features: FeatureItem[];
};

export type StatItem = {
	value: number;
	labelKey: string;
	suffix: string;
};

export type StatsProps = {
	t: (key: string, fallback?: string) => string;
	stats: StatItem[];
};

export type OnBoardingStep = {
	step: number;
	titleKey: string;
	descKey: string;
};

export type OnBoardingProps = {
	t: (key: string, fallback?: string) => string;
	steps: OnBoardingStep[];
};