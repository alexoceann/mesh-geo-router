use hdk::prelude::*;
use geo_data_integrity::*;
#[hdk_extern]
pub fn create_geo_post(geo_post: GeoPost) -> ExternResult<Record> {
    let geo_post_hash = create_entry(&EntryTypes::GeoPost(geo_post.clone()))?;
    let record = get(geo_post_hash.clone(), GetOptions::default())?
        .ok_or(
            wasm_error!(
                WasmErrorInner::Guest(String::from("Could not find the newly created GeoPost"))
            ),
        )?;
    let my_agent_pub_key = agent_info()?.agent_latest_pubkey;
    create_link(my_agent_pub_key, geo_post_hash.clone(), LinkTypes::UserGeoPosts, ())?;
    Ok(record)
}
#[hdk_extern]
pub fn get_geo_post(original_geo_post_hash: ActionHash) -> ExternResult<Option<Record>> {
    let links = get_links(
        original_geo_post_hash.clone(),
        LinkTypes::GeoPostUpdates,
        None,
    )?;
    let latest_link = links
        .into_iter()
        .max_by(|link_a, link_b| link_a.timestamp.cmp(&link_b.timestamp));
    let latest_geo_post_hash = match latest_link {
        Some(link) => ActionHash::from(link.target.clone()),
        None => original_geo_post_hash.clone(),
    };
    get(latest_geo_post_hash, GetOptions::default())
}
#[derive(Serialize, Deserialize, Debug)]
pub struct UpdateGeoPostInput {
    pub original_geo_post_hash: ActionHash,
    pub previous_geo_post_hash: ActionHash,
    pub updated_geo_post: GeoPost,
}
#[hdk_extern]
pub fn update_geo_post(input: UpdateGeoPostInput) -> ExternResult<Record> {
    let updated_geo_post_hash = update_entry(
        input.previous_geo_post_hash.clone(),
        &input.updated_geo_post,
    )?;
    create_link(
        input.original_geo_post_hash.clone(),
        updated_geo_post_hash.clone(),
        LinkTypes::GeoPostUpdates,
        (),
    )?;
    let record = get(updated_geo_post_hash.clone(), GetOptions::default())?
        .ok_or(
            wasm_error!(
                WasmErrorInner::Guest(String::from("Could not find the newly updated GeoPost"))
            ),
        )?;
    Ok(record)
}
#[hdk_extern]
pub fn delete_geo_post(original_geo_post_hash: ActionHash) -> ExternResult<ActionHash> {
    delete_entry(original_geo_post_hash)
}
