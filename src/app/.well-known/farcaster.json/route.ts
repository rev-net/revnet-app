import { NextResponse } from "next/server";

// @ts-expect-error - TODO: fix this
import { externalBaseUrl, isProduction } from "@/app/constants";

const accountAssociation = isProduction
    ?  {
        "header": "eyJmaWQiOjIxMTc5MSwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDFkNDBBMTI5N0E1NjNGNmJhNzQ0ZmI5MzlBMmE2MDM1RjY5MDVGZTEifQ",
        "payload": "eyJkb21haW4iOiJhcHAucmV2bmV0LmV0aC5zdWNrcyJ9",
        "signature": "MHg2MjhlN2IxNGNlNjViYWYyODMyN2IzMDFjYzZmMjFmNDg2ZjllYzIzNWI4NDQ1MjE3Mzg4NzRjMjgzMmE2NGEzNmM3ZmRkNDI4OTFiMjkyMGIzZDMyY2FhNGY0YWJkOTAxMDhhMWNhNzg3YzNlMzhiYzg1ZGNhYzFmMzc1OGEyNzFj"
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
        "iconUrl": `${externalBaseUrl}/assets/img/small-bw-200x200.png`,
        "homeUrl": `${externalBaseUrl}`,
        "imageUrl": `${externalBaseUrl}/assets/img/discover_revenue_tokens.png`,
        "buttonTitle": "Discover Revenue Tokens",
        "splashImageUrl": `${externalBaseUrl}/assets/img/small-bw-200x200.png`,
        "splashBackgroundColor": "#ffffff",
      }
    };
    return NextResponse.json(manifest);
}
