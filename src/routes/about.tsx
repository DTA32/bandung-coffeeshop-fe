import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: About,
})

function About() {
  return (
    <main className="flex-1 md:px-8 py-12">
      <section className="rounded-2xl p-6 sm:p-8 text-forest">
        <p className="mb-2">About</p>
        <h1 className="mb-3 text-4xl font-bold sm:text-5xl">
          Under construction 🚧
        </h1>
        <p className="m-0 max-w-3xl text-base leading-8"></p>
      </section>
    </main>
  )
}
