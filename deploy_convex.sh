#!/bin/bash
export CONVEX_SELF_HOSTED_URL=https://db.aesthetxways.com
export CONVEX_SELF_HOSTED_ADMIN_KEY='convex-self-hosted|016df8caf9629ff9ae99e142eb1a4821486d624b5c91650bcdd69abca8d819f7d0f1705cbc'
npx convex dev --once --typecheck disable
