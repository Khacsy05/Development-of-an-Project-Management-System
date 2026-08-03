export class CapstoneSubmissionQuery {
  lecturer_id?: string;
  milestone_type?: 'progress' | 'final';
  status?: string;
  has_file?: boolean;
  page?: number;
  limit?: number;
}
