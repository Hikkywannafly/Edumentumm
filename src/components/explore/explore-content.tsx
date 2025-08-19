import ThinLayout from "../layout/thin-layout";
import { Card } from "../ui";
import ExploreCard from "./explore-card";
import ExploreFilter from "./explore-filter";
import ExplorePaging from "./explore-paging";
import ExploreTitle from "./explore-title";

export default function ExploreContent() {
  const mockData = [
    { title: "Debt Instruments and Valuation Quiz", questions: 10, daysAgo: 9 },
    {
      title: "Trắc nghiệm Triết học Mác-Lênin (Chương 1)",
      questions: 19,
      daysAgo: 11,
    },
    {
      title: "Trắc nghiệm Triết học Mác-Lênin cơ bản",
      questions: 5,
      daysAgo: 11,
    },
    { title: "Project Management Fundamentals", questions: 19, daysAgo: 17 },
    { title: "Câu hỏi về Triết học Mác", questions: 10, daysAgo: 18 },
    { title: "Triết học Mác - Lênin", questions: 9, daysAgo: 20 },
  ];

  return (
    <ThinLayout>
      <ExploreTitle />
      <ExploreFilter />
      <ExplorePaging />
      <Card className="grid gap-4 border-none py-6 md:grid-cols-3">
        {mockData.map((item, idx) => (
          <ExploreCard key={idx} {...item} />
        ))}
      </Card>
    </ThinLayout>
  );
}
