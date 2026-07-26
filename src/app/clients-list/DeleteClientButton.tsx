'use client';

import { Trash2 } from "lucide-react";
import { deleteClient } from "../actions/clients";

export function DeleteClientButton({ clientId }: { clientId: string }) {
  return (
    <form action={async () => {
      await deleteClient(clientId);
    }} className="inline">
      <button type="submit" onClick={(e: React.MouseEvent) => e.stopPropagation()} className="text-red-600 hover:text-red-800">
        <Trash2 className="w-4 h-4" />
      </button>
    </form>
  );
}
