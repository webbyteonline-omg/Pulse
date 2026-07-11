// Database types for all Pulse tables. Kept in sync with
// supabase/migrations/0001_init.sql.
//
// NOTE: rows are `type` aliases (not interfaces) so they structurally satisfy
// supabase-js's GenericTable constraint (Record<string, unknown>).

export type EventType = "holiday" | "exam" | "quiz" | "assignment" | "other";
export type ExpenseCategory =
  | "food"
  | "travel"
  | "shopping"
  | "bills"
  | "education"
  | "health"
  | "entertainment"
  | "others";
export type ExpenseSource = "manual" | "sms" | "screenshot";
export type AttendanceStatus = "present" | "absent";

export type Subject = {
  id: string;
  user_id: string;
  name: string;
  color: string;
  total_classes: number;
  attended_classes: number;
  required_percentage: number;
  created_at: string;
};

export type AttendanceLog = {
  id: string;
  user_id: string;
  subject_id: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  created_at: string;
};

export type AcademicEvent = {
  id: string;
  user_id: string;
  title: string;
  event_type: EventType | null;
  date: string; // YYYY-MM-DD
  description: string | null;
  subject_id: string | null;
  notified_3day: boolean;
  notified_1day: boolean;
  created_at: string;
};

export type Expense = {
  id: string;
  user_id: string;
  amount: number;
  merchant: string | null;
  category: ExpenseCategory | null;
  note: string | null;
  date: string; // YYYY-MM-DD
  source: ExpenseSource | null;
  created_at: string;
};

export type Budget = {
  id: string;
  user_id: string;
  month: number;
  year: number;
  category: string;
  amount: number;
};

export type PushSubscriptionJSON = {
  endpoint: string;
  expirationTime?: number | null;
  keys: { p256dh: string; auth: string };
};

export type PushSubscriptionRow = {
  id: string;
  user_id: string;
  subscription: PushSubscriptionJSON;
  created_at: string;
};

type InsertOf<Row, Optional extends keyof Row> = Omit<Row, Optional> &
  Partial<Pick<Row, Optional>>;

export type SubjectInsert = InsertOf<
  Subject,
  "id" | "created_at" | "color" | "total_classes" | "attended_classes" | "required_percentage"
>;
export type AttendanceLogInsert = InsertOf<AttendanceLog, "id" | "created_at" | "date">;
export type AcademicEventInsert = InsertOf<
  AcademicEvent,
  "id" | "created_at" | "description" | "subject_id" | "notified_3day" | "notified_1day"
>;
export type ExpenseInsert = InsertOf<Expense, "id" | "created_at" | "merchant" | "note">;
export type BudgetInsert = InsertOf<Budget, "id">;
export type PushSubscriptionInsert = InsertOf<PushSubscriptionRow, "id" | "created_at">;

export type Database = {
  public: {
    Tables: {
      subjects: {
        Row: Subject;
        Insert: SubjectInsert;
        Update: Partial<Subject>;
        Relationships: [];
      };
      attendance_logs: {
        Row: AttendanceLog;
        Insert: AttendanceLogInsert;
        Update: Partial<AttendanceLog>;
        Relationships: [];
      };
      academic_events: {
        Row: AcademicEvent;
        Insert: AcademicEventInsert;
        Update: Partial<AcademicEvent>;
        Relationships: [];
      };
      expenses: {
        Row: Expense;
        Insert: ExpenseInsert;
        Update: Partial<Expense>;
        Relationships: [];
      };
      budgets: {
        Row: Budget;
        Insert: BudgetInsert;
        Update: Partial<Budget>;
        Relationships: [];
      };
      push_subscriptions: {
        Row: PushSubscriptionRow;
        Insert: PushSubscriptionInsert;
        Update: Partial<PushSubscriptionRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
