use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

use cosmwasm_std::{Addr, Timestamp, Uint128};
use cw_storage_plus::Item;

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct State {
    pub owner: Addr,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct Transaction {
    pub code: String,
    pub amount: Uint128,
    pub expire_on: Timestamp,
    pub dispenser: Addr,
    pub redeemer: Option<Addr>,
}

pub const STATE: Item<State> = Item::new("state");
