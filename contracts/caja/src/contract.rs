#[cfg(not(feature = "library"))]
use cosmwasm_std::entry_point;
use cosmwasm_std::{
    to_binary, BankMsg, Binary, Coin, CosmosMsg, Deps, DepsMut, Env, MessageInfo, Response,
    StdResult, Timestamp, Uint128,
};
use cw2::set_contract_version;

use crate::error::ContractError;
use crate::msg::{ExecuteMsg, InstantiateMsg, MigrateMsg, QueryMsg, TransactionsResponse};
use crate::state::{State, Transaction, ESCROWS, STATE};

// version info for migration info
const CONTRACT_NAME: &str = "crates.io:counter";
const CONTRACT_VERSION: &str = env!("CARGO_PKG_VERSION");

// hardcoded to $0.25 (UST) for now
const TRANSACTION_FEE: u128 = 250_000;

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
        ExecuteMsg::Dispense { code } => try_dispense(deps, info, code),
        ExecuteMsg::Redeem { code } => try_redeem(deps, info, code),
    }
}

pub fn try_dispense(
    deps: DepsMut,
    info: MessageInfo,
    code: String,
) -> Result<Response, ContractError> {
    if code.chars().count() < 8 {
        return Err(ContractError::InvalidCode {});
    }

    // Extract coin amount
    let coin_amount: Uint128 = info
        .funds
        .iter()
        .find(|c| c.denom == "uusd")
        .map(|c| Uint128::from(c.amount))
        .unwrap_or_else(Uint128::zero);

    let amount_to_escrow = coin_amount - Uint128::from(TRANSACTION_FEE);

    if amount_to_escrow <= Uint128::zero() {
        return Err(ContractError::InvalidAmount {});
    }

    // By default escrow expires in 3 days (3 days * 24 hrs * 60 mins * 60 secs) = 259200 secs
    let mut expires: Timestamp = Timestamp::default();
    expires = expires.plus_seconds(259_200);

    let transaction = Transaction {
        code: code.clone(),
        amount: amount_to_escrow,
        dispenser: info.sender.clone(),
        expires,
        redeemer: None,
    };

    ESCROWS.save(deps.storage, code.as_str(), &transaction)?;

    // transactions().save(deps.storage, (&info.sender, &code), &transaction)?;

    Ok(Response::new().add_attribute("method", "dispense"))
}

pub fn try_redeem(
    deps: DepsMut,
    info: MessageInfo,
    code: String,
) -> Result<Response, ContractError> {
    if code.chars().count() < 8 {
        return Err(ContractError::InvalidCode {});
    }

    let escrow = ESCROWS.load(deps.storage, &code)?;

    ESCROWS.remove(deps.storage, &code);

    Ok(Response::new()
        .add_messages(vec![CosmosMsg::Bank(BankMsg::Send {
            to_address: info.sender.to_string(),
            amount: vec![Coin {
                denom: "uusd".to_string(),
                amount: escrow.amount,
            }],
        })])
        .add_attribute("method", "redeem")
        .add_attribute("code", code)
        .add_attribute("amount", escrow.amount.to_string()))
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn query(deps: Deps, _env: Env, msg: QueryMsg) -> StdResult<Binary> {
    match msg {
        QueryMsg::GetTransactions {} => to_binary(&query_transactions(deps)?),
    }
}

fn query_transactions(_deps: Deps) -> StdResult<TransactionsResponse> {
    Ok(TransactionsResponse {})
}

#[cfg(test)]
mod tests {
    use super::*;
    use cosmwasm_std::coins;
    use cosmwasm_std::testing::{mock_dependencies, mock_env, mock_info};

    #[test]
    fn proper_initialization() {
        let mut deps = mock_dependencies(&[]);

        let msg = InstantiateMsg {};
        let info = mock_info("creator", &coins(1000, "earth"));

        // we can just call .unwrap() to assert this was a success
        let res = instantiate(deps.as_mut(), mock_env(), info, msg).unwrap();
        assert_eq!(0, res.messages.len());
    }

    #[test]
    fn dispense() {
        let mut deps = mock_dependencies(&coins(2, "token"));

        let msg = InstantiateMsg {};
        let info = mock_info("creator", &coins(2, "token"));
        let _res = instantiate(deps.as_mut(), mock_env(), info, msg).unwrap();

        // anyone can dispense "cash"
        let info = mock_info("anyone", &coins(1_000_000, "uusd"));
        let msg = ExecuteMsg::Dispense {
            code: "goodcode".to_string(),
        };
        let _res = execute(deps.as_mut(), mock_env(), info, msg).unwrap();

        // must send uusd and covers transaction fee of $0.25 UST
        let info = mock_info("anyone", &coins(250000, "uusd"));
        let msg = ExecuteMsg::Dispense {
            code: "goodcode".to_string(),
        };
        let res = execute(deps.as_mut(), mock_env(), info, msg);
        match res {
            Err(ContractError::InvalidAmount {}) => {}
            _ => panic!("Must return invalid amount error"),
        }

        // code must be at least 8 characters
        let info = mock_info("anyone", &coins(1_000_000, "uusd"));
        let msg = ExecuteMsg::Dispense {
            code: "foobar".to_string(),
        };
        let res = execute(deps.as_mut(), mock_env(), info, msg);
        match res {
            Err(ContractError::InvalidCode {}) => {}
            _ => panic!("Must return invalid code error"),
        }
    }

    #[test]
    fn redeem() {
        let mut deps = mock_dependencies(&coins(2, "uusd"));

        let msg = InstantiateMsg {};
        let info = mock_info("creator", &coins(2, "uusd"));
        let _res = instantiate(deps.as_mut(), mock_env(), info, msg).unwrap();

        // dispense first
        let amount = 10_000_000;
        let fee = 250_000;
        let total_amount = amount + fee; // amount + fee
        let info = mock_info("dispenser", &coins(total_amount, "uusd"));
        let msg = ExecuteMsg::Dispense {
            code: "goodcode".to_string(),
        };
        let _res = execute(deps.as_mut(), mock_env(), info, msg).unwrap();

        // redeemer with valid code can redeem
        let redeemer_info = mock_info("redeemer", &coins(2, "token"));
        let msg = ExecuteMsg::Redeem {
            code: "goodcode".to_string(),
        };
        let _res = execute(deps.as_mut(), mock_env(), redeemer_info, msg).unwrap();

        // TODO: Need to check the amount of UST (uusd) in the redeemer wallet
        // let redeemer_amount: Uint128 = redeemer_info
        //     .funds
        //     .iter()
        //     .find(|c| c.denom == "uusd")
        //     .map(|c| Uint128::from(c.amount))
        //     .unwrap_or_else(Uint128::zero);
        //
        // assert_eq!(&redeemer_amount, Uint128::from(amount));

        // invalid code
        let redeemer_info = mock_info("anyone", &coins(2, "uusd"));
        let msg = ExecuteMsg::Redeem {
            code: "notgoodvalidcode".to_string(),
        };
        let res = execute(deps.as_mut(), mock_env(), redeemer_info, msg);
        match res {
            // TODO: Need to check for the proper error struct here
            Err(ContractError::Std { .. }) => {}
            _ => panic!("Must return invalid code error"),
        }

        // code must be at least 8 characters
        let redeemer_info = mock_info("anyone", &coins(2, "token"));
        let msg = ExecuteMsg::Redeem {
            code: "foobar".to_string(),
        };
        let res = execute(deps.as_mut(), mock_env(), redeemer_info, msg);
        match res {
            Err(ContractError::InvalidCode {}) => {}
            _ => panic!("Must return invalid code error"),
        }
    }
}
