/** Placeholder shown while a dynamic page's URL params resolve (instant navigation shell). */
export function PageSkeleton() {
  return (
    <div aria-busy="true" aria-label="Chargement" className="bg-white pt-10 pb-24 lg:pt-14">
      <div className="container-site animate-pulse">
        <div className="h-4 w-48 rounded bg-paper" />
        <div className="mt-14 h-3 w-32 rounded bg-paper" />
        <div className="mt-6 h-12 w-full max-w-2xl rounded bg-paper" />
        <div className="mt-4 h-5 w-full max-w-xl rounded bg-paper" />
        <div className="mt-14 aspect-[21/8] w-full rounded-xl bg-paper" />
      </div>
    </div>
  );
}
