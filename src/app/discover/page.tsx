"use client";

 type RevnetProject = {
   projectId: string;
   handle: string;
   metadataUri: string;
   logoUri?: string;
   name?: string;
   description?: string;
   projectTagline?: string;
   tags?: string[];
   infoUri?: string;
 };
import { Button } from "@/components/ui/button";
import { request } from "graphql-request";
import { SUBGRAPH_URLS } from "../../graphql/constants";
import Image from "next/image";
import Link from "next/link";
import { sdk } from "@farcaster/frame-sdk";
import { useEffect, useState } from "react";
import MiniHeaderCard from "./MiniHeaderCard";

const RevLink = ({
  network,
  id,
  text,
}: {
  network: string;
  id: number;
  text: string;
}) => {
  return (
    <span>
      $
      <Link
        href={`/${network}:${id}`}
        className="underline hover:text-black/70"
      >
        {text}
      </Link>
    </span>
  );
};

export default function Page() {
  const [user, setUser] = useState<{ fid: number; pfp: string, userName: string } | null>(null);
  const [projects, setProjects] = useState<RevnetProject[]>([]);

  useEffect(() => {
    const fetchUser = async () => {
      await sdk.actions.ready();
      // TODO - check if context exist of not and if the user is already in the frame
      try {
        await sdk.actions.addFrame();
      } catch (error) {
        if (error){
          console.log("User rejected the mini app addition or domain manifest JSON is invalid");
          // Handle the rejection here
        }
      }

      const ctx = (await sdk.context);
      if (ctx?.user) {
        setUser({ fid: ctx.user.fid, pfp: ctx.user.pfpUrl || "", userName: ctx.user.username || "" });
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      const chainId = 1;
      const subgraphUrl = SUBGRAPH_URLS[chainId];
      if (!subgraphUrl) return;

      const query = `
        query Projects {
          projects(first: 50, orderBy: projectId, orderDirection: desc) {
            projectId
            handle
            metadataUri
          }
        }
      `;

      try {
        const data: { projects: RevnetProject[] } = await request(subgraphUrl, query);
        const projectsWithLogos = await Promise.all(
        (data.projects || []).map(async (p: RevnetProject) => {
            let logoUri: string | undefined;
            let name: string | undefined;
            let description: string | undefined;
            let projectTagline: string | undefined;
            let tags: string[] | undefined;
            let infoUri: string | undefined;
            if (p.metadataUri?.startsWith("ipfs://")) {
              const ipfsHash = p.metadataUri.replace("ipfs://", "");
              try {
                const metadataRes = await fetch(`https://ipfs.io/ipfs/${ipfsHash}`);
                const metadata = await metadataRes.json();
                name = metadata.name;
                const rawDesc = metadata.description || "";
                description = rawDesc.replace(/<[^>]*>?/gm, ""); // Strip HTML tags
                projectTagline = metadata.projectTagline;
                tags = metadata.tags;
                infoUri = metadata.infoUri;
                if (metadata.logoUri?.startsWith("ipfs://")) {
                  logoUri = `https://${process.env.NEXT_PUBLIC_INFURA_IPFS_HOSTNAME}/ipfs/${metadata.logoUri.replace("ipfs://", "")}`;
                } else {
                  logoUri = metadata.logoUri;
                }
              } catch (err) {
                console.error("Failed to fetch metadata from IPFS for project", p.projectId, err);
              }
            }
            return { ...p, logoUri, name, description, projectTagline, tags, infoUri };
          })
        );

        const withDescriptions = projectsWithLogos.filter(
          (p) => p.projectTagline || p.description
        );
        setProjects(withDescriptions.sort((a, b) => Number(b.projectId) - Number(a.projectId)));
      } catch (err) {
        console.error("Failed to fetch projects:", err);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div className="container mt-40 pr-[1.5rem] pl-[1.5rem] sm:pr-[2rem] sm:pl-[2rem] sm:px-8">
      {user?.pfp && (
        <div className="flex items-center mb-4">
          <span className="text-lg">Hello {user.userName}!</span>
        </div>
      )}
      <div className="flex flex-col items-left justify-left">
        <Image
          src="/assets/img/revnet-full-bw.svg"
          width={840}
          height={240}
          alt="Revnet logo"
        />
        <span className="sr-only">Revnet</span>
        <div className="text-xl md:text-2xl mt-8 font-medium text-left">
          Tokenize revenues and fundraises. 100% autonomous.
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex gap-4 mt-8">
            <Link href="/">
              <Button className="md:h-12 h-16 text-xl md:text-xl px-4 flex gap-2 bg-teal-500 hover:bg-teal-600">
                Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <div className="border border-zinc-100 mt-10"></div>

      <div className="mt-6">
        <h2 className="text-2xl font-semibold mb-4">Funding opportunities</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {projects.map((p) => (
            <Link
              key={p.projectId}
              href={`/eth:${p.projectId}`}
              className="border border-zinc-200 rounded-lg p-4 shadow hover:shadow-md transition block"
            >
              <MiniHeaderCard
                logoUri={p.logoUri}
                name={p.name}
                infoUri={p.infoUri}
                projectId={p.projectId}
                handle={p.handle}
              />
              <p className="text-zinc-600 text-sm line-clamp-2">
                {p.projectTagline || p.description || "No description available."}
              </p>
              {Array.isArray(p.tags) && p.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {p.tags?.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-xs bg-zinc-100 px-2 py-0.5 rounded-full text-zinc-600">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
