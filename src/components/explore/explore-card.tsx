import { Card, CardContent } from "@/components/ui/card";

type ExploreCardProps = {
  title: string;
  questions: number;
  daysAgo: number;
};

export default function ExploreCard({
  title,
  questions,
  daysAgo,
}: ExploreCardProps) {
  return (
    <Card className="transition hover:shadow-md">
      <CardContent className="p-4">
        <p className="text-muted-foreground text-sm">{daysAgo} days ago</p>
        <h3 className="mt-1 font-semibold">{title}</h3>
        <p className="mt-1 text-muted-foreground text-sm">
          {questions} questions
        </p>
      </CardContent>
    </Card>
  );
}
