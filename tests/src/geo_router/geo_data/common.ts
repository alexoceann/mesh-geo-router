import { CallableCell } from '@holochain/tryorama';
import { NewEntryAction, ActionHash, Record, AppBundleSource, fakeActionHash, fakeAgentPubKey, fakeEntryHash, fakeDnaHash } from '@holochain/client';



export async function sampleGeoPost(cell: CallableCell, partialGeoPost = {}) {
    return {
        ...{
	  content: [{ type: 'Text' }],
	  notes: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
	  location_name: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
	  location_data: { type: 'LatLng' },
        },
        ...partialGeoPost
    };
}

export async function createGeoPost(cell: CallableCell, geoPost = undefined): Promise<Record> {
    return cell.callZome({
      zome_name: "geo_data",
      fn_name: "create_geo_post",
      payload: geoPost || await sampleGeoPost(cell),
    });
}

