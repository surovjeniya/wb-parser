export interface ITurnover {
  data: Data;
  error: boolean;
  errorText: string;
  additionalErrors: any;
}

export interface Data {
  turnoverReportDailyDynamicsTable: TurnoverReportDailyDynamicsTable[];
  totalCount: number;
}

export interface TurnoverReportDailyDynamicsTable {
  date: string;
  turnover: number;
  change: string;
}
