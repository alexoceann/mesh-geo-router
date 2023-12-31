<script lang="ts">
import { createEventDispatcher, onMount, getContext } from 'svelte';
import '@material/mwc-circular-progress';
import { decode } from '@msgpack/msgpack';
import type { Record, ActionHash, AppAgentClient, EntryHash, AgentPubKey, DnaHash } from '@holochain/client';
import { clientContext } from '../../contexts';
import type { GeoPost, Content, LocationData } from './types';
import '@material/mwc-circular-progress';
import type { Snackbar } from '@material/mwc-snackbar';
import '@material/mwc-snackbar';
import '@material/mwc-icon-button';
import EditGeoPost from './EditGeoPost.svelte'; 

const dispatch = createEventDispatcher();

export let geoPostHash: ActionHash;

let client: AppAgentClient = (getContext(clientContext) as any).getClient();

let loading = true;
let error: any = undefined;

let record: Record | undefined;
let geoPost: GeoPost | undefined;

let editing = false;

let errorSnackbar: Snackbar;
  
$: editing,  error, loading, record, geoPost;

onMount(async () => {
  if (geoPostHash === undefined) {
    throw new Error(`The geoPostHash input is required for the GeoPostDetail element`);
  }
  await fetchGeoPost();
});

async function fetchGeoPost() {
  loading = true;
  error = undefined;
  record = undefined;
  geoPost = undefined;
  
  try {
    record = await client.callZome({
      cap_secret: null,
      role_name: 'geo_router',
      zome_name: 'geo_data',
      fn_name: 'get_geo_post',
      payload: geoPostHash,
    });
    if (record) {
      geoPost = decode((record.entry as any).Present.entry) as GeoPost;
    }
  } catch (e) {
    error = e;
  }

  loading = false;
}

async function deleteGeoPost() {
  try {
    await client.callZome({
      cap_secret: null,
      role_name: 'geo_router',
      zome_name: 'geo_data',
      fn_name: 'delete_geo_post',
      payload: geoPostHash,
    });
    dispatch('geo-post-deleted', { geoPostHash: geoPostHash });
  } catch (e: any) {
    errorSnackbar.labelText = `Error deleting the geo post: ${e.data.data}`;
    errorSnackbar.show();
  }
}
</script>

<mwc-snackbar bind:this={errorSnackbar} leading>
</mwc-snackbar>

{#if loading}
<div style="display: flex; flex: 1; align-items: center; justify-content: center">
  <mwc-circular-progress indeterminate></mwc-circular-progress>
</div>
{:else if error}
<span>Error fetching the geo post: {error.data.data}</span>
{:else if editing}
<EditGeoPost
  originalGeoPostHash={ geoPostHash}
  currentRecord={record}
  on:geo-post-updated={async () => {
    editing = false;
    await fetchGeoPost()
  } }
  on:edit-canceled={() => { editing = false; } }
></EditGeoPost>
{:else}

<div style="display: flex; flex-direction: column">
  <div style="display: flex; flex-direction: row">
    <span style="flex: 1"></span>
    <mwc-icon-button style="margin-left: 8px" icon="edit" on:click={() => { editing = true; } }></mwc-icon-button>
    <mwc-icon-button style="margin-left: 8px" icon="delete" on:click={() => deleteGeoPost()}></mwc-icon-button>
  </div>

  <div style="display: flex; flex-direction: column; margin-bottom: 16px">
    <span><strong>Content</strong></span>
    
    {#each geoPost.content as el}
      <span style="white-space: pre-line">{  el.type === 'Text' ? `Text` :  el.type === 'Image' ? `Image` :  el.type === 'Audio' ? `Audio` :  el.type === 'Video' ? `Video` :  `Landmark`  }</span>
    {/each}
  </div>
  <div style="display: flex; flex-direction: row; margin-bottom: 16px">
    <span style="margin-right: 4px"><strong>Notes:</strong></span>
    <span style="white-space: pre-line">{ geoPost.notes }</span>
  </div>

  <div style="display: flex; flex-direction: row; margin-bottom: 16px">
    <span style="margin-right: 4px"><strong>Location Name:</strong></span>
    <span style="white-space: pre-line">{ geoPost.location_name }</span>
  </div>

  <div style="display: flex; flex-direction: row; margin-bottom: 16px">
    <span style="margin-right: 4px"><strong>Location Data:</strong></span>
    <span style="white-space: pre-line">{  geoPost.location_data.type === 'LatLng' ? `Lat Lng` :  `Cell Index`  }</span>
  </div>

</div>
{/if}

