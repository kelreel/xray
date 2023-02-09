import type {
    EnrichedTransaction,
    Source
} from "@helius-labs/helius-types";

import {
    ProtonTransaction,
    ProtonTransactionAction,
} from "../types";

export const parseSwap = (transaction: EnrichedTransaction): ProtonTransaction => {
    const type = "SWAP";
    const source = "SYSTEM_PROGRAM" as Source;

    if(transaction?.tokenTransfers === null) {
        return {
            type,
            source,
            primaryUser : "",
            timestamp   : 0,
            actions     : [],
        };
    }

    const { tokenTransfers } = transaction;
    const actions: ProtonTransactionAction[] = [];
    const primaryUser = tokenTransfers[0].fromUserAccount || "";
    
    const {
        timestamp,
    } = transaction;

    for(let i = 0; i < tokenTransfers.length; i++) {
        const [ tx ] = tokenTransfers;
        let sent;
        let received;

        if(tx.fromUserAccount === primaryUser) {
            sent = tx.mint;
        } else if(tx.toUserAccount === primaryUser) {
            received = tx.mint;
        }

        const from = tx.fromUserAccount || "";
        const to = tx.toUserAccount || "";
        const amount = tx.tokenAmount;

        if(sent) {
            actions.push({
                from,
                to,
                sent,
                amount,
            });
        } else {
            actions.push({
                from,
                to,
                received,
                amount,
            });
        }
    }
    
    return {
        type,
        primaryUser,
        timestamp,
        source,
        actions,
    };
};
