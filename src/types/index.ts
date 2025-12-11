export interface Country {
  id: number;
  name: string;
  code: string;
}

export interface Note {
  id: number;
  country_id: number;
  title: string;
  date: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Image {
  id: number;
  note_id: number;
  filename: string;
  filepath: string;
}

export interface Attachment {
  id: number;
  note_id: number;
  filename: string;
  filepath: string;
  original_name: string | null;
  mime_type: string | null;
  file_size: number | null;
  order_index: number;
  created_at: string;
}

export interface Link {
  id: number;
  note_id: number;
  url: string;
  title: string;
}

export interface Auth {
  id: number;
  password_hash: string;
}
