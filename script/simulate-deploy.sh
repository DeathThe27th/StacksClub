#!/usr/bin/env bash
set -euo pipefail

if ! command -v forge >/dev/null 2>&1; then
  echo "Foundry is not installed; install it before simulating deployment." >&2
  exit 1
fi

: "${BSC_RPC_URL:?Set BSC_RPC_URL for a fork simulation}"
: "${DEPLOYER_ADDRESS:?Set a non-secret DEPLOYER_ADDRESS; never pass a private key to this script}"

forge_args=(script script/Deploy.s.sol:Deploy --rpc-url "$BSC_RPC_URL" -vvvv)
if [[ -n "${FORK_BLOCK_NUMBER:-}" ]]; then
  forge_args+=(--fork-block-number "$FORK_BLOCK_NUMBER")
fi
forge script "${forge_args[@]}"
echo "Simulation only. No broadcast flag was used. Review addresses and permissions before any real deployment."
