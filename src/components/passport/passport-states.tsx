import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

type PassportStateProps = {
  title: string;
  description: string;
};

function PassportStateFrame({ title, description }: PassportStateProps) {
  return (
    <main className="flex flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-16 sm:px-6">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
          VegPro · Digital Flower Passport
        </p>
        <h1 className="mt-4 font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          {description}
        </p>
        <div className="mt-8">
          <Link className={buttonVariants({ variant: "outline" })} href="/">
            Return home
          </Link>
        </div>
      </div>
    </main>
  );
}

export function PassportInvalidState() {
  return (
    <PassportStateFrame
      title="Invalid passport reference"
      description="This link does not match a valid VegPro public identifier format. Check the QR code or URL and try again."
    />
  );
}

export function PassportNotAvailableState() {
  return (
    <PassportStateFrame
      title="Passport not available"
      description="We could not show a public passport for this reference. The variety may not exist, may not be published, or may no longer be available."
    />
  );
}

export function PassportUnavailableState() {
  return (
    <PassportStateFrame
      title="Passport temporarily unavailable"
      description="Flower passport information could not be loaded right now. Please try again in a few moments."
    />
  );
}
