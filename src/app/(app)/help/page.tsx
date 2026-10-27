import { AB2711, CRISIS_RESOURCES, QUIT_RESOURCES, SCHOOL_RESOURCES, type Resource } from "@/content/resources";

function ResourceRow({ r }: { r: Resource }) {
  return (
    <a
      href={r.href}
      target={r.href.startsWith("http") ? "_blank" : undefined}
      rel="noreferrer"
      className={`btn-3d block rounded-2xl border-2 p-4 ${
        r.urgent ? "border-coral-dark bg-coral text-white" : "border-line bg-white"
      }`}
    >
      <p className="font-black">{r.name}</p>
      <p className={`text-sm ${r.urgent ? "text-white/90" : "text-ink-soft"}`}>{r.what}</p>
      <p className={`mt-1 font-extrabold ${r.urgent ? "" : "text-sky-dark"}`}>{r.action} →</p>
    </a>
  );
}

export default function HelpPage() {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-black">Get real help</h1>
        <p className="text-ink-soft">
          Cloudbreak is peer support, not a counselor. These are run by trained adults, and they&apos;re free.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-black text-coral-dark">If you&apos;re not safe right now</h2>
        {CRISIS_RESOURCES.map((r) => (
          <ResourceRow key={r.name} r={r} />
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-black">Free help quitting nicotine</h2>
        {QUIT_RESOURCES.map((r) => (
          <ResourceRow key={r.name} r={r} />
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-black">For parents &amp; schools</h2>
        <p className="text-sm text-ink-soft">
          Research-backed programs that give students support instead of only punishment.
        </p>
        {SCHOOL_RESOURCES.map((r) => (
          <ResourceRow key={r.name} r={r} />
        ))}
      </section>

      <section id="ab2711" className="rounded-[1.25rem] bg-grass-soft p-5">
        <p className="text-xs font-extrabold uppercase tracking-wide text-grass-dark">California students</p>
        <h2 className="mt-1 text-2xl font-black">Asking for help can&apos;t get you suspended</h2>
        <p className="mt-2">
          In California, if you tell your school you&apos;ve been using a tobacco product{" "}
          <em>because you want help</em>, you can&apos;t be suspended just for telling them. This applies to
          public and charter schools. Most students don&apos;t know this law exists.
        </p>
        <blockquote className="mt-3 border-l-4 border-grass pl-3 text-sm font-semibold italic">
          “{AB2711.quote}”
        </blockquote>
        <p className="mt-2 text-xs text-ink-soft">
          {AB2711.citation}, added by {AB2711.bill}.{" "}
          <a href={AB2711.href} target="_blank" rel="noreferrer" className="font-bold text-sky-dark underline">
            Read the law
          </a>
        </p>
        <p className="mt-3 text-xs text-ink-soft">
          Does it cover vapes? California&apos;s Education Code (§48901(d)) defines &quot;tobacco product&quot; using
          Business &amp; Professions Code §22950.5(d), which includes electronic cigarettes. What it covers: telling
          them, voluntarily, to get help. It doesn&apos;t cover being caught. This is general information, not legal
          advice.
        </p>
      </section>
    </div>
  );
}
