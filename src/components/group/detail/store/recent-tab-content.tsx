import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Eye } from "lucide-react";
import type { Document } from "./types";
import { getFileIcon } from "./utils";

interface RecentTabContentProps {
  documents: Document[];
}

export function RecentTabContent({ documents }: RecentTabContentProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Recent Documents</h3>
        <Badge variant="secondary">{documents.length} documents</Badge>
      </div>
      <div className="space-y-3">
        {documents.slice(0, 10).map((doc) => (
          <div
            key={doc.id}
            className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            {getFileIcon(doc.type)}
            <div className="min-w-0 flex-1">
              <h4 className="truncate font-medium">{doc.name}</h4>
              <p className="text-gray-500 text-sm dark:text-gray-400">
                Upload by {doc.uploadedBy} • {doc.uploadedAt}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {doc.size}
              </Badge>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
