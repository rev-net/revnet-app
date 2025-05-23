import { NextRequest, NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

type ChainId = 1 | 10 | 8453 | 42161;

const JB_CHAINS: Record<ChainId, { name: string }> = {
  1: { name: "Ethereum" },
  10: { name: "Optimism" },
  8453: { name: "Base" },
  42161: { name: "Arbitrum" },
};

export async function GET(req: Request) {
  if (req.method === "OPTIONS") {
    return new NextResponse(null, { status: 200, headers: corsHeaders });
  }
  const baseUrl = process.env.NEXT_PUBLIC_BENDYSTRAW_URL?.replace(/\/$/, "") + "/graphql";
  const { searchParams } = new URL(req.url);
  const projectId = parseInt(searchParams.get("projectId") ?? "");

  const chainIdParam = searchParams.get("chainId");
  const chainIds: ChainId[] = chainIdParam
    ? [parseInt(chainIdParam) as ChainId]
    : (Object.keys(JB_CHAINS).map(Number) as ChainId[]);

  if (!baseUrl) {
    return NextResponse.json({ error: "Missing BendyStraw URL" }, { status: 500, headers: corsHeaders });
  }

  if (isNaN(projectId)) {
    return NextResponse.json({ error: "Missing or invalid projectId" }, { status: 400, headers: corsHeaders });
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
        return NextResponse.json({ error: "Failed to fetch suckerId" }, { status: 500, headers: corsHeaders });
      }

      const suckerIdText = await suckerIdRes.text();
      const suckerIdJson = JSON.parse(suckerIdText);
      const suckerGroupId = suckerIdJson.data?.project?.suckerGroupId;
      if (!suckerGroupId) {
        return NextResponse.json({ error: "Project not found on BendyStraw" }, { status: 404, headers: corsHeaders });
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
        return NextResponse.json({ error: "Failed to fetch nativeTokenSurplus" }, { status: 500, headers: corsHeaders });
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
      return NextResponse.json({ error: "Error fetching data" }, { status: 500, headers: corsHeaders });
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
    return NextResponse.json({ error: "Missing host header" }, { status: 500, headers: corsHeaders });
  }
  const publicBase = `https://${host}`;
  const publicUrl = `${publicBase}/api/data/shields?projectId=${projectId}${chainIds.length === 1 ? `&chainId=${chainIds[0]}` : ""}`;
  const badgeUrl = `https://img.shields.io/badge/dynamic/json?url=${encodeURIComponent(publicUrl)}&query=%24.message&label=${encodeURIComponent(projectName)}&cacheSeconds=3600`;

  const markdown = `[![revnet badge](${badgeUrl})](${publicBase}/base:${projectId})`;

  return NextResponse.json(
    {
      label: "Current value",
      message: `${usdTvl.toLocaleString("en-US", { maximumFractionDigits: 0 })} USD • ${totalBalance.toFixed(4)} ETH`,
      tvlUsd: usdTvl,
      tvlEth: totalBalance,
      color: totalBalance > 1 ? "green" : totalBalance > 0.1 ? "yellow" : "red",
      chains: results,
      badgeUrl,
      markdown,
    },
    { headers: corsHeaders }
  );
}