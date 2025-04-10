import { NextResponse } from "next/server";

// @ts-expect-error - TODO: fix this
import { externalBaseUrl, isProduction } from "@/app/constants";

const accountAssociation = isProduction
    ?  {
        "header": "eyJmaWQiOjQxNjMsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHg4NWY5ODg2YzQ4QjE3YjUzNGYzQTY0RjI0NjBkRDlDMDRBQjlhMjM2In0",
        "payload": "eyJkb21haW4iOiJhcHAucmV2bmV0LmV0aC5zdWNrcyJ9",
        "signature": "MHg2NGYzMmRlNTIwZTVkYzAyMTA1YTc5MGE3ZTZiMzY5ZDFiYWJiZGM5M2U4NjIwMTk4NzU1ZjYyMzNiMjczODJiNWVjOTU0NmZhYzE0ZjE0NWQzZDFhMTc3NmQ2YjUyMDA0NDhkMGRhMDY4YWMxMjBmODhiNTUwZTUwYjc4ZmYzZjFi"
    }
    : {
        "header": "eyJmaWQiOjQxNjMsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHg4NWY5ODg2YzQ4QjE3YjUzNGYzQTY0RjI0NjBkRDlDMDRBQjlhMjM2In0",
        "payload": "eyJkb21haW4iOiIxNDc1ODVlMWY3MmEubmdyb2suYXBwIn0",
        "signature": "MHhlMTNmMTA2NmUyNDgzMjA5MGNlZTEzMjQ1OTI1MDVmNjBkZjlkMGE3NTIzM2EzNWJkM2E2MTAzZjhkMDNkMDY3MzRiMjM4OTkwZTNkMjg0NTI5NzM1MGI5MmUyMWI4Mzk1ODRlOWQ4ODZkZTU0NzI1YmY0YzgyYmJlMGFjNWE5MDFi"
    };

export async function GET() {
    const manifest = {
      accountAssociation,
      "frame": {
        "name": "Revnet",
        "version": "1",
        "iconUrl": `${externalBaseUrl}/assets/img/small-bw.svg`,
        "homeUrl": `${externalBaseUrl}`,
        "imageUrl": `${externalBaseUrl}/assets/img/discover_revenue_tokens.png`,
        "buttonTitle": "Discover Revenue Tokens",
        "splashImageUrl": `${externalBaseUrl}/assets/img/small-bw.svg`,
        "splashBackgroundColor": "#ffffff",
      }
    };
    return NextResponse.json(manifest);
}
