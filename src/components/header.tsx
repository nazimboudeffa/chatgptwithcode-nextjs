import { fontHeading } from "@/lib/fonts"

type PageProps = {
    heading: string
    subheading: string | React.ReactNode
}

export function Header({ heading, subheading }: PageProps) {
    return (
        <div className="flex max-w-[980px] flex-col items-center gap-2 mb-5">
            <h1
                className={`text-3xl font-extrabold leading-tight tracking-tighter sm:text-3xl md:text-5xl lg:text-6xl ${fontHeading.variable}`}
            >
                {heading}
            </h1>
            <p className="max-w-[700px] text-lg text-muted-foreground sm:text-xl">
                {subheading}
            </p>
        </div>
    )
}