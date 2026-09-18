import Container from "@/components/Container";

export default function CategoryLoading() {
  return (
    <Container className="py-10">
      <div className="mb-10 h-12 w-72 animate-pulse rounded-full bg-sand" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-[4/5] animate-pulse rounded-3xl bg-sand" />
        ))}
      </div>
    </Container>
  );
}
