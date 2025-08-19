import { Button } from "@/components/ui/button";
import { Card } from "../ui";

export default function ExplorePaging() {
  return (
    <Card className="flex items-center justify-center gap-2 border-none py-6">
      <Button variant="outline" size="sm">
        Previous
      </Button>
      <Button size="sm" className="bg-blue-500 text-white">
        1
      </Button>
      <Button variant="outline" size="sm">
        2
      </Button>
      <Button variant="outline" size="sm">
        3
      </Button>
      <span className="px-2">...</span>
      <Button variant="outline" size="sm">
        37
      </Button>
      <Button variant="outline" size="sm">
        Next
      </Button>
    </Card>
  );
}
