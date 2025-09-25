import { BookOpen } from "lucide-react";
import { useTranslations } from "next-intl";

const Footer = () => {
  const t = useTranslations("Footer");
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl">EDUMENTUM</span>
            </div>
            <p className="text-muted-foreground">{t("description")}</p>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">{t("product.title")}</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a href=" " className="hover:text-primary">
                  {t("product.features")}
                </a>
              </li>
              <li>
                <a href=" " className="hover:text-primary">
                  {t("product.courses")}
                </a>
              </li>
              <li>
                <a href=" " className="hover:text-primary">
                  {t("product.community")}
                </a>
              </li>
              <li>
                <a href=" " className="hover:text-primary">
                  {t("product.reports")}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">{t("support.title")}</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a href=" " className="hover:text-primary">
                  {t("support.helpCenter")}
                </a>
              </li>
              <li>
                <a href=" " className="hover:text-primary">
                  {t("support.contact")}
                </a>
              </li>
              <li>
                <a href=" " className="hover:text-primary">
                  {t("support.faq")}
                </a>
              </li>
              <li>
                <a href=" " className="hover:text-primary">
                  {t("support.documentation")}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">{t("company.title")}</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a href=" " className="hover:text-primary">
                  {t("company.aboutUs")}
                </a>
              </li>
              <li>
                <a href=" " className="hover:text-primary">
                  {t("company.recruitment")}
                </a>
              </li>
              <li>
                <a href=" " className="hover:text-primary">
                  {t("company.privacy")}
                </a>
              </li>
              <li>
                <a href=" " className="hover:text-primary">
                  {t("company.terms")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-muted-foreground">
          <p>&copy; {t("copyright")}</p>
        </div>
      </div>
    </footer>
  );
};

export { Footer };
