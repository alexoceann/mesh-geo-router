<script lang="ts">
import { createEventDispatcher, getContext, onMount } from 'svelte';
import type { AppAgentClient, Record, EntryHash, AgentPubKey, DnaHash, ActionHash } from '@holochain/client';
import { decode } from '@msgpack/msgpack';
import { clientContext } from '../../contexts';
import type { GeoPost, Content, LocationData } from './types';
import '@material/mwc-button';
import '@material/mwc-snackbar';
import type { Snackbar } from '@material/mwc-snackbar';
import '@material/mwc-textfield';

import '@material/mwc-select';
import '@material/mwc-textarea';
let client: AppAgentClient = (getContext(clientContext) as any).getClient();

const dispatch = createEventDispatcher();

export let originalGeoPostHash!: ActionHash;

export let currentRecord!: Record;
let currentGeoPost: GeoPost = decode((currentRecord.entry as any).Present.entry) as GeoPost;

let content: Array<Content | undefined> = currentGeoPost.content;
let notes: string | undefined = currentGeoPost.notes;
let locationName: string | undefined = currentGeoPost.location_name;
let locationData: LocationData | undefined = currentGeoPost.location_data;

let errorSnackbar: Snackbar;

$: content, notes, locationName, locationData;
$: isGeoPostValid = true && content.every(e => true) && notes !== '' && locationName !== '';

onMount(() => {
  if (currentRecord === undefined) {
    throw new Error(`The currentRecord input is required for the EditGeoPost element`);
  }
  if (originalGeoPostHash === undefined) {
    throw new Error(`The originalGeoPostHash input is required for the EditGeoPost element`);
  }
});

async function updateGeoPost() {

  const geoPost: GeoPost = {
    content: content as Array<Content>,
    notes: notes!,
    location_name: locationName!,
    location_data: locationData,
  };

  try {
    const updateRecord: Record = await client.callZome({
      cap_secret: null,
      role_name: 'geo_router',
      zome_name: 'geo_data',
      fn_name: 'update_geo_post',
      payload: {
        original_geo_post_hash: originalGeoPostHash,
        previous_geo_post_hash: currentRecord.signed_action.hashed.hash,
        updated_geo_post: geoPost
      }
    });

    dispatch('geo-post-updated', { actionHash: updateRecord.signed_action.hashed.hash });
  } catch (e) {
    errorSnackbar.labelText = `Error updating the geo post: ${e.data.data}`;
    errorSnackbar.show();
  }
}

</script>
<mwc-snackbar bind:this={errorSnackbar} leading>
</mwc-snackbar>
<div style="display: flex; flex-direction: column">
  <span style="font-size: 18px">Edit GeoPost</span>

  <div style="margin-bottom: 16px">
    <div style="display: flex; flex-direction: column" >
      <span>Content</span>
      
      {#each content as el, i}
      <mwc-select outlined helper="" >
  <mwc-list-item selected={ el.type === 'Text' } on:request-selected={() => { content[i] = { type: 'Text' }; } }>Text</mwc-list-item>
  <mwc-list-item selected={ el.type === 'Image' } on:request-selected={() => { content[i] = { type: 'Image' }; } }>Image</mwc-list-item>
  <mwc-list-item selected={ el.type === 'Audio' } on:request-selected={() => { content[i] = { type: 'Audio' }; } }>Audio</mwc-list-item>
  <mwc-list-item selected={ el.type === 'Video' } on:request-selected={() => { content[i] = { type: 'Video' }; } }>Video</mwc-list-item>
  <mwc-list-item selected={ el.type === 'Landmark' } on:request-selected={() => { content[i] = { type: 'Landmark' }; } }>Landmark</mwc-list-item>
</mwc-select> }`)}
      {/each}
    
      <mwc-button icon="add" label="Add Content" on:click={() => { content = [...content, { type: 'Text' }]; } }></mwc-button>
    </div>
  </div>

  <div style="margin-bottom: 16px">
    <mwc-textarea outlined label="Notes" value={ notes } on:input={e => { notes = e.target.value;} } required></mwc-textarea>
  </div>

  <div style="margin-bottom: 16px">
    <mwc-textfield outlined label="Location Name" value={ locationName } on:input={e => { locationName = e.target.value; } } required></mwc-textfield>
  </div>

  <div style="margin-bottom: 16px">
    <mwc-select outlined helper="Location Data" >
  <mwc-list-item selected={ locationData.type === 'LatLng' } on:request-selected={() => { locationData = { type: 'LatLng' }; } }>Lat Lng</mwc-list-item>
  <mwc-list-item selected={ locationData.type === 'CellIndex' } on:request-selected={() => { locationData = { type: 'CellIndex' }; } }>Cell Index</mwc-list-item>
</mwc-select>
  </div>


  <div style="display: flex; flex-direction: row">
    <mwc-button
      outlined
      label="Cancel"
      on:click={() => dispatch('edit-canceled')}
      style="flex: 1; margin-right: 16px"
    ></mwc-button>
    <mwc-button
      raised
      label="Save"
      disabled={!isGeoPostValid}
      on:click={() => updateGeoPost()}
      style="flex: 1;"
    ></mwc-button>
  </div>
</div>
