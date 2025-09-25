import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="text-center">
        <div className="mb-12 inline-block">
          <div className="relative h-48 w-48 rotate-45 border-4 border-black border-dashed bg-gradient-to-br from-orange-400 to-orange-500 shadow-2xl transition-transform duration-300 hover:scale-105 sm:h-56 sm:w-56 md:h-64 md:w-64">
            <div className="-rotate-45 absolute inset-0 flex items-center justify-center">
              <span className="font-black text-5xl text-black drop-shadow-lg sm:text-6xl md:text-7xl">
                404
              </span>
            </div>
          </div>
        </div>

        <h1 className="mt-8 mb-8 font-black text-4xl text-foreground tracking-widest drop-shadow-sm md:text-5xl lg:text-6xl">
          PAGE NOT FOUND
        </h1>

        <p className="mx-auto mb-10 max-w-lg text-muted-foreground text-xl leading-relaxed md:text-2xl">
          The page you are looking for might have been removed had its name
          changed or is temporarily unavailable.
        </p>

        <Button
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-blue-700 px-10 py-4 font-bold text-lg text-white shadow-xl transition-all"
          asChild
        >
          <Link href="/">HOME PAGE</Link>
        </Button>
      </div>
    </div>
  );
}
