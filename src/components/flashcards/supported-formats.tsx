import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";

export function SupportedFormats() {
  const t = useTranslations("Flashcards");

  return (
    <Card className="mt-6 border-none">
      <CardHeader>
        <CardTitle className="text-lg">
          {t("create.supportedFormats.title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">PDF</Badge>
            <Badge variant="secondary">DOC(X)</Badge>
            <Badge variant="secondary">PPT(X)</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">XLS(X)</Badge>
            <Badge variant="secondary">TXT</Badge>
            <Badge variant="secondary">MD</Badge>
            <Badge variant="secondary">JSON</Badge>
          </div>
          <p className="mt-2 text-muted-foreground text-xs">
            {t("create.supportedFormats.limit")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
