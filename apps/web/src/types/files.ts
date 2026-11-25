export type ConversationFileType = 'invoice' | 'packing_list' | 'bol' | 'certificate' | 'other';

export interface ConversationFile {
  id: string;
  name: string;
  type: ConversationFileType;
  typeLabel: string;
  size: string;
  uploadedAt: string;
}
