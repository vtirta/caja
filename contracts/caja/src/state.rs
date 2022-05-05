use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

use cosmwasm_std::{Addr, Timestamp, Uint128};
use cw_storage_plus::{Item, Map};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct State {
    pub owner: Addr,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct Transaction {
    pub code: String,
    pub amount: Uint128,
    pub expires: Timestamp,
    pub dispenser: Addr,
    pub redeemer: Option<Addr>,
}

pub const STATE: Item<State> = Item::new("state");

pub const ESCROWS: Map<&str, Transaction> = Map::new("escrows");

// Transactions MultiIndex Map
// pub struct TransactionIndexes<'a> {
//     pub code: MultiIndex<'a, (str, Vec<u8>), Transaction>,
//     // pub redeemer: MultiIndex<'a, (Option<Addr>, Vec<u8>), Transaction>,
// }
//
// impl<'a> IndexList<Transaction> for TransactionIndexes<'a> {
//     fn get_indexes(&'_ self) -> Box<dyn Iterator<Item = &'_ dyn Index<Transaction>> + '_> {
//         let v: Vec<&dyn Index<Transaction>> = vec![&self.code];
//         Box::new(v.into_iter())
//     }
// }
//
// pub fn transactions<'a>() -> IndexedMap<'a, (&'a str, &'a Addr), Transaction, TransactionIndexes<'a>> {
//     let indexes = TransactionIndexes {
//         code: MultiIndex::new(
//             |d: &Transaction, k: Vec<u8>| ((*d.code).as_str(), k),
//             "transactions2",
//             "transactions2__code",
//         ),
//     };
//     IndexedMap::new("transactions2", indexes)
// }
