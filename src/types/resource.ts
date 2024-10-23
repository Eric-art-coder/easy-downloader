export type ResourceType = 'video' | 'audio' | 'image' | 'm3u8' | 'live' | 'all';

export interface Resource {
  type_str: ResourceType;
  url: string;
  platform: string;
  size: string;
  save_path?: string;
  progress_bar?: string;
  description?: string;
  decode_key?: string;
  decryptor_array?: any;
  type?: string;
}
