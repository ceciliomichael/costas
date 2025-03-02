export interface IContactMessageData {
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt?: Date;
  isRead?: boolean;
}

export interface IContactMessageResponse {
  success: boolean;
  message: string;
  data?: IContactMessageData;
} 