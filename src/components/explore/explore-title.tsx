import { useTranslations } from "next-intl";
import { Card } from "../ui";

export default function ExploreTitle() {
  const t = useTranslations("Explore");
  return (
    <Card className="border-none py-6">
      <h1 className="font-bold text-3xl">{t("title")}</h1>
      <p className="mt-2 text-muted-foreground">{t("description")}</p>
    </Card>
  );
}
