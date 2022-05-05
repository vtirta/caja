#[cfg(not(feature = "library"))]
use cosmwasm_std::entry_point;
use cosmwasm_std::{to_binary, Binary, Deps, DepsMut, Env, MessageInfo, Response, StdResult};
use cw2::set_contract_version;

use crate::error::ContractError;
use crate::msg::{ExecuteMsg, InstantiateMsg, MigrateMsg, QueryMsg, TransactionsResponse};
use crate::state::{State, STATE};

// version info for migration info
const CONTRACT_NAME: &str = "crates.io:counter";
const CONTRACT_VERSION: &str = env!("CARGO_PKG_VERSION");

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    _msg: InstantiateMsg,
) -> Result<Response, ContractError> {
    let state = State {
        owner: info.sender.clone(),
    };
    set_contract_version(deps.storage, CONTRACT_NAME, CONTRACT_VERSION)?;
    STATE.save(deps.storage, &state)?;

    Ok(Response::new()
        .add_attribute("method", "instantiate")
        .add_attribute("owner", info.sender))
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn migrate(_deps: DepsMut, _env: Env, _msg: MigrateMsg) -> StdResult<Response> {
    Ok(Response::default())
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn execute(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> Result<Response, ContractError> {
    match msg {
        ExecuteMsg::Dispense { code } => try_dispense(deps, code),
        ExecuteMsg::Redeem { code } => try_redeem(deps, info, code),
    }
}

pub fn try_dispense(deps: DepsMut, code: String) -> Result<Response, ContractError> {
    // STATE.update(deps.storage, |mut state| -> Result<_, ContractError> {
    //     Ok(state)
    // })?;

    Ok(Response::new().add_attribute("method", "dispense"))
}
pub fn try_redeem(deps: DepsMut, info: MessageInfo, code: String) -> Result<Response, ContractError> {
    // STATE.update(deps.storage, |mut state| -> Result<_, ContractError> {
    //     if info.sender != state.owner {
    //         return Err(ContractError::Unauthorized {});
    //     }
    //     state.count = count;
    //     Ok(state)
    // })?;
    Ok(Response::new().add_attribute("method", "redeem"))
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn query(deps: Deps, _env: Env, msg: QueryMsg) -> StdResult<Binary> {
    match msg {
        QueryMsg::GetTransactions {} => to_binary(&query_transactions(deps)?),
    }
}

fn query_transactions(deps: Deps) -> StdResult<TransactionsResponse> {
    // let state = STATE.load(deps.storage)?;
    Ok(TransactionsResponse { })
}

#[cfg(test)]
mod tests {
    use super::*;
    use cosmwasm_std::testing::{mock_dependencies, mock_env, mock_info};
    use cosmwasm_std::{coins, from_binary};

    #[test]
    fn proper_initialization() {
        let mut deps = mock_dependencies(&[]);

        let msg = InstantiateMsg { };
        let info = mock_info("creator", &coins(1000, "earth"));

        // we can just call .unwrap() to assert this was a success
        let res = instantiate(deps.as_mut(), mock_env(), info, msg).unwrap();
        assert_eq!(0, res.messages.len());
    }

    #[test]
    fn dispense() {
        let mut deps = mock_dependencies(&coins(2, "token"));

        let msg = InstantiateMsg { };
        let info = mock_info("creator", &coins(2, "token"));
        let _res = instantiate(deps.as_mut(), mock_env(), info, msg).unwrap();

        // anyone can dispense "cash"
        let info = mock_info("anyone", &coins(2, "token"));
        let msg = ExecuteMsg::Dispense { code: "foobar".to_string() };
        let _res = execute(deps.as_mut(), mock_env(), info, msg).unwrap();
    }

    #[test]
    fn redeem() {
        let mut deps = mock_dependencies(&coins(2, "token"));

        let msg = InstantiateMsg { };
        let info = mock_info("creator", &coins(2, "token"));
        let _res = instantiate(deps.as_mut(), mock_env(), info, msg).unwrap();

        // redeemer with valid code can redeem
        let redeemer_info = mock_info("anyone", &coins(2, "token"));
        let msg = ExecuteMsg::Redeem { code: "foobar".to_string() };
        let _res = execute(deps.as_mut(), mock_env(), redeemer_info, msg).unwrap();
    }
}
