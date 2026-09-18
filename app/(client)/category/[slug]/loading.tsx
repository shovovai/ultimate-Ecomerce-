import Container from "@/components/Container";

export default function CategoryDetailLoading() {
  return (
    <Container className="py-10">
      <div className="mb-10 h-44 animate-pulse rounded-[2rem] bg-sand" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="aspect-square animate-pulse rounded-2xl bg-sand" />
        ))}
      </div>
    </Container>
  );
}
