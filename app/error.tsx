"use client";
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return <section className="container-shell grid min-h-[60vh] place-items-center text-center"><div><p className="eyebrow">Something went wrong</p><h1 className="mt-4 text-4xl font-bold">We could not load this page.</h1><button onClick={reset} className="btn-primary mt-7">Try again</button></div></section>;
}
