import { assert, test } from "vitest";

import { runScenario, pause, CallableCell } from '@holochain/tryorama';
import { NewEntryAction, ActionHash, Record, AppBundleSource, fakeDnaHash, fakeActionHash, fakeAgentPubKey, fakeEntryHash } from '@holochain/client';
import { decode } from '@msgpack/msgpack';

import { createGeoPost, sampleGeoPost } from './common.js';

test('create GeoPost', async () => {
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

    // Alice creates a GeoPost
    const record: Record = await createGeoPost(alice.cells[0]);
    assert.ok(record);
  });
});

test('create and read GeoPost', async () => {
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

    const sample = await sampleGeoPost(alice.cells[0]);

    // Alice creates a GeoPost
    const record: Record = await createGeoPost(alice.cells[0], sample);
    assert.ok(record);

    // Wait for the created entry to be propagated to the other node.
    await pause(1200);

    // Bob gets the created GeoPost
    const createReadOutput: Record = await bob.cells[0].callZome({
      zome_name: "geo_data",
      fn_name: "get_geo_post",
      payload: record.signed_action.hashed.hash,
    });
    assert.deepEqual(sample, decode((createReadOutput.entry as any).Present.entry) as any);
  });
});

test('create and update GeoPost', async () => {
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

    // Alice creates a GeoPost
    const record: Record = await createGeoPost(alice.cells[0]);
    assert.ok(record);
        
    const originalActionHash = record.signed_action.hashed.hash;
 
    // Alice updates the GeoPost
    let contentUpdate: any = await sampleGeoPost(alice.cells[0]);
    let updateInput = {
      original_geo_post_hash: originalActionHash,
      previous_geo_post_hash: originalActionHash,
      updated_geo_post: contentUpdate,
    };

    let updatedRecord: Record = await alice.cells[0].callZome({
      zome_name: "geo_data",
      fn_name: "update_geo_post",
      payload: updateInput,
    });
    assert.ok(updatedRecord);

    // Wait for the updated entry to be propagated to the other node.
    await pause(1200);
        
    // Bob gets the updated GeoPost
    const readUpdatedOutput0: Record = await bob.cells[0].callZome({
      zome_name: "geo_data",
      fn_name: "get_geo_post",
      payload: updatedRecord.signed_action.hashed.hash,
    });
    assert.deepEqual(contentUpdate, decode((readUpdatedOutput0.entry as any).Present.entry) as any);

    // Alice updates the GeoPost again
    contentUpdate = await sampleGeoPost(alice.cells[0]);
    updateInput = { 
      original_geo_post_hash: originalActionHash,
      previous_geo_post_hash: updatedRecord.signed_action.hashed.hash,
      updated_geo_post: contentUpdate,
    };

    updatedRecord = await alice.cells[0].callZome({
      zome_name: "geo_data",
      fn_name: "update_geo_post",
      payload: updateInput,
    });
    assert.ok(updatedRecord);

    // Wait for the updated entry to be propagated to the other node.
    await pause(1200);
        
    // Bob gets the updated GeoPost
    const readUpdatedOutput1: Record = await bob.cells[0].callZome({
      zome_name: "geo_data",
      fn_name: "get_geo_post",
      payload: updatedRecord.signed_action.hashed.hash,
    });
    assert.deepEqual(contentUpdate, decode((readUpdatedOutput1.entry as any).Present.entry) as any);
  });
});

test('create and delete GeoPost', async () => {
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

    // Alice creates a GeoPost
    const record: Record = await createGeoPost(alice.cells[0]);
    assert.ok(record);
        
    // Alice deletes the GeoPost
    const deleteActionHash = await alice.cells[0].callZome({
      zome_name: "geo_data",
      fn_name: "delete_geo_post",
      payload: record.signed_action.hashed.hash,
    });
    assert.ok(deleteActionHash);

    // Wait for the entry deletion to be propagated to the other node.
    await pause(1200);
        
    // Bob tries to get the deleted GeoPost
    const readDeletedOutput = await bob.cells[0].callZome({
      zome_name: "geo_data",
      fn_name: "get_geo_post",
      payload: record.signed_action.hashed.hash,
    });
    assert.notOk(readDeletedOutput);
  });
});
