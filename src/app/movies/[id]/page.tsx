// app/movies/[id]/page.tsx
export default function MoviePage({
  params
}: {
  params: { id: string }
}) {
  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold">Movie Details</h1>
      <p className="mt-4 text-gray-400">
        Details for movie ID: {params.id}
      </p>
    </div>
  );
}
