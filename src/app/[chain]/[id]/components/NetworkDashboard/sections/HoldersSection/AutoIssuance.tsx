import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

export function AutoIssuance() {
  return (
    <div className="max-h-96 overflow-auto bg-zinc-50 rounded-md border-zinc-200 border mb-4">
      <div className="flex flex-col p-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Stage</TableHead>
              <TableHead className="w-auto md:w-1/2">Account</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Distribute</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>
                https://sepolia.etherscan.io/address/0x25bC5D5A708c2E426eF3a5196cc18dE6b2d5A3d1#writeContract#F2
              </TableCell>
              <TableCell>
                <div className="flex flex-col sm:flex-row text-sm">
                </div>
              </TableCell>
              <TableCell>
                hi
              </TableCell>
              <TableCell>
                <Button>
                  Distribute
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
