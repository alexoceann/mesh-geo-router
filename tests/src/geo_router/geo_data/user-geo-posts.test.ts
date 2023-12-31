import { assert, test } from "vitest";

import { runScenario, pause, CallableCell } from '@holochain/tryorama';
import { NewEntryAction, ActionHash, Record, AppBundleSource,  fakeActionHash, fakeAgentPubKey, fakeEntryHash } from '@holochain/client';
import { decode } from '@msgpack/msgpack';

import { createGeoPost } from './common.js';

test('create a GeoPost and get user geo posts', async () => {
  await runScenario(async scenario => {
    // Construct proper paths for your app.
    // This assumes app bundle created by the `hc app pack` command.
    const testAppPath = process.cwd() + '/../workdir/mesh-geo-router.happ';

    // Set up the app to be installed 
    const appSource = { appBundleSource: { path: testAppPath } };

    // Add 2 players with the test app to the Scenario. The returned players
    // can be destructured.
    const [alice, bob] = await scenario.addPlayersWithApps([appSource, appSource]);

    // Shortcut peer discovery through gossip and register all agents in every
    // conductor of the scenario.
    await scenario.shareAllAgents();

    // Bob gets user geo posts
    let collectionOutput: Record[] = await bob.cells[0].callZome({
      zome_name: "geo_data",
      fn_name: "get_user_geo_posts",
      payload: alice.agentPubKey
    });
    assert.equal(collectionOutput.length, 0);

    // Alice creates a GeoPost
    const createdRecord: Record = await createGeoPost(alice.cells[0]);
    assert.ok(createdRecord);
    
    await pause(1200);
    
    // Bob gets user geo posts again
    collectionOutput = await bob.cells[0].callZome({
      zome_name: "geo_data",
      fn_name: "get_user_geo_posts",
      payload: alice.agentPubKey
    });
    assert.equal(collectionOutput.length, 1);
    assert.deepEqual(createdRecord, collectionOutput[0]);    
  });
});

