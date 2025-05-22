import { NextRequest, NextResponse } from "next/server";

type ChainId = 1 | 10 | 8453 | 42161;

const JB_CHAINS: Record<ChainId, { name: string }> = {
  1: { name: "Ethereum" },
  10: { name: "Optimism" },
  8453: { name: "Base" },
  42161: { name: "Arbitrum" },
};

export async function GET(req: Request) {
  const baseUrl = process.env.NEXT_PUBLIC_BENDYSTRAW_URL?.replace(/\/$/, "") + "/graphql";
  const { searchParams } = new URL(req.url);
  const projectId = parseInt(searchParams.get("projectId") ?? "");

  const chainIdParam = searchParams.get("chainId");
  const chainIds: ChainId[] = chainIdParam
    ? [parseInt(chainIdParam) as ChainId]
    : (Object.keys(JB_CHAINS).map(Number) as ChainId[]);

  if (!baseUrl) {
    return NextResponse.json({ error: "Missing BendyStraw URL" }, { status: 500 });
  }

  if (isNaN(projectId)) {
    return NextResponse.json({ error: "Missing or invalid projectId" }, { status: 400 });
  }

  let totalBalance = 0;
  const results = [];
  let projectName = "Revnet"; // default fallback

  for (const chainId of chainIds) {
    const suckerIdQuery = `
      query {
        project(chainId: ${chainId}, projectId: ${projectId}) {
          id
          suckerGroupId
        }
      }
    `;

    try {
      const suckerIdRes = await fetch(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: suckerIdQuery }),
      });

      if (!suckerIdRes.ok) {
        return NextResponse.json({ error: "Failed to fetch suckerId" }, { status: 500 });
      }

      const suckerIdText = await suckerIdRes.text();
      const suckerIdJson = JSON.parse(suckerIdText);
      const suckerGroupId = suckerIdJson.data?.project?.suckerGroupId;
      if (!suckerGroupId) {
        return NextResponse.json({ error: "Project not found on BendyStraw" }, { status: 404 });
      }

      const surplusQuery = `
      query GetSuckerGroup($id: String!) {
        suckerGroup(id: $id) {
          balance
          volume
          volumeUsd
          projects {
            items {
              balance
              chainId
              isRevnet
              id
              name
              volumeUsd
              volume
              participants {
                totalCount
                items {
                  address
                  chainId
                  projectId
                  lastPaidTimestamp
                  balance
                }
              }
              metadata 
            }
          }
        }
      }
    `;

      const surplusRes = await fetch(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: surplusQuery,
          variables: { id: suckerGroupId },
        }),
      });

      if (!surplusRes.ok) {
        return NextResponse.json({ error: "Failed to fetch nativeTokenSurplus" }, { status: 500 });
      }

      const surplusJson = await surplusRes.json();
      const items = surplusJson.data.suckerGroup?.projects?.items ?? [];

      projectName = surplusJson.data.suckerGroup?.projects?.items?.[0]?.name ?? projectName;
      for (const item of items) {
        const itemBalance = parseFloat(item.balance ?? "0") / 1e18;
        totalBalance += itemBalance;

        results.push({
          chainId: item.chainId,
          balance: itemBalance,
          supporters: item.participants?.totalCount ?? 0,
          name: JB_CHAINS[item.chainId as ChainId]?.name ?? "Unknown",
          metadata: item.metadata,
          participants: item.participants?.items ?? [],
        });
      }
    } catch (err) {
      return NextResponse.json({ error: "Error fetching data" }, { status: 500 });
    }
  }

  // Fetch ETH price
  let ethPrice = 0;
  try {
    const priceRes = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd");
    const priceJson = await priceRes.json();
    ethPrice = priceJson.ethereum.usd;
  } catch {}

  const usdTvl = totalBalance * ethPrice;

  const host = req.headers.get("host");
  if (!host) {
    return NextResponse.json({ error: "Missing host header" }, { status: 500 });
  }
  const publicBase = `https://${host}`;
  const publicUrl = `${publicBase}/api/data/shields?projectId=${projectId}${chainIds.length === 1 ? `&chainId=${chainIds[0]}` : ""}`;
  const badgeUrl = `https://img.shields.io/badge/dynamic/json?url=${encodeURIComponent(publicUrl)}&query=%24.message&label=${encodeURIComponent(projectName)}&cacheSeconds=3600`;

  const markdown = `[![revnet badge](${badgeUrl})](${publicBase}/base:${projectId})`;

  return NextResponse.json({
    label: "Current value",
    message: `${usdTvl.toLocaleString("en-US", { maximumFractionDigits: 0 })} USD • ${totalBalance.toFixed(4)} ETH`,
    tvlUsd: usdTvl,
    tvlEth: totalBalance,
    color: totalBalance > 1 ? "green" : totalBalance > 0.1 ? "yellow" : "red",
    chains: results,
    badgeUrl,
    markdown,
  });
}