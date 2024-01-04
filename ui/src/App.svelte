<script lang="ts">
  import { onMount, setContext } from 'svelte';
  import type { ActionHash, AppAgentClient } from '@holochain/client';
  import { AppAgentWebsocket } from '@holochain/client';
  import '@material/mwc-circular-progress';
  import FindLocation from './geo_router/geo_data/FindLocation.svelte';

  import { clientContext } from './contexts';

  let client: AppAgentClient | undefined;

  let loading = true; 


  onMount(async () => {
    // We pass '' as url because it will dynamically be replaced in launcher environments
    client = await AppAgentWebsocket.connect('', 'mesh-geo-router');

    loading = false;
  });

  setContext(clientContext, {
    getClient: () => client,
  });
</script>

<main>
  {#if loading}
    <div style="display: flex; flex: 1; align-items: center; justify-content: center">
      <mwc-circular-progress indeterminate />
    </div>
  {:else}
    <div id="content">
      

        
   
      <header class="header">
        <h1>mesh geo router</h1>
      </header>

      <section class="sidebar"></section>

      <section class="main">
        <FindLocation></FindLocation>
      </section>

    </div>
  {/if}
</main>

<style>
  #content {
    height: 100vh;

    display: grid;
    grid-template-columns: 220px 1fr;
    grid-template-rows: 60px 1fr;
    grid-template-areas: 
      "header header"
      "side main";
  }

  .main {
    background-color: var(--teal-8);
    grid-area: main;
  }

  @media (min-width: 640px) {
    .main {
      max-width: none;
    }
  }

  .header {
    background-color: var(--yellow-6);
    grid-area: header;
  }

  .sidebar {
    background-color: var(--purple-5);
    grid-area: side;
  }
</style>
