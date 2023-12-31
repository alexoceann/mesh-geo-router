<script lang="ts">
import { onMount, getContext } from 'svelte';
import '@material/mwc-circular-progress';
import type { EntryHash, Record, AgentPubKey, ActionHash, AppAgentClient, NewEntryAction } from '@holochain/client';
import { clientContext } from '../../contexts';
import GeoPostDetail from './GeoPostDetail.svelte';
import type { GeoDataSignal } from './types';

export let author: AgentPubKey;

let client: AppAgentClient = (getContext(clientContext) as any).getClient();

let hashes: Array<ActionHash> | undefined;
let loading = true;
let error: any = undefined;

$: hashes, loading, error;

onMount(async () => {
    if (author === undefined) {
      throw new Error(`The author input is required for the UserGeoPosts element`);
    }


  await fetchGeoPosts();
  client.on('signal', signal => {
    if (signal.zome_name !== 'geo_data') return;
    const payload = signal.payload as GeoDataSignal;
    if (payload.type !== 'EntryCreated') return;
    if (payload.app_entry.type !== 'GeoPost') return;
    if (author.toString() !== client.myPubKey.toString()) return;
    hashes = [...hashes, payload.action.hashed.hash];
  });
});

async function fetchGeoPosts() {
  try {
    const records = await client.callZome({
      cap_secret: null,
      role_name: 'geo_router',
      zome_name: 'geo_data',
      fn_name: 'get_user_geo_posts',
      payload: author,
    });
    hashes = records.map(r => r.signed_action.hashed.hash);
  } catch (e) {
    error = e;
  }
  loading = false;
}

</script>

{#if loading}
<div style="display: flex; flex: 1; align-items: center; justify-content: center">
  <mwc-circular-progress indeterminate></mwc-circular-progress>
</div>
{:else if error}
<span>Error fetching the geo posts: {error.data.data}.</span>
{:else if hashes.length === 0}
<span>No geo posts found for this author.</span>
{:else}
<div style="display: flex; flex-direction: column">
  {#each hashes as hash}
    <div style="margin-bottom: 8px;">
      <GeoPostDetail geoPostHash={hash}  on:geo-post-deleted={() => fetchGeoPosts()}></GeoPostDetail>
    </div>
  {/each}
</div>
{/if}

