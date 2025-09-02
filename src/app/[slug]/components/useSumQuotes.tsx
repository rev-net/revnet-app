import { JBChainId, useTokenCashOutQuoteEth } from "juice-sdk-react";
import { useCallback, useEffect, useMemo, useState } from "react";

export interface IndividualBalanceEntry {
  balance: { value: bigint };
  chainId: JBChainId;
  projectId: bigint;
}

// Interface for the state of each individual quote
interface IndividualQuoteState {
  quote: bigint | undefined;
  isLoading: boolean;
}

// Props for our internal helper component
interface SingleBalanceQuoteFetcherProps {
  balanceItem: IndividualBalanceEntry;
  itemKey: string;
  onQuoteStateUpdate: (key: string, state: IndividualQuoteState) => void;
}

// This component will only be mounted if useSumQuotes determines a fetch is needed for this item.
const SingleBalanceQuoteFetcher: React.FC<SingleBalanceQuoteFetcherProps> = ({
  balanceItem,
  itemKey,
  onQuoteStateUpdate,
}) => {
  const { data: quote, isLoading } = useTokenCashOutQuoteEth(balanceItem.balance.value, {
    chainId: balanceItem.chainId,
  });

  // Report state changes back to the parent hook
  useEffect(() => {
    onQuoteStateUpdate(itemKey, { quote, isLoading });
  }, [itemKey, quote, isLoading, onQuoteStateUpdate]);

  return null;
};

// Custom Hook: useSumQuotes
export function useSumQuotes(balances: IndividualBalanceEntry[] | undefined) {
  // Stores the quote state (data + loading) for each balance item
  const [individualQuoteStates, setIndividualQuoteStates] = useState<
    Map<string, IndividualQuoteState>
  >(new Map());
  // Overall loading state for the sum
  const [isSumLoading, setIsSumLoading] = useState(false);

  // Callback to update the map of individual quote states.
  // Memoized for stability when passed to SingleBalanceQuoteFetcher.
  const stableOnQuoteStateUpdate = useCallback(
    (key: string, state: IndividualQuoteState) => {
      setIndividualQuoteStates((prevMap) => {
        const existingState = prevMap.get(key);
        // Avoid unnecessary state updates if the reported state is identical
        if (
          existingState &&
          existingState.isLoading === state.isLoading &&
          existingState.quote === state.quote
        ) {
          return prevMap;
        }
        const newMap = new Map(prevMap);
        newMap.set(key, state);
        return newMap;
      });
    },
    [], // No dependencies, so this callback is stable
  );

  // Effect to reconcile individualQuoteStates with the current `balances` list.
  useEffect(() => {
    if (balances && balances.length > 0) {
      const newBalanceKeys = new Set(
        balances.map((b) => `${b.chainId.toString()}-${b.projectId.toString()}`),
      );

      setIndividualQuoteStates((prevStates) => {
        const nextStates = new Map<string, IndividualQuoteState>();
        let changed = false;

        // Copy over existing states for keys present in new balances
        for (const key of newBalanceKeys) {
          if (prevStates.has(key)) {
            nextStates.set(key, prevStates.get(key)!);
          } else {
            changed = true; // Indicates a new item will be fetched
          }
        }

        // Check if any keys were removed
        if (prevStates.size !== nextStates.size && !changed) {
          for (const oldKey of prevStates.keys()) {
            if (!newBalanceKeys.has(oldKey)) {
              changed = true;
              break;
            }
          }
        }

        if (prevStates.size === 0 && balances.length > 0) {
          changed = true;
        }

        return changed ? nextStates : prevStates; // If no structural changes, keep old map.
      });
      setIsSumLoading(true); // Assume loading; will be refined by totalCashQuoteSum effect
    } else {
      // No balances, clear all states and stop loading.
      setIndividualQuoteStates(new Map());
      setIsSumLoading(false);
    }
  }, [balances]); // Only re-run if the `balances` array reference changes.

  // Memoize the fetcher elements.
  // Only create fetchers for balances that don't yet have a finalized quote.
  const fetcherElements = useMemo(() => {
    if (!balances || balances.length > 0 === false) {
      // Ensure balances is not empty array
      return null;
    }

    // Filter balances: only create a fetcher if we don't have a "good" quote.
    // "Good" quote = exists in map, not loading, and quote is defined.
    const balancesToFetch = balances.filter((bal) => {
      const itemKey = `${bal.chainId.toString()}-${bal.projectId.toString()}`;
      const currentState = individualQuoteStates.get(itemKey);
      // Fetch if:
      // 1. No state exists for this item yet OR
      // 2. State exists but it's currently loading OR
      // 3. State exists, not loading, but quote is undefined (e.g., an error occurred, or it's 0 and we want to re-check)
      const needsFetching =
        !currentState || currentState.isLoading || currentState.quote === undefined;
      return needsFetching;
    });

    if (
      balancesToFetch.length === 0 &&
      balances.length > 0 &&
      individualQuoteStates.size >= balances.length
    ) {
      // All balances have some state, and none need fetching according to filter.
      // This might mean all quotes are loaded.
      return null;
    }

    return balancesToFetch.map((bal) => {
      const itemKey = `${bal.chainId.toString()}-${bal.projectId.toString()}`;
      return (
        <SingleBalanceQuoteFetcher
          key={itemKey}
          balanceItem={bal}
          itemKey={itemKey}
          onQuoteStateUpdate={stableOnQuoteStateUpdate}
        />
      );
    });
  }, [balances, individualQuoteStates, stableOnQuoteStateUpdate]);

  // Calculate the total sum from collected individual quotes
  const totalCashQuoteSum = useMemo(() => {
    if (!balances || balances.length === 0) {
      return 0n; // If no balances, sum is 0.
    }

    let calculatedSum = 0n;
    let allItemsFinalized = true;

    for (const bal of balances) {
      const itemKey = `${bal.chainId.toString()}-${bal.projectId.toString()}`;
      const state = individualQuoteStates.get(itemKey);

      if (!state) {
        allItemsFinalized = false; // This balance's state hasn't been reported yet
        break;
      }

      if (state.isLoading) {
        allItemsFinalized = false;
        break;
      }

      // If not loading, add its quote
      calculatedSum += state.quote || 0n;
    }

    if (allItemsFinalized) {
      return calculatedSum; // All items have a final state, return the sum
    } else {
      return undefined; // Indicates that the sum is not yet complete
    }
  }, [balances, individualQuoteStates]); // Re-calculate sum if balances or their states change

  // Update overall loading state for the sum
  useEffect(() => {
    if (balances && balances.length > 0) {
      // If totalCashQuoteSum is undefined, it means we are still waiting for some items.
      const stillLoading = totalCashQuoteSum === undefined;
      setIsSumLoading(stillLoading);
    } else {
      // No balances, so not loading.
      setIsSumLoading(false);
    }
  }, [balances, totalCashQuoteSum]); // Update loading state based on balances and the calculated sum

  return {
    totalCashQuoteSum,
    isLoadingSum: isSumLoading,
    fetcherElements,
  };
}
