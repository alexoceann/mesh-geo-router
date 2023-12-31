import type { 
  Record, 
  ActionHash,
  DnaHash,
  SignedActionHashed,
  EntryHash, 
  AgentPubKey,
  Create,
  Update,
  Delete,
  CreateLink,
  DeleteLink
} from '@holochain/client';

export type GeoDataSignal = {
  type: 'EntryCreated';
  action: SignedActionHashed<Create>;
  app_entry: EntryTypes;
} | {
  type: 'EntryUpdated';
  action: SignedActionHashed<Update>;
  app_entry: EntryTypes;
  original_app_entry: EntryTypes;
} | {
  type: 'EntryDeleted';
  action: SignedActionHashed<Delete>;
  original_app_entry: EntryTypes;
} | {
  type: 'LinkCreated';
  action: SignedActionHashed<CreateLink>;
  link_type: string;
} | {
  type: 'LinkDeleted';
  action: SignedActionHashed<DeleteLink>;
  link_type: string;
};

export type EntryTypes =
 | ({  type: 'GeoPost'; } & GeoPost);


export interface Content {
  type:  
    | 'Text'
        | 'Image'
        | 'Audio'
        | 'Video'
        | 'Landmark'
    ;
}
export interface LocationData {
  type:  
    | 'LatLng'
        | 'CellIndex'
    ;
}

export interface GeoPost { 
  content: Array<Content>;

  notes: string;

  location_name: string;

  location_data: LocationData | undefined;
}

